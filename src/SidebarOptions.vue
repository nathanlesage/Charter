<template>
  <div class="padded-vertically">
    <!-- DATA VIEWER OPTIONS -->
    <template v-if="currentView === 'info'">
      <h4>Charter v{{ charterVersion }}</h4>
      <p>Libraries used:</p>
      <ul>
        <li>Vue <strong>v{{ vueVersion }}</strong></li>
        <li>Chart.js <strong>v{{ chartJSVersion }}</strong></li>
        <li>Photonkit</li>
      </ul>
    </template>
    <template v-else-if="currentView === 'data'">
      <p>
        <strong>Welcome to Charter!</strong> Charter is a small online tool that
        enables you to create small charts quick'n'dirty. That means: No hassle
        with the Excel and no need to spin up your data science IDE. Just drop
        in a few numbers, tweak the chart, and save it on your computer.
      </p>

      <button
          class="btn btn-large btn-default"
          v-on:click="startFileupload()"
        >
          <span class="icon icon-list"></span>
          Load file
        </button>
      <input
        type="file"
        ref="file-input"
        style="display: none;"
        v-on:change="handleFileUpload"
      >

      <div class="btn-group padded-vertically">
        <button
          class="btn btn-large btn-default"
          v-on:click="$emit('addset')"
        >
          <span class="icon icon-list-add"></span>
          Add dataset
        </button>
        <button
          class="btn btn-large btn-default"
          v-on:click="$emit('addrow')"
        >
          <span class="icon icon-plus"></span>
          Add row
        </button>
      </div>

      <!--  <button
        class="btn btn-large btn-negative"
        v-if="selectedRow > -1"
        v-on:click="$emit('removerow')"
      >
        <span class="icon icon-minus"></span>
        Remove row
      </button>  -->

      <template v-if="Object.keys(dataset).length > 0">
        <p>Which column should form the labels and x-axis values in scatter plots?</p>
        <select
          ref="use-as-labels"
          class="form-control"
          v-bind:value="labelDataset"
          v-on:input="setLabelDataset(($event.target as any).value)"
        >
          <option value="">No label dataset</option>
          <option
            v-for="label, index in Object.keys(dataset)"
            v-bind:key="index"
            v-bind:value="label"
          >{{ label }}</option>
        </select>
      </template>

    </template>

    <!-- CHART VIEWER OPTIONS -->
    <template v-else-if="currentView === 'chart'">
      <div class="btn-group padded-vertically-less">
        <button
          class="btn btn-small btn-primary"
          v-on:click="$emit('export')"
        >
          Save chart
        </button>
        <button
          class="btn btn-small btn-default"
          v-on:click="$emit('copy')"
        >
          Copy to clipboard
        </button>
      </div>

      <label for="export-resolution"><strong>Export resolution</strong></label>
      <input
        ref="export-resolution"
        id="export-resolution"
        class="form-control"
        type="range"
        min="1"
        max="10"
        v-bind:value="chartOptions.resolution"
        v-on:input="setOptions()"
      >
      <hr>

      <!-- CHART TYPE -->
      <label><strong>Chart Type</strong></label>
      <div class="btn-group">
        <button
          v-bind:class="{
            'btn': true,
            'btn-mini': true,
            'btn-default': true,
            'active': chartType === 'line'
          }"
          title="Line chart"
          v-on:click="setChartType('line')"
        >
          <span class="icon icon-chart-line"></span>
        </button>
        <button 
          v-bind:class="{
            'btn': true,
            'btn-mini': true,
            'btn-default': true,
            'active': chartType === 'bar'
          }"
          title="Bar chart"
          v-on:click="setChartType('bar')"
        >
          <span class="icon icon-chart-bar"></span>
        </button>
        <button
          v-bind:class="{
            'btn': true,
            'btn-mini': true,
            'btn-default': true,
            'active': chartType === 'radar'
          }"
          title="Radar chart"
          v-on:click="setChartType('radar')"
        >
          <!-- target = radar -->
          <span class="icon icon-target"></span>
        </button>
        <button
          v-bind:class="{
            'btn': true,
            'btn-mini': true,
            'btn-default': true,
            'active': chartType === 'pie'
          }"
          title="Pie chart"
          v-on:click="setChartType('pie')"
        >
          <span class="icon icon-chart-pie"></span>
        </button>
        <button
          v-bind:class="{
            'btn': true,
            'btn-mini': true,
            'btn-default': true,
            'active': chartType === 'polarArea'
          }"
          title="Polar chart"
          v-on:click="setChartType('polarArea')"
        >
          <!-- compass = polar -->
          <span class="icon icon-chart-area"></span>
        </button>
        <button 
          v-bind:class="{
            'btn': true,
            'btn-mini': true,
            'btn-default': true,
            'active': chartType === 'scatter'
          }"
          title="Scatter plot"
          v-on:click="setChartType('scatter')"
        >
          <!-- target = scatter -->
          <span class="icon icon-target"></span>
        </button>
      </div> <!-- END chart type selector -->
      <hr>

      <!-- GENERIC SETTINGS APPLICABLE TO ALL CHART TYPES -->
      <div class="form-group">
        <label><strong>Chart Title and Position</strong></label>
        <input
          ref="title-text"
          type="text"
          class="form-control"
          placeholder="Chart title"
          v-bind:value="chartOptions.title.text"
          v-on:input="setOptions()"
        >
      </div>
      <div class="form-group">
        <select
          ref="title-position"
          class="form-control"
          v-bind:value="chartOptions.title.position"
          v-on:input="setOptions()"
        >
          <option value="top">Top</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
          <option value="bottom">Bottom</option>
        </select>
      </div>

      <label><strong>Chart legend and position</strong></label>
      <select
        ref="legend-position"
        class="form-control"
        v-bind:value="legendValuePosition"
        v-on:input="setOptions()"
      >
        <option value="none">Hide legend</option>
        <option value="top">Top</option>
        <option value="left">Left</option>
        <option value="right">Right</option>
        <option value="bottom">Bottom</option>
      </select>

      <label for="barchart-bar-percentage"><strong>Font size</strong></label>
      <input
        ref="chart-font-size"
        id="chart-font-size"
        class="form-control"
        type="number"
        min="2"
        max="200"
        step="1"
        v-bind:value="chartOptions.fontSize"
        v-on:input="setOptions()"
      >

      <label for="layout-padding"><strong>Chart spacing</strong> ({{ chartOptions.padding }}px)</label>
      <input
        ref="layout-padding"
        id="layout-padding"
        class="form-control"
        type="range"
        min="0"
        max="200"
        v-bind:value="chartOptions.padding"
        v-on:input="setOptions()"
      >

      <div class="checkbox">
        <label>
          <input
            ref="draw-chart-background"
            type="checkbox"
            v-bind:checked="chartOptions.drawChartBackground"
            v-on:input="setOptions()"
          > Chart background color
        </label>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center;">
        <label>Chart background color:</label>
        <input
          ref="chart-background-color"
          type="color"
          v-bind:value="chartOptions.chartBackgroundColor"
          v-bind:disabled="!chartOptions.drawChartBackground"
          v-on:input="setOptions()"
        >
      </div>

      <!-- Now settings for specific chart types -->
      <template v-if="chartType === 'bar'">
        <!-- TODO: Enable barPercentage and categoryPercentage (0-1) -->
        <label for="barchart-bar-percentage"><strong>Bar width</strong></label>
        <input
          ref="barchart-bar-percentage"
          id="barchart-bar-percentage"
          class="form-control"
          type="range"
          min="0"
          max="1"
          step="0.1"
          v-bind:value="chartOptions.barChart.barPercentage"
          v-on:input="setOptions()"
        >
        <label for="barchart-cat-percentage"><strong>Category width</strong></label>
        <input
          ref="barchart-cat-percentage"
          id="barchart-cat-percentage"
          class="form-control"
          type="range"
          min="0"
          max="1"
          step="0.1"
          v-bind:value="chartOptions.barChart.categoryPercentage"
          v-on:input="setOptions()"
        >

        <div class="checkbox">
          <label>
            <input
              ref="barchart-stacked"
              type="checkbox"
              v-bind:checked="chartOptions.barChart.stacked"
              v-on:input="setOptions()"
            > Stacked bar chart
          </label>
        </div>
        <div class="checkbox">
          <label>
            <input
              ref="barchart-horizontal"
              type="checkbox"
              v-bind:checked="chartOptions.barChart.horizontal"
              v-on:input="setOptions()"
            > Horizontal bar chart
          </label>
        </div>
      </template>
      <template v-else-if="chartType === 'pie'">
        <!-- TODO: Enable cutoutPercentage (0 for pie, 50 for donut) -->
        <label for="piechart-cutout"><strong>Pie Chart Cutout</strong></label>
        <input
          ref="piechart-cutout"
          id="piechart-cutout"
          class="form-control"
          type="range"
          min="0"
          max="100"
          v-bind:value="chartOptions.pieChart.cutoutPercentage"
          v-on:input="setOptions()"
        >
      </template>

      <hr>

      <!-- Let the user finetune the options for each dataset -->
      <label><strong>Dataset Settings</strong></label>
      <select
        class="form-control"
        v-bind:value="activeDataset"
        v-on:input="setActiveDataset(($event.target as any).value)"
      >
        <option
          v-for="dataset, key, index in datasetOptions"
          v-bind:key="index"
          v-bind:value="key"
          v-bind:selected="activeDataset === key"
        >
          Dataset: {{ key }}
        </option>
      </select>
      <template v-if="datasetOptions[activeDataset] !== undefined">
        <div class="padded-vertically" style="display: flex; justify-content: space-between; align-items: center;">
          <label>Colour</label>
          <input
            type="color"
            v-bind:value="'#' + datasetOptions[activeDataset].colour.toHex()"
            v-on:input="updateColour(datasetOptions[activeDataset].colour, ($event.target as any).value)"
          >
        </div>

        <label>Background color opacity</label>
        <input
          class="form-control"
          type="range"
          min="0"
          max="1"
          step="0.1"
          v-bind:value="datasetOptions[activeDataset].colour.alpha"
          v-on:input="datasetOptions[activeDataset].colour.alpha = parseFloat(($event.target as any).value)"
        >

        <label>Point style</label>
        <select
          class="form-control"
          v-bind:value="datasetOptions[activeDataset].pointStyle"
          v-on:input="datasetOptions[activeDataset].pointStyle = ($event.target as any).value"
        >
          <option value="circle">Circle</option>
          <option value="cross">Cross</option>
          <option value="crossRot">Rotated Cross</option>
          <option value="dash">Dash</option>
          <option value="line">Line</option>
          <option value="rect">Rectangle</option>
          <option value="rectRounded">Rounded Rectangle</option>
          <option value="rectRot">Rotated Rectangle</option>
          <option value="star">Star</option>
          <option value="triangle">Triangle</option>
        </select>

        <label class="padded-top">Point size</label>
        <input
          type="range"
          class="form-control"
          min="0"
          max="20"
          v-bind:value="datasetOptions[activeDataset].pointRadius"
          v-on:input="datasetOptions[activeDataset].pointRadius = parseInt(($event.target as any).value)"
        >

        <label>Curvedness</label>
        <input
          type="range"
          class="form-control"
          min="0.0"
          max="1.0"
          step="0.1"
          v-bind:value="datasetOptions[activeDataset].tension"
          v-on:input="datasetOptions[activeDataset].tension = parseFloat(($event.target as any).value)"
        >

        <label>Line Width</label>
        <input
          type="range"
          class="form-control"
          min="0"
          max="10"
          v-bind:value="datasetOptions[activeDataset].borderWidth"
          v-on:input="datasetOptions[activeDataset].borderWidth = parseInt(($event.target as any).value)"
        >

        <div class="checkbox">
          <label>
            <input
              type="checkbox"
              v-bind:checked="datasetOptions[activeDataset].fill"
              v-on:input="datasetOptions[activeDataset].fill = ($event.target as any).checked"
            > Fill area under curve
          </label>
        </div>

        <hr>
      </template>

      <!-- GRID LINE CONFIGURATION -->
      <label><strong>x-Axis</strong></label>

      <input
        ref="xaxis-label"
        type="text"
        placeholder="Enter your x-axis label here"
        class="form-control"
        v-on:input="setOptions()"
      >

      <label class="padded-top">Customise ticks: {{ chartOptions.xAxis.ticks.beforeValue}}1.23{{ chartOptions.xAxis.ticks.afterValue }}</label>

      <input
        ref="xaxis-ticks-before"
        type="text"
        placeholder="Before tick labels, e.g. $"
        v-bind:value="chartOptions.xAxis.ticks.beforeValue"
        class="form-control"
        v-on:input="setOptions()"
      >

      <input
        ref="xaxis-ticks-after"
        type="text"
        placeholder="After tick labels, e.g. %"
        v-bind:value="chartOptions.xAxis.ticks.afterValue"
        class="form-control"
        v-on:input="setOptions()"
      >

      <div class="checkbox">
        <label>
          <input
            ref="xaxisgrid-display"
            type="checkbox"
            v-bind:checked="chartOptions.xAxis.grid.display"
            v-on:input="setOptions()"
          > Display the x-axis grid
        </label>
      </div>

      <div class="checkbox">
        <label>
          <input
            ref="xaxisgrid-drawonchartarea"
            type="checkbox"
            v-bind:checked="chartOptions.xAxis.grid.drawOnChartArea"
            v-bind:disabled="!chartOptions.xAxis.grid.display"
            v-on:input="setOptions()"
          > Gridlines
        </label>
      </div>

      <div class="checkbox">
        <label>
          <input
            ref="xaxisgrid-drawticks"
            type="checkbox"
            v-bind:checked="chartOptions.xAxis.grid.drawTicks"
            v-bind:disabled="!chartOptions.xAxis.grid.display"
            v-on:input="setOptions()"
          > Tick lines
        </label>
      </div>

      <div class="checkbox">
        <label>
          <input
            ref="xaxisgrid-ticklabels"
            type="checkbox"
            v-bind:checked="chartOptions.xAxis.ticks.display"
            v-on:input="setOptions()"
          > Tick labels
        </label>
      </div>

      <label><strong>y-Axis</strong></label>

      <input
        ref="yaxis-label"
        type="text"
        placeholder="Enter your y-axis label here"
        class="form-control"
        v-on:input="setOptions()"
      >

      <label class="padded-top">Customise ticks: {{ chartOptions.yAxis.ticks.beforeValue}}1.23{{ chartOptions.yAxis.ticks.afterValue }}</label>

      <input
        ref="yaxis-ticks-before"
        type="text"
        placeholder="Before tick labels, e.g. $"
        v-bind:value="chartOptions.yAxis.ticks.beforeValue"
        class="form-control"
        v-on:input="setOptions()"
      >

      <input
        ref="yaxis-ticks-after"
        type="text"
        placeholder="After tick labels, e.g. %"
        v-bind:value="chartOptions.yAxis.ticks.afterValue"
        class="form-control"
        v-on:input="setOptions()"
      >

      <div class="checkbox">
        <label>
          <input
            ref="yaxisgrid-display"
            type="checkbox"
            v-bind:checked="chartOptions.yAxis.grid.display"
            v-on:input="setOptions()"
          > Display the y-axis grid
        </label>
      </div>

      <div class="checkbox">
        <label>
          <input
            ref="yaxisgrid-drawonchartarea"
            type="checkbox"
            v-bind:checked="chartOptions.yAxis.grid.drawOnChartArea"
            v-bind:disabled="!chartOptions.yAxis.grid.display"
            v-on:input="setOptions()"
          > Gridlines
        </label>
      </div>

      <div class="checkbox">
        <label>
          <input
            ref="yaxisgrid-drawticks"
            type="checkbox"
            v-bind:checked="chartOptions.yAxis.grid.drawTicks"
            v-bind:disabled="!chartOptions.yAxis.grid.display"
            v-on:input="setOptions()"
          > Ticks
        </label>
      </div>

      <div class="checkbox">
        <label>
          <input
            ref="yaxisgrid-ticklabels"
            type="checkbox"
            v-bind:checked="chartOptions.yAxis.ticks.display"
            v-on:input="setOptions()"
          > Tick labels
        </label>
      </div>

      <div class="checkbox">
        <label>
          <input
            ref="yaxis-beginatzero"
            type="checkbox"
            v-bind:checked="chartOptions.yAxis.beginAtZero"
            v-on:input="setOptions()"
          > Start axis values at y=0
        </label>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, setTransitionHooks } from 'vue'
import rgbHex from 'rgb-hex'
import hexRgb from 'hex-rgb'

import mainPackage from '../package.json'
import chartPackage from 'chart.js/package.json'
import vuePackage from 'vue/package.json'

import { ChartOptions, ChartType, Dataset, DatasetOption, DatasetOptions } from './store'
import Color from './color'

export default defineComponent({
  name: 'SidebarOptions',
  props: {
    currentView: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      // Versioning information
      charterVersion: mainPackage.version,
      vueVersion: vuePackage.version,
      chartJSVersion: chartPackage.version
    }
  },
  computed: {
    legendValuePosition: function (): string {
      if (!this.chartOptions.legend.display) {
        return 'none' // Merge display + position into one option
      }

      if (this.chartOptions.legend.position === undefined) {
        return 'none'
      }
      
      return this.chartOptions.legend.position
    },
    dataset: function (): Dataset {
      return this.$store.state.dataset
    },
    datasetOptions: function (): DatasetOptions {
      return this.$store.state.datasetOptions
    },
    chartOptions: function (): ChartOptions {
      return this.$store.state.chartOptions
    },
    labelDataset: function (): string {
      return this.$store.state.labelDataset
    },
    activeDataset: function (): string {
      return this.$store.state.activeDataset
    },
    activeDatasetOptions: function (): DatasetOption {
      return this.$store.getters.activeDatasetOptions()
    },
    chartType: function (): ChartType {
      return this.$store.state.chartType
    }
  },
  watch: {
  },
  mounted: function () {
  },
  methods: {
    handleFileUpload: function (event: Event) {
      if (!(event.target instanceof HTMLInputElement)) {
        return
      }
      const fileList = event.target.files

      if (fileList === null) {
        return
      }

      const file = fileList[0]

      const reader = new FileReader()
      reader.onload = (event) => {
        const contents = reader.result // event.target.result
        if (typeof contents !== 'string') {
          console.error('Could not parse file: Content was not a string.')
          return
        }

        // Now we have the file and can process the results
        this.parseFile(contents, file.name) // Why pass the name? To guess the file type
      }

      reader.readAsText(file)
    },
    setOptions: function () {
      const newValue = Object.assign({}, this.chartOptions)
      newValue.title.text = (this.$refs['title-text'] as any).value
      newValue.title.position = (this.$refs['title-position'] as any).value
      newValue.fontSize = (this.$refs['chart-font-size'] as any).value

      newValue.drawChartBackground = (this.$refs['draw-chart-background'] as any).checked
      newValue.chartBackgroundColor = (this.$refs['chart-background-color'] as any).value

      // We're merging two options into one here
      if ((this.$refs['legend-position'] as any).value === 'none') {
        newValue.legend.display = false
        newValue.legend.position = 'top'
      } else {
        newValue.legend.display = true
        newValue.legend.position = (this.$refs['legend-position'] as any).value
      }

      newValue.padding = parseInt((this.$refs['layout-padding'] as any).value, 10)

      newValue.resolution = parseInt((this.$refs['export-resolution'] as any).value, 10)

      // We need to make sure these elements are in fact rendered.
      if (this.chartType === 'bar') {
        newValue.barChart.barPercentage = parseFloat((this.$refs['barchart-bar-percentage'] as any).value)
        newValue.barChart.categoryPercentage = parseFloat((this.$refs['barchart-cat-percentage'] as any).value)
        newValue.barChart.stacked = (this.$refs['barchart-stacked'] as any).checked
        newValue.barChart.horizontal = (this.$refs['barchart-horizontal'] as any).checked
      } else if (this.chartType === 'pie') {
        newValue.pieChart.cutoutPercentage = parseInt((this.$refs['piechart-cutout'] as any).value, 10)
      }

      newValue.xAxis.grid.display = (this.$refs['xaxisgrid-display'] as any).checked
      newValue.xAxis.grid.drawOnChartArea = (this.$refs['xaxisgrid-drawonchartarea'] as any).checked
      newValue.xAxis.grid.drawTicks = (this.$refs['xaxisgrid-drawticks'] as any).checked
      newValue.yAxis.grid.display = (this.$refs['yaxisgrid-display'] as any).checked
      newValue.yAxis.grid.drawOnChartArea = (this.$refs['yaxisgrid-drawonchartarea'] as any).checked
      newValue.yAxis.grid.drawTicks = (this.$refs['yaxisgrid-drawticks'] as any).checked

      newValue.xAxis.label = (this.$refs['xaxis-label'] as any).value
      newValue.yAxis.label = (this.$refs['yaxis-label'] as any).value

      newValue.xAxis.ticks.display = (this.$refs['xaxisgrid-ticklabels'] as any).checked
      newValue.yAxis.ticks.display = (this.$refs['yaxisgrid-ticklabels'] as any).checked

      newValue.xAxis.ticks.beforeValue = (this.$refs['xaxis-ticks-before'] as any).value
      newValue.xAxis.ticks.afterValue = (this.$refs['xaxis-ticks-after'] as any).value
      newValue.yAxis.ticks.beforeValue = (this.$refs['yaxis-ticks-before'] as any).value
      newValue.yAxis.ticks.afterValue = (this.$refs['yaxis-ticks-after'] as any).value

      newValue.yAxis.beginAtZero = (this.$refs['yaxis-beginatzero'] as any).checked

      // Finally emit an update
      this.$store.commit('chartOptions', newValue)
    },
    parseFile: function (contents: string, fileName: string) {
      // Rudimentary TSV/CSV parsing. TOLD YOU IT'S JUST A SMALL TOOL! Don't
      // expect the data loader to fulfill wonders. HOWEVER it's still easier
      // to get a TSV file right than it is to force Excel to produce a simple
      // chart.
      const ext = fileName.substring(fileName.lastIndexOf('.'))
      if (![ '.tsv', '.csv' ].includes(ext)) {
        alert(`Unrecognised file extension: "${ext}".\n\nPlease select a ".csv" or ".tsv" file to load.`)
        return
      }

      const isTSV = ext.toLowerCase() === '.tsv'

      const lines = contents.trim().split('\n')
      const parsedLines: string[][] = []

      const separator = (isTSV) ? '\t' : ','

      for (const line of lines) {
        parsedLines.push(line.split(separator))
      }

      const labels = parsedLines.shift()
      if (labels === undefined) {
        throw new Error(`Could not parse dataset: Did not contain any lines`)
      }

      // Now we should have a two-dimensional array in the form of row:col. We
      // now need to get that into our dataset format.
      const datasets: Dataset = {}
      for (const label of labels) {
        datasets[label] = []
      }

      for (let row = 0; row < parsedLines.length; row++) {
        for (let col = 0; col < parsedLines[row].length; col++) {
          // Retrieve the correct label
          datasets[labels[col]].push(parsedLines[row][col])
        }
      }

      // At this point we have the correct data size and can notify the app
      this.$store.commit('dataset', datasets)
      // this.$emit('dataset', datasets)

      // Now that the app has the correct data, let's make sure our labels are
      // sane again
      this.$emit('useaslabels', labels[0])
    },
    updateColour: function (color: Color, hexVal: string) {
      const cols = hexRgb(hexVal)
      color.red = cols.red
      color.green = cols.green
      color.blue = cols.blue
    },
    setChartType: function (newType: string) {
      this.$store.commit('chartType', newType)
    },
    startFileupload: function () {
      (this.$refs['file-input'] as HTMLInputElement).click()
    },
    setActiveDataset: function (newDataset: string) {
      this.$store.commit('activeDataset', newDataset)
    },
    setLabelDataset: function (newDataset: string|undefined) {
      if (newDataset === '') {
        newDataset = undefined
      }

      this.$store.commit('labelDataset', newDataset)
    }
  }
})
</script>

<style>
/** Such empty */
</style>
