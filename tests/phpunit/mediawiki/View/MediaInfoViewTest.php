<?php

namespace Wikibase\MediaInfo\Tests\MediaWiki\View;

use MediaWiki\MediaWikiServices;
use Wikibase\DataModel\Entity\EntityDocument;
use Wikibase\DataModel\Entity\Property;
use Wikibase\DataModel\Entity\PropertyId;
use Wikibase\DataModel\Term\TermList;
use Wikibase\MediaInfo\DataModel\MediaInfo;
use Wikibase\MediaInfo\View\MediaInfoEntityStatementsView;
use Wikibase\MediaInfo\View\MediaInfoEntityTermsView;
use Wikibase\MediaInfo\View\MediaInfoView;
use Wikibase\View\EntityTermsView;
use Wikibase\View\LanguageDirectionalityLookup;
use Wikibase\View\Template\TemplateFactory;

/**
 * @covers \Wikibase\MediaInfo\View\MediaInfoView
 *
 * @group WikibaseMediaInfo
 *
 * @license GPL-2.0-or-later
 */
class MediaInfoViewTest extends \PHPUnit\Framework\TestCase {

	private $values = [
		'entityType' => 'TEST_TYPE',
		'entityId' => 'P999'
	];
	/** @var  \Wikibase\View\Template\TemplateFactory */
	private $templateFactory;
	/** @var  EntityTermsView */
	private $entityTermsView;
	/** @var  MediaInfoEntityStatementsView */
	private $statementsView;
	/** @var  LanguageDirectionalityLookup */
	private $languageDirectionalityLookup;
	/** @var  EntityDocument */
	private $entity;
	/** @var string  */
	private $languageCode = 'qqq';
	/** @var  MediaInfoView */
	private $sut;

	private function createMocks() {
		$this->templateFactory = $this->getMockBuilder( TemplateFactory::class )
			->disableOriginalConstructor()
			->getMock();
		$this->entityTermsView = $this->getMockBuilder( MediaInfoEntityTermsView::class )
			->disableOriginalConstructor()
			->getMock();
		$this->languageDirectionalityLookup = $this->getMockBuilder(
			LanguageDirectionalityLookup::class
			)->disableOriginalConstructor()
			->getMock();
		$this->statementsView = $this->getMockBuilder(
			MediaInfoEntityStatementsView::class
			)
			->disableOriginalConstructor()
			->getMock();

		$this->entity = $this->getMockBuilder( MediaInfo::class )
			->disableOriginalConstructor()
			->getMock();
		$this->entity->method( 'getType' )
			->willReturn( $this->values['entityType'] );
		$this->entity->method( 'getID' )
			->willReturn( new PropertyId( $this->values['entityId'] ) );
		$this->entity->method( 'getLabels' )
			->willReturn( new TermList( [] ) );
		$this->entity->method( 'getDescriptions' )
			->willReturn( new TermList( [] ) );

		$this->sut = new MediaInfoView(
			$this->templateFactory,
			$this->entityTermsView,
			$this->languageDirectionalityLookup,
			$this->languageCode,
			$this->statementsView
		);
	}

	public function testGetContent() {
		$this->createMocks();

		$langDir = 'TEST_DIR';
		$termsViewHtml = 'TEST_TERMS_HTML';
		$statementsViewHtml = 'TEST_STATEMENTS_HTML';
		$renderedContent = 'TEST_RENDERED';

		$this->languageDirectionalityLookup
			->method( 'getDirectionality' )
			->willReturn( $langDir );
		$this->entityTermsView
			->method( 'getHtml' )
			->willReturn( $termsViewHtml );
		$this->statementsView
			->method( 'getHtml' )
			->willReturn( $statementsViewHtml );

		$html = $termsViewHtml;
		if (
			MediaWikiServices::getInstance()
				->getMainConfig()->get( 'MediaInfoEnableFilePageDepicts' )
		) {
			$html .= $statementsViewHtml;
		}

		$this->templateFactory
			->expects( $this->once() )
			->method( 'render' )
			->with(
				'filepage-entityview',
				$this->values['entityType'],
				$this->values['entityId'],
				$langDir,
				$html
			)->willReturn( $renderedContent );

		$viewContent = $this->sut->getContent( $this->entity );

		$this->assertEquals( $renderedContent, $viewContent->getHtml() );
		$this->assertSame( [], $viewContent->getPlaceholders() );
	}

	public function testGetContentException() {
		$this->createMocks();
		try {
			$this->sut->getContent( new Property( new PropertyId( 'P999' ), null, 'string' ) );
			$this->assertFalse(
				true,
				'Expected exception not thrown when invalid type passed'
			);
		} catch ( \Exception $e ) {
			$this->assertTrue( true );
		}
	}

}
