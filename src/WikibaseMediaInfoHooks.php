<?php

namespace Wikibase\MediaInfo;

use AbstractContent;
use CirrusSearch\Connection;
use CirrusSearch\Search\CirrusIndexField;
use Content;
use DatabaseUpdater;
use Elastica\Document;
use MediaWiki\MediaWikiServices;
use MediaWiki\Revision\SlotRecord;
use OutputPage;
use ParserOutput;
use Title;
use Wikibase\DataModel\Entity\EntityId;
use Wikibase\DataModel\Services\EntityId\EntityIdComposer;
use Wikibase\Lib\Store\EntityByLinkedTitleLookup;
use Wikibase\Lib\UserLanguageLookup;
use Wikibase\MediaInfo\Content\MediaInfoContent;
use Wikibase\MediaInfo\Content\MediaInfoHandler;
use Wikibase\MediaInfo\DataModel\MediaInfo;
use Wikibase\MediaInfo\Services\MediaInfoByLinkedTitleLookup;
use Wikibase\Repo\BabelUserLanguageLookup;
use Wikibase\Repo\MediaWikiLocalizedTextProvider;
use Wikibase\Repo\Store\EntityTitleStoreLookup;
use Wikibase\Repo\WikibaseRepo;
use WikiPage;

/**
 * MediaWiki hook handlers for the Wikibase MediaInfo extension.
 *
 * @license GPL-2.0-or-later
 * @author Bene* < benestar.wikimedia@gmail.com >
 */
class WikibaseMediaInfoHooks {

	/**
	 * @var EntityIdComposer
	 */
	private $entityIdComposer;

	/**
	 * @var EntityTitleStoreLookup
	 */
	private $entityTitleStoreLookup;

	private static function newFromGlobalState() {
		$wikibaseRepo = WikibaseRepo::getDefaultInstance();

		return new self(
			$wikibaseRepo->getEntityIdComposer(),
			$wikibaseRepo->getEntityTitleLookup()
		);
	}

	/**
	 * WikibaseMediaInfoHooks constructor.
	 * @param EntityIdComposer $entityIdComposer
	 * @param EntityTitleStoreLookup $entityTitleStoreLookup
	 * @codeCoverageIgnore
	 */
	public function __construct(
		EntityIdComposer $entityIdComposer,
		EntityTitleStoreLookup $entityTitleStoreLookup
	) {
		$this->entityIdComposer = $entityIdComposer;
		$this->entityTitleStoreLookup = $entityTitleStoreLookup;
	}

	/**
	 * Hook to register the MediaInfo entity namespaces for EntityNamespaceLookup.
	 *
	 * @param array $entityNamespacesSetting
	 */
	public static function onWikibaseRepoEntityNamespaces( &$entityNamespacesSetting ) {
		// Exit if the extension is disabled.
		if ( !MediaWikiServices::getInstance()->getMainConfig()->get( 'MediaInfoEnable' ) ) {
			return;
		}

		$entityNamespacesSetting[ MediaInfo::ENTITY_TYPE ] = NS_FILE . '/' . MediaInfo::ENTITY_TYPE;
	}

	/**
	 * Adds the definition of the media info entity type to the definitions array Wikibase uses.
	 *
	 * @see WikibaseMediaInfo.entitytypes.php
	 *
	 * @note: This is bootstrap code, it is executed for EVERY request. Avoid instantiating
	 * objects or loading classes here!
	 *
	 * @param array[] $entityTypeDefinitions
	 */
	public static function onWikibaseEntityTypes( array &$entityTypeDefinitions ) {
		// Exit if the extension is disabled.
		if ( !MediaWikiServices::getInstance()->getMainConfig()->get( 'MediaInfoEnable' ) ) {
			return;
		}

		$entityTypeDefinitions = array_merge(
			$entityTypeDefinitions,
			require __DIR__ . '/../WikibaseMediaInfo.entitytypes.php'
		);
	}

	/**
	 * DIRTY HACK PART ONE that won't be necessary when T205444 is done
	 * @see https://phabricator.wikimedia.org/T205444
	 *
	 * The placeholder mw:slotheader is replaced by default with the name of the slot
	 *
	 * Replace it with a different placeholder so we can replace it with a message later
	 * (can't replace it directly because accessing the RequestContext here throws
	 * an exception)
	 *
	 * @param ParserOutput $parserOutput
	 * @param $text
	 * @param array $options
	 */
	public static function onParserOutputPostCacheTransform(
		ParserOutput $parserOutput,
		&$text,
		array $options
	) {
		// Exit if the extension is disabled.
		if ( !MediaWikiServices::getInstance()->getMainConfig()->get( 'MediaInfoEnable' ) ) {
			return;
		}

		$text = preg_replace(
			'#<mw:slotheader>(.*?)</mw:slotheader>#',
			'<mw:mediainfoslotheader />',
			$text
		);
	}

	/**
	 * Check if we're on a file page, add data and modules if so
	 *
	 * @param \OutputPage $out
	 * @param \Skin $skin
	 */
	public static function onBeforePageDisplay( $out, $skin ) {
		// Exit if the extension is disabled.
		if ( !MediaWikiServices::getInstance()->getMainConfig()->get( 'MediaInfoEnable' ) ) {
			return;
		}

		$allLanguages = \Language::fetchLanguageNames();
		$termsLanguages = WikibaseRepo::getDefaultInstance()->getTermsLanguages()->getLanguages();

		self::newFromGlobalState()->doBeforePageDisplay(
			$out,
			$skin,
			array_intersect_key(
				$allLanguages,
				array_flip( $termsLanguages )
			),
			new BabelUserLanguageLookup()
		);
	}

	/**
	 * DIRTY HACK PART TWO that won't be necessary when T205444 is done
	 * @see https://phabricator.wikimedia.org/T205444
	 * @param OutputPage $out
	 * @return OutputPage $out
	 */
	private function replaceMediaInfoSlotHeader( OutputPage $out ) {
		$textProvider = new MediaWikiLocalizedTextProvider(
			$out->getLanguage()->getCode()
		);

		$html = $out->getHTML();
		$out->clearHTML();
		$html = str_replace(
			'<mw:mediainfoslotheader />',
			htmlspecialchars(
				$textProvider->get( 'wikibasemediainfo-filepage-structured-data-heading' )
			),
			$html
		);
		$out->addHTML( $html );
		return $out;
	}

	/**
	 * @param \OutputPage $out
	 * @param \Skin $skin
	 * @param string[] $termsLanguages Array with language codes as keys and autonyms as values
	 * @param UserLanguageLookup $userLanguageLookup
	 */
	public function doBeforePageDisplay(
		$out,
		$skin,
		array $termsLanguages,
		UserLanguageLookup $userLanguageLookup
	) {
		$out->preventClickjacking();
		$imgTitle = $out->getTitle();
		if ( !$imgTitle->exists() || !$imgTitle->inNamespace( NS_FILE ) ) {
			return;
		}

		$out = $this->replaceMediaInfoSlotHeader( $out );

		$pageId = $imgTitle->getArticleID();
		$entityId = $this->entityIdFromPageId( $pageId );

		$out->addJsConfigVars( [
			'wbUserSpecifiedLanguages' => $userLanguageLookup->getAllUserLanguages(
				$out->getUser()
			),
			'wbCurrentRevision' => $out->getWikiPage()->getRevision()->getId(),
			'wbEntityId' => $entityId->getSerialization(),
			'wbTermsLanguages' => $termsLanguages,
			'wbRepoApiUrl' => wfScript( 'api' ),
			'maxCaptionLength' => self::getMaxCaptionLength(),
		] );

		$out->addModuleStyles( [
			'wikibase.mediainfo.filepagestyles',
		] );

		$out->addModules( 'wikibase.mediainfo.filePageDisplay' );
	}

	private static function getMaxCaptionLength() {
		global $wgWBRepoSettings;
		return $wgWBRepoSettings['string-limits']['multilang']['length'];
	}

	/**
	 * The ID for a MediaInfo item is the same as the ID of its associated File page, with an
	 * 'M' prepended - this is encapsulated by EntityIdComposer::composeEntityId()
	 *
	 * @param int $pageId
	 * @return EntityId
	 */
	private function entityIdFromPageId( $pageId ) {
		return $this->entityIdComposer->composeEntityId(
			'',
			MediaInfo::ENTITY_TYPE,
			$pageId
		);
	}

	/**
	 * Schema changes.
	 * Hook: LoadExtensionSchemaUpdates
	 *
	 * @param DatabaseUpdater $updater
	 */
	public static function onLoadExtensionSchemaUpdates( DatabaseUpdater $updater ) {
		$updater->addPostDatabaseUpdateMaintenance( 'Wikibase\\MediaInfo\\Maintenance\\CreatePageProps' );
	}

	/**
	 * Add a page_props referencing the MediaInfo entity.
	 * LinksUpdate.php will fetch the props from ParserOutput & store them to DB right after
	 * creating a page, so we just have to add the page_props entry there.
	 * This is preferable to adding in DB after upload (say FileUpload hook), because it would get
	 * wiped out once LinksUpdate runs...
	 *
	 * Hook: ContentAlterParserOutput
	 *
	 * @param Content $content
	 * @param Title $title
	 * @param ParserOutput $output
	 */
	public static function onContentAlterParserOutput(
		Content $content,
		Title $title,
		ParserOutput $output
	) {
		// Exit if the extension is disabled.
		if ( !MediaWikiServices::getInstance()->getMainConfig()->get( 'MediaInfoEnable' ) ) {
			return;
		}

		if ( !$title->inNamespace( NS_FILE ) ) {
			return;
		}

		if ( $output->getProperty( 'mediainfo_entity' ) !== false ) {
			return;
		}

		$pageId = $title->getArticleID();
		if ( $pageId === 0 ) {
			return;
		}

		$wikibaseRepo = WikibaseRepo::getDefaultInstance();
		$entityId = $wikibaseRepo->getEntityIdComposer()->composeEntityId(
			'',
			MediaInfo::ENTITY_TYPE,
			$pageId
		);

		$output->setProperty( 'mediainfo_entity', $entityId->getLocalPart() );
	}

	public static function onGetEntityByLinkedTitleLookup( EntityByLinkedTitleLookup &$lookup ) {
		$lookup = new MediaInfoByLinkedTitleLookup( $lookup );
	}

	/**
	 * Note that this is a workaround until all slots are passed automatically to CirrusSearch
	 *
	 * @see https://phabricator.wikimedia.org/T190066
	 */
	public static function onCirrusSearchBuildDocumentParse(
		Document $document,
		Title $title,
		AbstractContent $contentObject,
		ParserOutput $parserOutput,
		Connection $connection
	) {
		// Exit if the extension is disabled.
		if ( !MediaWikiServices::getInstance()->getMainConfig()->get( 'MediaInfoEnable' ) ) {
			return;
		}
		self::newFromGlobalState()->doCirrusSearchBuildDocumentParse(
			$document,
			WikiPage::factory( $title ),
			\ContentHandler::getForModelID( MediaInfoContent::CONTENT_MODEL_ID )
		);
	}

	public function doCirrusSearchBuildDocumentParse(
		Document $document,
		WikiPage $page,
		MediaInfoHandler $handler
	) {
		$revisionRecord = $page->getRevisionRecord();
		if (
			!is_null( $revisionRecord ) && $revisionRecord->hasSlot( MediaInfo::ENTITY_TYPE )
		) {
			/** @var SlotRecord $mediaInfoSlot */
			$mediaInfoSlot = $page->getRevisionRecord()->getSlot( MediaInfo::ENTITY_TYPE );

			$engine = new \CirrusSearch();
			$fieldDefinitions = $handler->getFieldsForSearchIndex( $engine );
			$slotData = $handler->getSlotDataForSearchIndex(
				$mediaInfoSlot->getContent()
			);
			foreach ( $slotData as $field => $fieldData ) {
				$document->set( $field, $fieldData );
				if ( isset( $fieldDefinitions[$field] ) ) {
					$hints = $fieldDefinitions[$field]->getEngineHints( $engine );
					CirrusIndexField::addIndexingHints( $document, $field, $hints );
				}
			}
		}
	}

}
