<template>
  <div class="window">
    <div class="window-content">
      <div class="pane-group">
        <!-- BEGIN: SIDEBAR -->
        <div class="pane-sm sidebar padded" style="overflow: auto;">
          <!-- BEGIN: VIEW TOGGLE -->
          <div class="btn-group">
            <button
              v-bind:class="{
                'btn': true,
                'btn-large': true,
                'btn-default': true,
                'active': currentView === 'data'
              }"
              v-on:click="currentView = 'data'"
            >
              <span class="icon icon-database"></span>
              Data
            </button>
            <button
              v-if="hasData"
              v-bind:class="{
                'btn': true,
                'btn-large': true,
                'btn-default': true,
                'active': currentView === 'chart'
              }"
              v-on:click="currentView = 'chart'"
            >
              <span class="icon icon-chart-bar"></span>
              Chart
            </button>
            <!-- Info pane -->
            <button
              v-bind:class="{
                'btn': true,
                'btn-large': true,
                'btn-default': true,
                'active': currentView === 'info'
              }"
              v-on:click="currentView = 'info'"
            >
              <span class="icon icon-info"></span>
            </button>
          </div>
          <!-- BEGIN OPTION VIEWER SIDEBAR CONTENTS -->
          <SidebarOptions
            v-bind:current-view="currentView"
          ></SidebarOptions>
        </div>
        <!-- BEGIN: MAIN CONTENT -->
        <div class="pane" style="background-color: rgb(230, 230, 230);">
          <DataViewer v-if="currentView === 'data' && hasData"></DataViewer>
          <template v-else-if="currentView === 'data'">
            <div class="padded-more">
              <h1>No data</h1>
              <p>Load a datafile, or add a new dataset to view it here.</p>
            </div>
          </template>
          <InfoViewer v-else-if="currentView === 'info'"></InfoViewer>
          <ChartViewer
            v-else
            ref="chart-viewer"
          ></ChartViewer>
        </div>
      </div>
    </div>

    <footer class="toolbar toolbar-footer">
      <h1 class="title">Charter <strong>v{{ charterVersion }}</strong>
      | &copy; 2021-{{ (new Date()).getFullYear() }} <a href="https://www.hendrik-erz.de/" target="_blank">Hendrik Erz</a>
      | Powered by <a href="https://vuejs.org/" rel="nofollow" target="_blank">Vue.js</a> and <a href="https://www.chartjs.org/" rel="nofollow" target="_blank">Chart.js</a>
      | <a href="https://github.com/nathanlesage/Charter" target="_blank">View Code on GitHub</a>
      | Handle with care ❤️</h1>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import DataViewer from './DataViewer.vue'
import ChartViewer from './ChartViewer.vue'
import InfoViewer from './InfoViewer.vue'
import SidebarOptions from './SidebarOptions.vue'
// import b64toBlob from 'b64-to-blob'
// import sanitize from 'sanitize-filename'
import { version } from '../package.json'

export default defineComponent({
  name: 'App',
  components: {
    DataViewer,
    ChartViewer,
    InfoViewer,
    SidebarOptions
  },
  data: function () {
    return {
      // selectedRow: -1, // Selected row in the data viewer
      // chartDimensions: '0x0px', // Purely informative, holds the actual chart dimensions
      currentView: 'data' as string, // Two views: data and chart
      // colours: {} as any, // Contains user-defined colours, solely generated in the sidebar
      // Dataset options are customisations for each single dataset that is loaded
      // datasetOptions: {} as any
    }
  },
  computed: {
    charterVersion: function (): string {
      return version
    },
    hasData: function (): boolean {
      return Object.keys(this.$store.state.dataset).length > 0
    }
  },
  watch: {
  },
  methods: {
  }
})
</script>

<style>
/*
  We have to explicitly allow user selection on all inputs. Otherwise, the app
  breaks on Safari (across all devices).
*/
input {
  -webkit-user-select: initial;
  user-select: initial;
}
</style>
