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
            v-bind:selected-row="selectedRow"
            v-bind:chart-dimensions="chartDimensions"
            v-model="chartOptions"
            v-bind:chart-type="chartType"
            v-bind:dataset="dataset"
            v-bind:use-as-labels="useAsLabels"
            v-on:charttype="chartType = $event"
            v-on:dataset="dataset = $event"
            v-on:useaslabels="useAsLabels = $event"
            v-on:datasetoptions="datasetOptions = $event"
            v-on:addset="addDataset()"
            v-on:addrow="addRow()"
            v-on:removerow="removeRow()"
            v-on:export="exportChart(false)"
            v-on:copy="exportChart(true)"
          ></SidebarOptions>
        </div>
        <!-- BEGIN: MAIN CONTENT -->
        <div class="pane" style="background-color: rgb(230, 230, 230);">
          <DataViewer
            ref="data-viewer"
            v-if="currentView === 'data' && Object.keys(dataset).length > 0"
            v-model="dataset"
            v-on:rowselection="selectedRow = $event"
          ></DataViewer>
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
            v-bind:chart-type="chartType"
            v-bind:dataset="dataset"
            v-bind:dataset-options="datasetOptions"
            v-bind:options="chartOptions"
            v-bind:use-as-labels="useAsLabels"
          ></ChartViewer>
        </div>
      </div>
    </div>

    <footer class="toolbar toolbar-footer">
      <h1 class="title">Charter <strong>v{{ charterVersion }}</strong>
      | &copy; 2021 <a href="https://www.hendrik-erz.de/" target="_blank">Hendrik Erz</a>
      | Powered by <a href="https://vuejs.org/" rel="nofollow" target="_blank">Vue.js</a> and <a href="https://www.chartjs.org/" rel="nofollow" target="_blank">Chart.js</a>
      | <a href="https://github.com/nathanlesage/Charter" target="_blank">View Code on GitHub</a>
      | Handle with care ❤️</h1>
    </footer>
  </div>
</template>

<script>
import Vue from 'vue'
import DataViewer from './DataViewer'
import ChartViewer from './ChartViewer'
import InfoViewer from './InfoViewer'
import SidebarOptions from './SidebarOptions'
import b64toBlob from 'b64-to-blob'
import sanitize from 'sanitize-filename'
import { version } from '../package.json'

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
    InfoViewer,
    SidebarOptions
  },
  data: function () {
    return {
      selectedRow: -1, // Selected row in the data viewer
      chartDimensions: '0x0px', // Purely informative, holds the actual chart dimensions
      currentView: 'data', // Two views: data and chart
      colours: {}, // Contains user-defined colours, solely generated in the sidebar
      // Dataset options are customisations for each single dataset that is loaded
      datasetOptions: {},
      // This contains the overall dataset. As ChartJS allows for labels and
      // generally accepts simple number arrays, we will for now run with a
      // dictionary.
      dataset: {},
      chartType: 'line',
      useAsLabels: '', // The dataset to use as labels
      chartOptions: {
        // Specific options for bar charts
        barChart: {
          barPercentage: 0.8,
          categoryPercentage: 0.8,
          stacked: false,
          horizontal: false
        },
        // Specific options for pie charts
        pieChart: {
          cutoutPercentage: 0 // 0-100
        },
        drawChartBackground: false,
        chartBackgroundColor: '#ffffff',
        padding: 30, // Overall padding of the chart in pixels
        resolution: window.devicePixelRatio, // The "resolution" of the chart
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
          grid: {
            display: true, // Whether to display them at all
            drawOnChartArea: true, // Gridlines on the chart
            drawTicks: true // Gridlines off the charts, so to speak
          },
          ticks: {
            display: true, // Whether to show tick labels
            // The next to options allow the user to customise the value display
            beforeValue: '',
            afterValue: ''
          }
        },
        yAxis: {
          beginAtZero: false,
          label: '',
          grid: {
            display: true, // Whether to display them at all
            drawOnChartArea: true, // Gridlines on the chart
            drawTicks: true // Gridlines off the charts, so to speak
          },
          ticks: {
            display: true, // Whether to show tick labels
            // The next to options allow the user to customise the value display
            beforeValue: '',
            afterValue: ''
          }
        }
      } // This contains all the chart options
    }
  },
  computed: {
    charterVersion: function () {
      return version
    }
  },
  watch: {
    chartOptions: function (newValue, oldValue) {
      if (newValue.resolution === oldValue.resoluton) {
        return // Nothing changed
      }

      // Give the chart time to update itself, then take the base64 and
      // calculate the dimensions based off that.
      this.$nextTick(function () {
        const img = document.createElement('img')
        img.onload = (event) => {
          // Update the chart dimensions
          this.chartDimensions = `${img.width}x${img.height}px`
        }
        img.src = this.$refs['chart-viewer'].getBase64()
      })
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
    removeRow: function () {
      this.$refs['data-viewer'].removeRow()
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
/*
  We have to explicitly allow user selection on all inputs. Otherwise, the app
  breaks on Safari (across all devices).
*/
input {
  -webkit-user-select: initial;
  user-select: initial;
}
</style>
