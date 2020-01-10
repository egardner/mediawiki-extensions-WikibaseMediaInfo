<?php

use Wikibase\DataAccess\ByTypeDispatchingPrefetchingTermLookup;
use Wikibase\DataAccess\DataAccessSettings;
use Wikibase\DataAccess\GenericServices;
use Wikibase\DataAccess\PerRepositoryServiceContainer;
use Wikibase\MediaInfo\Services\MediaInfoPrefetchingTermLookup;
use Wikibase\Store\BufferingTermIndexTermLookup;

return [

	'PrefetchingTermLookup' => function (
		PerRepositoryServiceContainer $services,
		GenericServices $genericServices,
		DataAccessSettings $settings
	) {
		return new ByTypeDispatchingPrefetchingTermLookup(
			[ 'mediainfo' => new MediaInfoPrefetchingTermLookup( $services->getEntityRevisionLookup() ) ],
			new BufferingTermIndexTermLookup( $services->getService( 'TermIndex' ), 1000 )
		);
	},

];
