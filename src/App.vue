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
            v-model="chartOptions"
            v-bind:chart-type="chartType"
            v-bind:dataset="dataset"
            v-bind:use-as-labels="useAsLabels"
            v-on:charttype="chartType = $event"
            v-on:dataset="dataset = $event"
            v-on:useaslabels="useAsLabels = $event"
            v-on:colours="colours = $event"
            v-on:addset="addDataset()"
            v-on:addrow="addRow()"
            v-on:export="exportChart(false)"
            v-on:copy="exportChart(true)"
          ></SidebarOptions>
        </div>
        <!-- BEGIN: MAIN CONTENT -->
        <div class="pane" style="background-color: rgb(230, 230, 230);">
          <DataViewer
            v-if="currentView === 'data' && Object.keys(dataset).length > 0"
            v-model="dataset"
          ></DataViewer>
          <template v-else-if="currentView === 'data'">
            <div class="padded-more">
              <h1>No data</h1>
              <p>Load a datafile, or add a new dataset to view it here.</p>
            </div>
          </template>
          <ChartViewer
            v-else
            ref="chart-viewer"
            v-bind:chart-type="chartType"
            v-bind:dataset="dataset"
            v-bind:colours="colours"
            v-bind:options="chartOptions"
            v-bind:use-as-labels="useAsLabels"
          ></ChartViewer>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import DataViewer from './DataViewer'
import ChartViewer from './ChartViewer'
import SidebarOptions from './SidebarOptions'
import b64toBlob from 'b64-to-blob'
import sanitize from 'sanitize-filename'

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
      colours: {}, // Contains user-defined colours, solely generated in the sidebar
      // This contains the overall dataset. As ChartJS allows for labels and
      // generally accepts simple number arrays, we will for now run with a
      // dictionary.
      dataset: {},
      chartType: 'line',
      useAsLabels: '', // The dataset to use as labels
      chartOptions: {
        padding: 0, // Overall padding of the chart
        title: {
          text: 'Untitled Chart',
          position: 'top'
        },
        legend: {
          display: true,
          position: 'top'
        },
        xAxis: {
          label: '',
          gridLines: {
            display: true, // Whether to display them at all
            drawOnChartArea: true, // Gridlines on the chart
            drawTicks: true // Gridlines off the charts, so to speak
          },
          ticks: {
            display: true // Whether to show tick labels
          }
        },
        yAxis: {
          label: '',
          gridLines: {
            display: true, // Whether to display them at all
            drawOnChartArea: true, // Gridlines on the chart
            drawTicks: true // Gridlines off the charts, so to speak
          },
          ticks: {
            display: true // Whether to show tick labels
          }
        }
      } // This contains all the chart options
    }
  },
  methods: {
    addDataset: function () {
      const num = Object.keys(this.dataset).length + 1
      if (Object.keys(this.dataset).length === 0) {
        Vue.set(this.dataset, `Dataset ${num}`, [0])
      } else {
        const arr = []
        const numRows = this.dataset[Object.keys(this.dataset)[0]].length
        for (let i = 0; i < numRows; i++) {
          arr.push(0)
        }
        Vue.set(this.dataset, `Dataset ${num}`, arr)
      }
    },
    addRow: function () {
      for (const key of Object.keys(this.dataset)) {
        this.dataset[key].push(0)
      }
    },
    exportChart: function (copy = false) {
      // First, get the base64 data
      const b64 = this.$refs['chart-viewer'].getBase64()

      // Then prepare the file and basically force the browser to download the
      // image data from an arbitrary anchor element.
      if (copy) {
        // Copy to clipboard. We have to remove the data:image/png;base64,-part
        // from the string beforehand. Let's do this oldschool.
        const blob = b64toBlob(b64.substr(22), 'image/png')
        const item = new ClipboardItem({ 'image/png': blob })
        navigator.clipboard.write([item])
      } else {
        // Save to disk
        const filename = sanitize(this.chartOptions.title.text)
        const download = document.createElement('a')
        download.href = b64
        download.download = filename + '.png'
        download.click()
      }
    }
  }
}
</script>

<style>
/* Such empty */
</style>
