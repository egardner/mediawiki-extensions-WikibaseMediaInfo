<?php

namespace Wikibase\MediaInfo\Tests\Integration;

use Hooks;
use PHPUnit_Framework_TestCase;

/**
 * @covers Wikibase\MediaInfo\WikibaseMediaInfoHooks
 *
 * @license GPL-2.0+
 * @author Bene* < benestar.wikimedia@gmail.com >
 */
class WikibaseMediaInfoHooksTest extends PHPUnit_Framework_TestCase {

	public function testOnUnitTestsList() {
		$paths = [];

		Hooks::run( 'UnitTestsList', [ &$paths ] );

		$paths = array_map( 'realpath', $paths );
		$expected = realpath( __DIR__ . '/../' );

		$this->assertContains( $expected, $paths );
	}

	public function testOnWikibaseRepoEntityTypes() {
		$entityTypeDefinitions = [
			'item' => [ 'foo', 'bar' ]
		];

		Hooks::run( 'WikibaseRepoEntityTypes', [ &$entityTypeDefinitions ] );

		$this->assertArrayHasKey( 'item', $entityTypeDefinitions );
		$this->assertSame( [ 'foo', 'bar' ], $entityTypeDefinitions['item'] );

		$this->assertArrayHasKey( 'mediainfo', $entityTypeDefinitions );
	}

	public function testOnWikibaseClientEntityTypes() {
		$entityTypeDefinitions = [
			'item' => [ 'foo', 'bar' ]
		];

		Hooks::run( 'WikibaseClientEntityTypes', [ &$entityTypeDefinitions ] );

		$this->assertArrayHasKey( 'item', $entityTypeDefinitions );
		$this->assertSame( [ 'foo', 'bar' ], $entityTypeDefinitions['item'] );

		$this->assertArrayHasKey( 'mediainfo', $entityTypeDefinitions );
	}

}
