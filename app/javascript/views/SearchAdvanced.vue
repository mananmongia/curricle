<template>
  <div class="py-5">
    <h3>Advanced Search:</h3>

    <search-form v-if="userAuthenticated" />

    <search-results v-show="results.length" />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { deserializeSearch } from 'lib/util'

import SearchForm from 'components/search/advanced/SearchForm'
import SearchResults from 'components/search/SearchResults'

export default {
  components: {
    SearchForm,
    SearchResults
  },
  computed: {
    ...mapGetters('user', ['userAuthenticated']),
    ...mapState('search', ['results'])
  },
  mounted () {
    this.$store.commit('search/RESET_RESULTS')

    if (this.$route.params[0]) {
      var obj = deserializeSearch(this.$route)
      if (obj) {
        this.$store.dispatch('search/populateSearchState', obj)
          .then(
            () => this.$store.dispatch('search/runKeywordSearch')
          )
      }
    }
  }
}
</script>
