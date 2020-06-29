<template>
	<div id="app" class="">
		<search-input :initial-term="term" @update="onUpdateTerm"></search-input>

		<!-- Generate a tab for each key in the "results" object. Data types,
		messages, and loading behavior are bound to this key. -->
		<tabs :active="currentTab" @tab-change="onTabChange">
			<tab v-for="tab in tabs"
				:key="tab"
				:name="tab"
				:title="tabNames[ tab ]">
				<search-results :media-type="tab"></search-results>
				<observer @intersect="getMoreResultsForTabIfAvailable( tab )"></observer>
				<p v-if="pending[ tab ]">
					Loading...
				</p>
			</tab>
		</tabs>
	</div>
</template>

<script>
var mapState = require( 'vuex' ).mapState,
	mapGetters = require( 'vuex' ).mapGetters,
	mapMutations = require( 'vuex' ).mapMutations,
	mapActions = require( 'vuex' ).mapActions,
	Tab = require( './base/Tab.vue' ),
	Tabs = require( './base/Tabs.vue' ),
	SearchInput = require( './SearchInput.vue' ),
	SearchResults = require( './SearchResults.vue' ),
	Observer = require( './base/Observer.vue' ),
	url = new mw.Uri();

module.exports = {
	name: 'MediaSearch',

	components: {
		tabs: Tabs,
		tab: Tab,
		'search-input': SearchInput,
		'search-results': SearchResults,
		observer: Observer
	},

	data: function () {
		return {
			currentTab: url.query.type || ''
		};
	},

	computed: $.extend( {}, mapState( [
		'term',
		'results',
		'continue',
		'pending'
	] ), mapGetters( [
		'hasMore'
	] ), {

		tabs: function () {
			return Object.keys( this.results );
		},

		tabNames: function () {
			var names = {},
				prefix = 'wikibasemediainfo-special-mediasearch-tab-';

			// Get the i18n message for each tab title and assign to appropriate
			// key in returned object
			this.tabs.forEach( function ( tab ) {
				names[ tab ] = this.$i18n( prefix + tab ).text();
			}.bind( this ) );

			return names;
		}
	} ),

	methods: $.extend( {}, mapMutations( [
		'resetResults',
		'setTerm'
	] ), mapActions( [
		'search'
	] ), {
		onTabChange: function ( newTab ) {
			this.currentTab = newTab.name;
			this.getMoreResultsForTabIfAvailable( newTab.name );
		},

		onUpdateTerm: function ( newTerm ) {
			this.setTerm( newTerm );
		},

		getMoreResultsForTabIfAvailable: function ( tab ) {
			if ( this.hasMore[ tab ] && !this.pending[ tab ] ) {
				// If more results are available, and if another request is not
				// already pending, then launch a search request
				this.search( {
					term: this.term,
					type: this.currentTab
				} );
			} else if ( this.hasMore[ tab ] && this.pending[ tab ] ) {
				// If more results are available but another request is
				// currently in-flight, attempt to make the request again
				// after some time has passed
				window.setTimeout(
					this.getMoreResultsForTabIfAvailable.bind( this, tab ),
					2000
				);
			}
		},

		performNewSearch: function () {
			this.resetResults();

			this.search( {
				term: this.term,
				type: this.currentTab
			} );
		}
	} ),

	watch: {
		currentTab: function ( newTab ) {
			url.query.type = newTab;
			window.history.replaceState( null, null, '?' + url.getQueryString() );
		},

		term: function ( newTerm, oldTerm ) {
			url.query.q = newTerm;
			window.history.replaceState( null, null, '?' + url.getQueryString() );

			if ( newTerm && newTerm !== oldTerm ) {
				this.performNewSearch();
			}
		}
	}
};
</script>

<style lang="less">
</style>
