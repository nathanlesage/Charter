<template>
  <div class="padded-vertically">
    <!-- DATA VIEWER OPTIONS -->
    <template v-if="currentView === 'data'">
      <p>
        This view allows you to enter some data. In general, the top-row is
        reserved for labels, that is: The columns will be single data sets.
        If you have more than one column, this indicates that you have more than
        one line, for instance. Pie charts only work with extremely simple data.
      </p>

      <button
        class="btn btn-large btn-default"
        v-on:click="$refs['file-input'].click()"
      >
        <span class="icon icon-list"></span>
        Load file
      </button>
      <input type="file" ref="file-input" style="display: none;">

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
      </div>
    </template>
  </div>
</template>

<script>
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
    }
  }
}
</script>

<style>
/** Such empty */
</style>
