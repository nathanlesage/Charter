<template>
  <div class="padded-vertically">
    <!-- DATA VIEWER OPTIONS -->
    <template v-if="currentView === 'data'">
      <p>
        Here you can load and preview a dataset to get a first impression of
        what it will look like. Charter supports loading TSV and CSV files. As
        the tool is meant to be simple, make sure to only load number sets and
        ensure the file is well-formed. Each column corresponds to one dataset,
        the first row of the file will be taken as labels.
      </p>

      <button
          class="btn btn-large btn-default"
          v-on:click="$refs['file-input'].click()"
        >
          <span class="icon icon-list"></span>
          Load file
        </button>
      <input type="file" ref="file-input" style="display: none;">

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

      <template v-if="Object.keys(dataset).length > 0">
        <p>Which column should form the labels?</p>
        <select
          ref="use-as-labels"
          class="form-control"
          v-bind:value="useAsLabels"
          v-on:input="$emit('useaslabels', $event.target.value)"
        >
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
      <!-- GENERIC SETTINGS APPLICABLE TO ALL CHART TYPES -->
      <div class="form-group">
        <label>Chart Title and Position</label>
        <input
          ref="title-text"
          type="text"
          class="form-control"
          placeholder="Chart title"
          v-bind:value="value.title.text"
          v-on:input="setOptions()"
        >
      </div>
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

      <div class="checkbox">
        <label>
          <input
            ref="legend-display"
            type="checkbox"
            v-bind:checked="value.legend.display"
            v-on:input="setOptions()"
          > Display legend?
        </label>
      </div>
      <select
        ref="legend-position"
        class="form-control"
        v-bind:value="value.legend.position"
        v-on:input="setOptions()"
      >
        <option value="top">Top</option>
        <option value="left">Left</option>
        <option value="right">Right</option>
        <option value="bottom">Bottom</option>
      </select>

      <hr>

      <!-- CHART TYPE -->
      <div class="btn-group padded-vertically">
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
            'active': chartType === 'bar'
          }"
          title="Bar chart"
          v-on:click="$emit('charttype', 'bar')"
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

      <!-- Let the user assign a color to each dataset -->
      <div v-for="color, dataset in datasetColours" v-bind:key="dataset">
        {{ dataset }}
        <input
          type="color"
          v-bind:value="'#' + color.toHex()"
          v-on:input="updateColor(color, $event.target.value)"
        >
      </div>
    </template>
  </div>
</template>

<script>
import rgbHex from 'rgb-hex'
import hexRgb from 'hex-rgb'

export default {
  name: 'SidebarOptions',
  props: {
    currentView: {
      type: String,
      default: 'data'
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
      datasetColours: {} // Holds a colour for each dataset, split up in r, g, b, and a
    }
  },
  watch: {
    dataset: function () {
      // Make sure to produce new colours as applicable
      for (const key in this.dataset) {
        if (this.datasetColours[key] === undefined) {
          this.datasetColours[key] = this.randomColour()
        }
      }

      // ... and remove non-existing
      for (const key in this.datasetColours) {
        if (this.dataset[key] === undefined) {
          delete this.datasetColours[key]
        }
      }

      // Afterwards, emit an event
      this.$emit('colours', this.datasetColours)
    }
  },
  mounted: function () {
    this.$refs['file-input'].addEventListener('change', (event) => {
      const file = event.target.files[0]

      if (!file) {
        return
      }

      console.log('Loading file ' + file.name)

      const reader = new FileReader()
      reader.onload = (event) => {
        const contents = event.target.result
        // Now we have the file and can process the results
        this.parseFile(contents, file.name) // Why pass the name? To guess the file type
      }

      reader.readAsText(file)
    }, false)
  },
  methods: {
    setOptions: function () {
      const newValue = Object.assign({}, this.value)
      newValue.title.text = this.$refs['title-text'].value
      newValue.title.position = this.$refs['title-position'].value

      newValue.legend.display = this.$refs['legend-display'].checked
      newValue.legend.position = this.$refs['legend-position'].value

      // Finally emit an update
      this.$emit('input', newValue)
    },
    parseFile: function (contents, fileName) {
      // Rudimentary TSV/CSV parsing. TOLD YOU IT'S JUST A SMALL TOOL! Don't
      // expect the data loader to fulfill wonders. HOWEVER it's still easier
      // to get a TSV file right than it is to force Excel to produce a simple
      // chart.
      const ext = fileName.substr(fileName.lastIndexOf('.'))
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
    randomColour: function () {
      return {
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
        toHex: function () { return rgbHex(this.r, this.g, this.b) }
      }
    },
    updateColor: function (color, hexVal) {
      const cols = hexRgb(hexVal)
      color.r = cols.red
      color.g = cols.green
      color.b = cols.blue

      // Afterwards, emit an event
      this.$emit('colours', this.datasetColours)
    }
  }
}
</script>

<style>
/** Such empty */
</style>
