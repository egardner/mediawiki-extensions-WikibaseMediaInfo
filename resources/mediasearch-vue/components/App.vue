<template>
	<div class="" id="app">
		<search-input 
			v-bind:initial-term="term"
			v-on:update="onUpdateTerm"
		/>

		<!-- Generate a tab for each key in the "results" object. Data types,
		messages, and loading behavior are bound to this key. -->
		<tabs v-bind:active="currentTab"
			v-on:tab-change="onTabChange">

			<tab v-for="tab in tabs"
				v-bind:name="tab"
				v-bind:title="tabNames[ tab ]"
				v-bind:key="tab">

				<search-results v-bind:media-type="tab" />
				<observer v-on:intersect="getMoreResultsForTabIfAvailable( tab )" />
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
	Observer = require( './base/Observer.vue'),
	url = new mw.Uri();

module.exports = {
	name: 'MediaSearch',

	components: {
		tabs: Tabs,
		tab: Tab,
		'search-input': SearchInput,
		'search-results': SearchResults,
		'observer': Observer
	},

	data: function () {
		return {
			currentTab: url.query.type || '',
			term: url.query.q || ''
		};
	},

	computed: $.extend( {}, mapState( [
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
		'resetResults'
	] ), mapActions( [
		'search'
	] ), {
		onTabChange: function ( newTab ) {
			this.currentTab = newTab.name;
			this.getMoreResultsForTabIfAvailable( newTab.name );
		},

		onUpdateTerm: function ( newTerm ) {
			this.term = newTerm;
		},

		/**
		 * Determine if we have more data to load for the tab; If so, make an
		 * API request to get them, and add them to the appropriate queue.
		 * Finally, update "continue" and/or "hasmore" properties based on the
		 * results of the latest request.
		 */
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

		/**
		 * 
		 */
		performNewSearch: function () {
			this.resetResults();

			this.search( { 
				term: this.term,
				type: this.currentTab 
			} );
		}
	} ),

	watch: {
		/**
		 * Ensure that "type" query params stay in sync with current active tab
		 * in the UI
		 */
		currentTab: function ( newTab ) {
			url.query.type = newTab;
			window.history.replaceState( null, null, '?' + url.getQueryString() );
		},

		/**
		 * Ensure that the "q" query params stay in sync with current query
		 * input from user
		 */
		term: function ( newTerm, oldTerm ) {
			url.query.q = newTerm;
			window.history.replaceState( null, null, '?' + url.getQueryString() )

			if ( newTerm && newTerm !== oldTerm ) {
				this.performNewSearch();
			}
		}
	},

	/**
	 * Watch the URL for changes to query params
	 */
	mounted: function () {
	},

	beforeDestroy: function () {
	}
};
</script>

<style lang="less">

</style>