<template>
  <div id="app">
    <loader-overlay />

    <the-tray-control
      v-if="userAuthenticated"
      v-show="!sidebarCurrentType"
    />

    <div class="row h-100">
      <div
        id="nav-container"
        class="col-md-2 px-0"
      >
        <navbar />
      </div>

      <div
        id="main-container"
        class="col-md-8"
      >
        <keep-alive>
          <router-view />
        </keep-alive>

        <the-data-last-updated-indicator />
      </div>

      <div
        id="sidebar-container"
        :class="{ active: sidebarCurrentType }"
        class="col-md-2 px-0"
      >
        <the-logout-link
          v-if="userAuthenticated"
          v-show="!sidebarCurrentType"
        />

        <the-sidebar />

        <the-feedback-link />
      </div>

    </div>

    <course-observer />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Navbar from 'components/TheNavbar'
import LoaderOverlay from 'components/TheLoaderOverlay'
import CourseObserver from 'components/course-observer'
import TheLogoutLink from 'components/TheLogoutLink'
import TheSidebar from 'components/TheSidebar'
import TheFeedbackLink from 'components/TheFeedbackLink'
import TheTrayControl from 'components/TheTrayControl'
import TheDataLastUpdatedIndicator from 'components/TheDataLastUpdatedIndicator'

export default {
  components: {
    Navbar,
    LoaderOverlay,
    CourseObserver,
    TheLogoutLink,
    TheSidebar,
    TheFeedbackLink,
    TheTrayControl,
    TheDataLastUpdatedIndicator
  },
  computed: {
    ...mapGetters('user', ['userAuthenticated']),
    ...mapGetters('app', ['sidebarCurrentType'])
  },
  mounted () {
    // load initial data
    this.$store.dispatch('user/getUserData')
  }
}
</script>

<style lang="scss" scoped>
#nav-container,
#main-container,
#sidebar-container {
  overflow: auto;
}

#nav-container,
#sidebar-container.active {
  background-color: #000;
  color: #fff;
}
</style>
