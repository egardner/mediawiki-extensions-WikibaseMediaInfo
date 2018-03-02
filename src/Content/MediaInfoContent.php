<?php

namespace Wikibase\MediaInfo\Content;

use Hooks;
use InvalidArgumentException;
use LogicException;
use Wikibase\Content\EntityHolder;
use Wikibase\EntityContent;
use Wikibase\MediaInfo\DataModel\MediaInfo;
use Wikibase\Repo\FingerprintSearchTextGenerator;

/**
 * @license GPL-2.0-or-later
 * @author Bene* < benestar.wikimedia@gmail.com >
 */
class MediaInfoContent extends EntityContent {

	const CONTENT_MODEL_ID = 'wikibase-mediainfo';

	/**
	 * @var EntityHolder|null
	 */
	private $mediaInfoHolder;

	/**
	 * Do not use to construct new stuff from outside of this class,
	 * use the static newFoobar methods.
	 *
	 * In other words: treat as protected (which it was, but now
	 * cannot be since we derive from Content).
	 *
	 * @protected
	 *
	 * @param EntityHolder|null $mediaInfoHolder
	 * @throws InvalidArgumentException
	 */
	public function __construct( EntityHolder $mediaInfoHolder = null ) {
		parent::__construct( self::CONTENT_MODEL_ID );

		if ( $mediaInfoHolder !== null
			&& $mediaInfoHolder->getEntityType() !== MediaInfo::ENTITY_TYPE
		) {
			throw new InvalidArgumentException( '$mediaInfoHolder must contain a MediaInfo entity' );
		}

		$this->mediaInfoHolder = $mediaInfoHolder;
	}

	/**
	 * @return MediaInfo
	 */
	public function getMediaInfo() {
		if ( !$this->mediaInfoHolder ) {
			throw new LogicException( 'This content object is empty!' );
		}

		return $this->mediaInfoHolder->getEntity( MediaInfo::class );
	}

	/**
	 * @see EntityContent::getEntity
	 *
	 * @return MediaInfo
	 */
	public function getEntity() {
		return $this->getMediaInfo();
	}

	/**
	 * @see EntityContent::getEntityHolder
	 *
	 * @return EntityHolder|null
	 */
	protected function getEntityHolder() {
		return $this->mediaInfoHolder;
	}

	/**
	 * @see EntityContent::isEmpty
	 *
	 * @return bool
	 */
	public function isEmpty() {
		return !$this->isRedirect() && $this->getMediaInfo()->isEmpty();
	}

	/**
	 * @see EntityContent::isCountable
	 *
	 * @param bool|null $hasLinks
	 *
	 * @return bool
	 */
	public function isCountable( $hasLinks = null ) {
		return !$this->isRedirect() && !$this->getMediaInfo()->isEmpty();
	}

	/**
	 * @see EntityContent::getTextForSearchIndex
	 *
	 * @return string
	 */
	public function getTextForSearchIndex() {
		if ( $this->isRedirect() ) {
			return '';
		}

		$searchTextGenerator = new FingerprintSearchTextGenerator();
		$text = $searchTextGenerator->generate( $this->getMediaInfo() );

		if ( !Hooks::run( 'WikibaseTextForSearchIndex', [ $this, &$text ] ) ) {
			return '';
		}

		return $text;
	}

}
