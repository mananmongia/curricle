<template>
  <div class="pt-3 px-3">
    <div class="your-tray-parent clearfix">
      <p>Your Tray
        <font-awesome-icon
          class="pointer float-right"
          icon="times"
          @click="closeSidebar"
        />
      </p>
      <hr>
      <div class="actions mx-0">
        <view-selector :invert="true" />
        <share-link />
      </div>
    </div>

    <div class="mx-0">
      <sidebar-list
        v-show="viewmode.tray === 'list-view'"
      />

      <sidebar-semester
        v-show="viewmode.tray=='semester'"
      />

      <multi-year-sidebar
        v-show="viewmode.tray=='multi-year'"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import ViewSelector from 'components/shared/view-selector'
import MultiYearSidebar from 'components/tray/multi-year-sidebar'
import ShareLink from 'components/tray/TrayShareLink'
import SidebarList from 'components/tray/SidebarList'
import SidebarSemester from 'components/tray/SidebarSemester'

export default {
  components: {
    FontAwesomeIcon,
    MultiYearSidebar,
    ViewSelector,
    ShareLink,
    SidebarList,
    SidebarSemester
  },
  computed: {
    ...mapState('app', ['viewmode'])
  },
  methods: {
    ...mapActions('app', ['closeSidebar'])
  }
}
</script>
