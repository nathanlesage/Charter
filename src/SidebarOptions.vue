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
          v-on:click="$refs['file-input'].click()"
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

      <button
        class="btn btn-large btn-negative"
        v-if="selectedRow > -1"
        v-on:click="$emit('removerow')"
      >
        <span class="icon icon-minus"></span>
        Remove row
      </button>

      <template v-if="Object.keys(dataset).length > 0">
        <p>Which column should form the labels and x-axis values in scatter plots?</p>
        <select
          ref="use-as-labels"
          class="form-control"
          v-bind:value="useAsLabels"
          v-on:input="$emit('useaslabels', $event.target.value)"
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

      <label for="export-resolution"><strong>Export resolution</strong> ({{ chartDimensions }})</label>
      <input
        ref="export-resolution"
        id="export-resolution"
        class="form-control"
        type="range"
        min="1"
        max="10"
        v-bind:value="value.resolution"
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
          v-on:click="$emit('charttype', 'line')"
        >
          <span class="icon icon-chart-line"></span>
        </button>
        <button 
          v-bind:class="{
            'btn': true,
            'btn-mini': true,
            'btn-default': true,
            'active': chartType === 'bar' || chartType === 'horizontalBar'
          }"
          title="Bar chart"
          v-on:click="(value.barChart.horizontal) ? $emit('charttype', 'horizontalBar') : $emit('charttype', 'bar')"
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
          v-on:click="$emit('charttype', 'radar')"
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
          v-on:click="$emit('charttype', 'pie')"
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
          v-on:click="$emit('charttype', 'polarArea')"
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
          v-on:click="$emit('charttype', 'scatter')"
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
          v-bind:value="value.title.text"
          v-on:input="setOptions()"
        >
      </div>
      <div class="form-group">
        <select
          ref="title-position"
          class="form-control"
          v-bind:value="value.title.position"
          v-on:input="setOptions()"
        >
          <option value="top">Top</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
          <option value="bottom">Bottom</option>
        </select>
      </div>

      <label><strong>Chart legend and Position</strong></label>
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

      <label for="layout-padding"><strong>Chart spacing</strong> ({{ value.padding }}px)</label>
      <input
        ref="layout-padding"
        id="layout-padding"
        class="form-control"
        type="range"
        min="0"
        max="200"
        v-bind:value="value.padding"
        v-on:input="setOptions()"
      >

      <div class="checkbox">
        <label>
          <input
            ref="draw-chart-background"
            type="checkbox"
            v-bind:checked="value.drawChartBackground"
            v-on:input="setOptions()"
          > Chart background color
        </label>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center;">
        <label>Chart background color:</label>
        <input
          ref="chart-background-color"
          type="color"
          v-bind:value="value.chartBackgroundColor"
          v-bind:disabled="!value.drawChartBackground"
          v-on:input="setOptions()"
        >
      </div>

      <!-- Now settings for specific chart types -->
      <template v-if="chartType === 'bar' || chartType === 'horizontalBar'">
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
          v-bind:value="value.barChart.barPercentage"
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
          v-bind:value="value.barChart.categoryPercentage"
          v-on:input="setOptions()"
        >
        <!-- TODO: Enable stacked and horizontal bar chart -->
        <div class="checkbox">
          <label>
            <input
              ref="barchart-stacked"
              type="checkbox"
              v-bind:checked="value.barChart.stacked"
              v-on:input="setOptions()"
            > Stacked
          </label>
        </div>
        <div class="checkbox">
          <label>
            <input
              ref="barchart-horizontal"
              type="checkbox"
              v-bind:checked="value.barChart.horizontal"
              v-on:input="setOptions()"
            > Horizontal
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
          v-bind:value="value.pieChart.cutoutPercentage"
          v-on:input="setOptions()"
        >
      </template>

      <hr>

      <!-- Let the user finetune the options for each dataset -->
      <label><strong>Dataset Settings</strong></label>
      <select
        class="form-control"
        v-bind:value="activeDataset"
        v-on:input="activeDataset = $event.target.value"
      >
        <option
          v-for="dataset, key, index in datasetOptions"
          v-bind:key="index"
          v-bind:value="key"
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
            v-on:input="updateColour(datasetOptions[activeDataset].colour, $event.target.value)"
          >
        </div>

        <label>Background color opacity</label>
        <input
          class="form-control"
          type="range"
          min="0"
          max="1"
          step="0.1"
          v-bind:value="datasetOptions[activeDataset].colour.a"
          v-on:input="datasetOptions[activeDataset].colour.a = parseFloat($event.target.value)"
        >

        <label>Point style</label>
        <select
          class="form-control"
          v-bind:value="datasetOptions[activeDataset].pointStyle"
          v-on:input="datasetOptions[activeDataset].pointStyle = $event.target.value"
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
          v-on:input="datasetOptions[activeDataset].pointRadius = parseInt($event.target.value)"
        >

        <label>Curvedness</label>
        <input
          type="range"
          class="form-control"
          min="0.0"
          max="1.0"
          step="0.1"
          v-bind:value="datasetOptions[activeDataset].tension"
          v-on:input="datasetOptions[activeDataset].tension = parseFloat($event.target.value)"
        >

        <label>Line Width</label>
        <input
          type="range"
          class="form-control"
          min="0"
          max="10"
          v-bind:value="datasetOptions[activeDataset].borderWidth"
          v-on:input="datasetOptions[activeDataset].borderWidth = parseInt($event.target.value)"
        >

        <div class="checkbox">
          <label>
            <input
              type="checkbox"
              v-bind:checked="datasetOptions[activeDataset].fill"
              v-on:input="datasetOptions[activeDataset].fill = $event.target.checked"
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

      <label class="padded-top">Customise ticks: {{ value.xAxis.ticks.beforeValue}}1.23{{ value.xAxis.ticks.afterValue }}</label>

      <input
        ref="xaxis-ticks-before"
        type="text"
        placeholder="Before tick labels, e.g. $"
        v-bind:value="value.xAxis.ticks.beforeValue"
        class="form-control"
        v-on:input="setOptions()"
      >

      <input
        ref="xaxis-ticks-after"
        type="text"
        placeholder="After tick labels, e.g. %"
        v-bind:value="value.xAxis.ticks.afterValue"
        class="form-control"
        v-on:input="setOptions()"
      >

      <div class="checkbox">
        <label>
          <input
            ref="xaxisgrid-display"
            type="checkbox"
            v-bind:checked="value.xAxis.gridLines.display"
            v-on:input="setOptions()"
          > Display the x-axis grid
        </label>
      </div>

      <div class="checkbox">
        <label>
          <input
            ref="xaxisgrid-drawonchartarea"
            type="checkbox"
            v-bind:checked="value.xAxis.gridLines.drawOnChartArea"
            v-bind:disabled="!value.xAxis.gridLines.display"
            v-on:input="setOptions()"
          > Gridlines
        </label>
      </div>

      <div class="checkbox">
        <label>
          <input
            ref="xaxisgrid-drawticks"
            type="checkbox"
            v-bind:checked="value.xAxis.gridLines.drawTicks"
            v-bind:disabled="!value.xAxis.gridLines.display"
            v-on:input="setOptions()"
          > Tick lines
        </label>
      </div>

      <div class="checkbox">
        <label>
          <input
            ref="xaxisgrid-ticklabels"
            type="checkbox"
            v-bind:checked="value.xAxis.ticks.display"
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

      <label class="padded-top">Customise ticks: {{ value.yAxis.ticks.beforeValue}}1.23{{ value.yAxis.ticks.afterValue }}</label>

      <input
        ref="yaxis-ticks-before"
        type="text"
        placeholder="Before tick labels, e.g. $"
        v-bind:value="value.yAxis.ticks.beforeValue"
        class="form-control"
        v-on:input="setOptions()"
      >

      <input
        ref="yaxis-ticks-after"
        type="text"
        placeholder="After tick labels, e.g. %"
        v-bind:value="value.yAxis.ticks.afterValue"
        class="form-control"
        v-on:input="setOptions()"
      >

      <div class="checkbox">
        <label>
          <input
            ref="yaxisgrid-display"
            type="checkbox"
            v-bind:checked="value.yAxis.gridLines.display"
            v-on:input="setOptions()"
          > Display the x-axis grid
        </label>
      </div>

      <div class="checkbox">
        <label>
          <input
            ref="yaxisgrid-drawonchartarea"
            type="checkbox"
            v-bind:checked="value.yAxis.gridLines.drawOnChartArea"
            v-bind:disabled="!value.yAxis.gridLines.display"
            v-on:input="setOptions()"
          > Gridlines
        </label>
      </div>

      <div class="checkbox">
        <label>
          <input
            ref="yaxisgrid-drawticks"
            type="checkbox"
            v-bind:checked="value.yAxis.gridLines.drawTicks"
            v-bind:disabled="!value.yAxis.gridLines.display"
            v-on:input="setOptions()"
          > Ticks
        </label>
      </div>

      <div class="checkbox">
        <label>
          <input
            ref="yaxisgrid-ticklabels"
            type="checkbox"
            v-bind:checked="value.yAxis.ticks.display"
            v-on:input="setOptions()"
          > Tick labels
        </label>
      </div>

      <div class="checkbox">
        <label>
          <input
            ref="yaxis-beginatzero"
            type="checkbox"
            v-bind:checked="value.yAxis.beginAtZero"
            v-on:input="setOptions()"
          > Start axis values at y=0
        </label>
      </div>
    </template>
  </div>
</template>

<script>
import Vue from 'vue'
import rgbHex from 'rgb-hex'
import hexRgb from 'hex-rgb'

import { version } from '../package.json'
import { version as chartJSVersion } from 'chart.js/package.json'

export default {
  name: 'SidebarOptions',
  props: {
    currentView: {
      type: String,
      default: 'data'
    },
    selectedRow: {
      type: Number,
      default: -1
    },
    // Holds the chart dimensions as they would be output
    chartDimensions: {
      type: String,
      default: '0x0px'
    },
    // This holds the chart configuration
    value: {
      type: Object,
      default: function () { return {} }
    },
    chartType: {
      type: String,
      default: 'line'
    },
    dataset: {
      type: Object,
      default: function () { return {} }
    },
    useAsLabels: {
      type: String,
      default: ''
    }
  },
  data: function () {
    return {
      // Versioning information
      charterVersion: version,
      vueVersion: Vue.version,
      chartJSVersion: chartJSVersion,
      // This holds the options for the dataset. We will be managing these in
      // this component rather than the app because this way the dataflow is
      // simpler (as it doesn't have to go back and forth everytime).
      datasetOptions: {},
      activeDataset: '' // Holds the name of the active dataset
    }
  },
  computed: {
    legendValuePosition: function () {
      if (!this.value.legend.display) {
        return 'none' // Merge display + position into one option
      }
      
      return this.value.legend.position
    }
  },
  watch: {
    dataset: function () {
      this.sanitiseDatasetOptions()
    }
  },
  mounted: function () {
    this.sanitiseDatasetOptions()
  },
  methods: {
    handleFileUpload: function (event) {
      const file = event.target.files[0]

      if (!file) {
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const contents = event.target.result
        // Now we have the file and can process the results
        this.parseFile(contents, file.name) // Why pass the name? To guess the file type
      }

      reader.readAsText(file)
    },
    sanitiseDatasetOptions: function () {
      // Make sure to produce new option sets as applicable ...
      for (const key in this.dataset) {
        if (this.datasetOptions[key] === undefined) {
          Vue.set(this.datasetOptions, key, this.initOptions())
        }
      }

      // ... and remove non-existing
      for (const key in this.datasetOptions) {
        if (this.dataset[key] === undefined) {
          Vue.delete(this.datasetOptions, key)
        }
      }

      if (this.dataset[this.activeDataset] === undefined) {
        // Make sure we always have a valid pointer to a correct dataset
        this.activeDataset = Object.keys(this.dataset)[0]
      }

      // Afterwards, emit an event
      this.$emit('datasetoptions', this.datasetOptions)
    },
    setOptions: function () {
      const newValue = Object.assign({}, this.value)
      newValue.title.text = this.$refs['title-text'].value
      newValue.title.position = this.$refs['title-position'].value

      newValue.drawChartBackground = this.$refs['draw-chart-background'].checked
      newValue.chartBackgroundColor = this.$refs['chart-background-color'].value

      // We're merging two options into one here
      if (this.$refs['legend-position'].value === 'none') {
        newValue.legend.display = false
        newValue.legend.position = 'top'
      } else {
        newValue.legend.display = true
        newValue.legend.position = this.$refs['legend-position'].value
      }

      newValue.padding = parseInt(this.$refs['layout-padding'].value, 10)

      newValue.resolution = parseInt(this.$refs['export-resolution'].value, 10)

      // We need to make sure these elements are in fact rendered.
      if (['bar', 'horizontalBar'].includes(this.chartType)) {
        newValue.barChart.barPercentage = parseFloat(this.$refs['barchart-bar-percentage'].value)
        newValue.barChart.categoryPercentage = parseFloat(this.$refs['barchart-cat-percentage'].value)
        newValue.barChart.stacked = this.$refs['barchart-stacked'].checked

        // We need to transform the chartType itself if this here changes
        newValue.barChart.horizontal = this.$refs['barchart-horizontal'].checked

        if (newValue.barChart.horizontal && this.chartType === 'bar') {
          this.$nextTick(() => { this.$emit('charttype', 'horizontalBar') })
        } else if (!newValue.barChart.horizontal && this.chartType === 'horizontalBar') {
          this.$nextTick(() => { this.$emit('charttype', 'bar') })
        }
      } else if (this.chartType === 'pie') {
        newValue.pieChart.cutoutPercentage = parseInt(this.$refs['piechart-cutout'].value, 10)
      }

      newValue.xAxis.gridLines.display = this.$refs['xaxisgrid-display'].checked
      newValue.xAxis.gridLines.drawOnChartArea = this.$refs['xaxisgrid-drawonchartarea'].checked
      newValue.xAxis.gridLines.drawTicks = this.$refs['xaxisgrid-drawticks'].checked
      newValue.yAxis.gridLines.display = this.$refs['yaxisgrid-display'].checked
      newValue.yAxis.gridLines.drawOnChartArea = this.$refs['yaxisgrid-drawonchartarea'].checked
      newValue.yAxis.gridLines.drawTicks = this.$refs['yaxisgrid-drawticks'].checked

      newValue.xAxis.label = this.$refs['xaxis-label'].value
      newValue.yAxis.label = this.$refs['yaxis-label'].value

      newValue.xAxis.ticks.display = this.$refs['xaxisgrid-ticklabels'].checked
      newValue.yAxis.ticks.display = this.$refs['yaxisgrid-ticklabels'].checked

      newValue.xAxis.ticks.beforeValue = this.$refs['xaxis-ticks-before'].value
      newValue.xAxis.ticks.afterValue = this.$refs['xaxis-ticks-after'].value
      newValue.yAxis.ticks.beforeValue = this.$refs['yaxis-ticks-before'].value
      newValue.yAxis.ticks.afterValue = this.$refs['yaxis-ticks-after'].value

      newValue.yAxis.beginAtZero = this.$refs['yaxis-beginatzero'].checked

      // Finally emit an update
      this.$emit('input', newValue)
    },
    parseFile: function (contents, fileName) {
      // Rudimentary TSV/CSV parsing. TOLD YOU IT'S JUST A SMALL TOOL! Don't
      // expect the data loader to fulfill wonders. HOWEVER it's still easier
      // to get a TSV file right than it is to force Excel to produce a simple
      // chart.
      const ext = fileName.substr(fileName.lastIndexOf('.'))
      if (![ '.tsv', '.csv' ].includes(ext)) {
        alert(`Unrecognised file extension: "${ext}".\n\nPlease select a ".csv" or ".tsv" file to load.`)
        return
      }

      const isTSV = ext.toLowerCase() === '.tsv'
      // const isCSV = ext.toLowerCase() === '.csv'

      const lines = contents.trim().split('\n')

      let separator = ','

      if (isTSV) {
        // We should split the data based on tabs
        separator = '\t'
      }

      for (let lineNo = 0; lineNo < lines.length; lineNo++) {
        lines[lineNo] = lines[lineNo].split(separator)
      }

      // Now we should have a two-dimensional array in the form of row:col. We
      // now need to get that into our dataset format.
      const datasets = {}
      // First row = labels
      for (const label of lines.shift()) {
        datasets[label] = []
      }

      // Here we again pivot the table to match chart.js's data structure.

      const labelArray = Object.keys(datasets)

      for (let row = 0; row < lines.length; row++) {
        for (let col = 0; col < lines[row].length; col++) {
          // Retrieve the correct label
          const label = labelArray[col]
          datasets[label].push(lines[row][col])
        }
      }

      // At this point we have the correct data size and can notify the app
      this.$emit('dataset', datasets)

      // Now that the app has the correct data, let's make sure our labels are
      // sane again
      this.$emit('useaslabels', labelArray[0])
    },
    initOptions: function () {
      const options = {}

      options.colour = {
        r: Math.random() * 255,
        g: Math.random() * 255,
        b: Math.random() * 255,
        a: 0.8,
        // Enable easy stringification
        toString: function (alpha) {
          if (alpha === undefined) {
            alpha = this.a
          }
          return `rgba(${this.r}, ${this.g}, ${this.b}, ${alpha})`
        },
        // Also to hex
        toHex: function () { return rgbHex(this.r, this.g, this.b) },
        // And also enable outputting the reverse colour
        inverseString: function (alpha) {
          if (alpha === undefined) {
            alpha = this.a
          }

          return `rgba(${255 - this.r}, ${255 - this.g}, ${255 - this.b}, ${alpha})`
        },
        // And finally, we also want this color to be able to output us shades
        shadeArray: function (numShades, alpha) {
          if (alpha === undefined) {
            alpha = this.a
          }
          // General: Shades work by multiplying the colour with 1/4, 1/2, etc.
          // Tints work by multiplying the inverse with the same ratio.
          // The smaller/greater the ratio, the darker/lighter the shade/tint.
          // Thanks to https://stackoverflow.com/a/6615053 for the super-easy
          // explanation.

          // First, let's determine how many shades and how many tints we need.
          // For that, we first compute how many theoretical values lie below
          // and above our current colour value.
          const valuesBelow = this.r + this.g + this.b - 3
          const valuesAbove = 255 - this.r + 255 - this.g + 255 - this.b
          // All three components add up to 765, so the sum is 762 (minus the
          // three components from our actual colour).
          const sum = 762
          // How many bins do we need? This determines the distance between colours.
          const part = 762 / numShades
          // Now we can see how often these parts fit into the two slices of the
          // colour range and we know how many shades and how many tints we need.
          const shades = Math.floor(valuesBelow / part)
          const tints = Math.floor(valuesAbove / part)
          // NOTE: We have to floor to make space for our one "normal" color that
          // we want to stack in between its shades and tints.
          
          // Now build the array. We go from dark to light. Otherwise would also
          // be possible.
          const ret = []
          for (let i = shades; i >= 0; i--) {
            const r = this.r / (i + 1)
            const g = this.g / (i + 1)
            const b = this.b / (i + 1)
            ret.push(`rgba(${r}, ${g}, ${b}, ${alpha})`)
          }

          // Add the actual colour in between
          ret.push(this.toString(alpha))

          // Third, add the tints.
          for (let i = 1; i <= tints; i++) {
            const r = this.r + (255 - this.r) / (tints - i + 1)
            const g = this.g + (255 - this.g) / (tints - i + 1)
            const b = this.b + (255 - this.b) / (tints - i + 1)
            ret.push(`rgba(${r}, ${g}, ${b}, ${alpha})`)
          }

          return ret // Et voilà!
        }
      }

      options.pointStyle = 'circle'

      options.tension = 0 // Determines the amount of curviness
      options.pointRadius = 0 // 0 = disable
      options.fill = false // Whether or not the AUC should be filled
      options.borderWidth = 2

      return options
    },
    updateColour: function (color, hexVal) {
      const cols = hexRgb(hexVal)
      color.r = cols.red
      color.g = cols.green
      color.b = cols.blue

      // Afterwards, emit an event
      this.$emit('datasetoptions', this.datasetOptions)
    }
  }
}
</script>

<style>
/** Such empty */
</style>
