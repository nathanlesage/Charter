<template>
  <div class="window">
    <div class="window-content">
      <div class="pane-group">
        <!-- BEGIN: SIDEBAR -->
        <div class="pane-sm sidebar padded">
          <p><strong>Charter</strong></p>
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
          </div>
          <!-- BEGIN OPTION VIEWER SIDEBAR CONTENTS -->
          <SidebarOptions
            v-bind:current-view="currentView"
          ></SidebarOptions>
        </div>
        <!-- BEGIN: MAIN CONTENT -->
        <div class="pane">
          <DataViewer
            v-if="currentView === 'data'"
            v-model="dataset"
          ></DataViewer>
          <ChartViewer v-else></ChartViewer>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DataViewer from './DataViewer'
import ChartViewer from './ChartViewer'
import SidebarOptions from './SidebarOptions'

/**
 * A WORD ON THE DATA STRUCTURE AND HANDLING
 * 
 * As this app is extremely simple, we don't need Vue. However, a few notes on
 * how this data is being handled. In general, this app consists of four big
 * components: The App itself, a Chart and Data Viewers, and the Sidebar options.
 * 
 * Due to the layout, all the mingling with the config will be done in the
 * sidebar, while the results of said mingling will be visible in the viewers.
 * This means: The App controls all data, and binds the data to the viewers and
 * the options. Both the data viewer and the sidebar options may modify their
 * share of data, but the chart may not.
 *  
 */

export default {
  name: 'App',
  components: {
    DataViewer,
    ChartViewer,
    SidebarOptions
  },
  data: function () {
    return {
      currentView: 'data', // Two views: data and chart
      // This contains the overall dataset. As ChartJS allows for labels and
      // generally accepts simple number arrays, we will for now run with a
      // dictionary.
      dataset: {
        'Label 1': [ 1.4, 2.3, 6.5, 1.0, 6.2, 0.6 ],
        'Label 2': [ 1, 2, 6, 7, 8, 9, 10 ]
      },
      chartOptions: {} // This contains all the chart options
    }
  }
}
</script>

<style>
/* Such empty */
</style>
