<?php

namespace Wikibase\MediaInfo\DataModel;

use InvalidArgumentException;
use Wikibase\DataModel\Entity\EntityId;

/**
 * Identifier for media info entities, containing a numeric id prefixed by 'M'.
 *
 * @since 0.1
 *
 * @license GPL-2.0+
 * @author Bene* < benestar.wikimedia@gmail.com >
 */
class MediaInfoId extends EntityId {

	const PATTERN = '/^M[1-9]\d*\z/i';

	/**
	 * @param string $idSerialization
	 *
	 * @throws InvalidArgumentException
	 */
	public function __construct( $idSerialization ) {
		$this->assertValidIdFormat( $idSerialization );
		$this->serialization = strtoupper( $idSerialization );
	}

	private function assertValidIdFormat( $idSerialization ) {
		if ( !is_string( $idSerialization ) ) {
			throw new InvalidArgumentException( '$idSerialization must be a string' );
		}

		if ( !preg_match( self::PATTERN, $idSerialization ) ) {
			throw new InvalidArgumentException( '$idSerialization must match ' . self::PATTERN );
		}
	}

	/**
	 * @deprecated Avoid using this as long as the implementation does not guarantee this does not
	 * overflow on 32 bit systems.
	 * @see https://github.com/wmde/WikibaseDataModel/pull/670
	 *
	 * @return int The numeric part of the ID, casted to an integer.
	 */
	public function getNumericId() {
		return (int)substr( $this->serialization, 1 );
	}

	/**
	 * @see EntityId::getEntityType
	 *
	 * @return string
	 */
	public function getEntityType() {
		return 'mediainfo';
	}

	/**
	 * @see Serializable::serialize
	 *
	 * @return string
	 */
	public function serialize() {
		return $this->serialization;
	}

	/**
	 * @see Serializable::unserialize
	 *
	 * @param string $value
	 */
	public function unserialize( $value ) {
		$this->serialization = $value;
	}

}
