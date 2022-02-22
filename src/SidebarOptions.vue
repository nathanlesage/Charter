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
          v-on:click="addDataset()"
        >
          <span class="icon icon-list-add"></span>
          Add dataset
        </button>
        <button
          class="btn btn-large btn-default"
          v-on:click="addRow()"
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
          v-on:click="$emit('saveChart')"
        >
          Save chart
        </button>
        <button
          class="btn btn-small btn-default"
          v-on:click="$emit('copyChart')"
        >
          Copy to clipboard
        </button>
      </div>

      <Slider
        v-model="localOptions.resolution"
        v-bind:label="'Export resolution'"
        v-bind:min="1"
        v-bind:max="10"
      ></Slider>

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
      <Text
        v-model="localOptions.title.text"
        v-bind:label="'Chart Title and Position'"
        v-bind:placeholder="'Chart title'"
      ></Text>
      <Dropdown
        v-model="localOptions.title.position"
        v-bind:options="{
          'Top': 'top',
          'Left': 'left',
          'Right': 'right',
          'Bottom': 'bottom'
        }"
      ></Dropdown>

      <label><strong>Chart legend and position</strong></label>
      <Checkbox
        v-model="localOptions.legend.display"
        v-bind:label="'Display legend'"
      ></Checkbox>
      <Dropdown
        v-model="localOptions.legend.position"
        v-bind:disabled="!localOptions.legend.display"
        v-bind:options="{
          'Top': 'top',
          'Left': 'left',
          'Right': 'right',
          'Bottom': 'bottom'
        }"
      ></Dropdown>

      <label for="barchart-bar-percentage"><strong>Font size</strong></label>
      <input
        ref="chart-font-size"
        id="chart-font-size"
        class="form-control"
        type="number"
        min="2"
        max="200"
        step="1"
        v-model="localOptions.fontSize"
      >

      <Slider
        v-model="localOptions.padding"
        v-bind:label="`Chart spacing (${localOptions.padding}px)`"
        v-bind:min="0"
        v-bind:max="200"
      ></Slider>

      <Checkbox
        v-model="localOptions.drawChartBackground"
        v-bind:label="'Chart background color'"
      ></Checkbox>

      <div style="display: flex; justify-content: space-between; align-items: center;">
        <label>Chart background color:</label>
        <input
          ref="chart-background-color"
          type="color"
          v-model="localOptions.chartBackgroundColor"
          v-bind:disabled="!localOptions.drawChartBackground"
        >
      </div>

      <!-- Now settings for specific chart types -->
      <template v-if="chartType === 'bar'">
         <Slider
          v-model="localOptions.barChart.barPercentage"
          v-bind:label="'Bar width'"
          v-bind:min="0"
          v-bind:max="1"
          v-bind:step="0.1"
        ></Slider>

        <Slider
          v-model="localOptions.barChart.categoryPercentage"
          v-bind:label="'Category width'"
          v-bind:min="0"
          v-bind:max="1"
          v-bind:step="0.1"
        ></Slider>

        <Checkbox
          v-model="localOptions.barChart.stacked"
          v-bind:label="'Stacked bar chart'"
        ></Checkbox>

        <Checkbox
          v-model="localOptions.barChart.horizontal"
          v-bind:label="'Horizontal bar chart'"
        ></Checkbox>
      </template>
      <template v-else-if="chartType === 'pie'">
        <Slider
          v-model="localOptions.pieChart.cutoutPercentage"
          v-bind:label="'Pie Chart Cutout'"
          v-bind:min="0"
          v-bind:max="100"
        ></Slider>
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
            v-on:input="datasetOptions[activeDataset].colour.fromHex(($event.target as any).value)"
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

      <Text
        v-model="localOptions.xAxis.label"
        v-bind:placeholder="'Enter your x-axis label here'"
      ></Text>

      <label class="padded-top">Customise ticks: {{ localOptions.xAxis.ticks.beforeValue }}1.23{{ localOptions.xAxis.ticks.afterValue }}</label>

      <Text
        v-model="localOptions.xAxis.ticks.beforeValue"
        v-bind:placeholder="'Before tick labels, e.g. $'"
      ></Text>
      <Text
        v-model="localOptions.xAxis.ticks.afterValue"
        v-bind:placeholder="'After tick labels, e.g. $'"
      ></Text>

      <Checkbox
        v-model="localOptions.xAxis.grid.display"
        v-bind:label="'Display the x-axis grid'"
      ></Checkbox>

      <Checkbox
        v-model="localOptions.xAxis.grid.drawOnChartArea"
        v-bind:label="'Gridlines'"
        v-bind:disabled="!localOptions.xAxis.grid.display"
      ></Checkbox>

      <Checkbox
        v-model="localOptions.xAxis.grid.drawTicks"
        v-bind:label="'Tick lines'"
        v-bind:disabled="!localOptions.xAxis.grid.display"
      ></Checkbox>

      <Checkbox
        v-model="localOptions.xAxis.ticks.display"
        v-bind:label="'Tick labels'"
      ></Checkbox>

      <label><strong>y-Axis</strong></label>

      <Text
        v-model="localOptions.yAxis.label"
        v-bind:placeholder="'Enter your y-axis label here'"
      ></Text>

      <label class="padded-top">Customise ticks: {{ localOptions.yAxis.ticks.beforeValue}}1.23{{ localOptions.yAxis.ticks.afterValue }}</label>

      <Text
        v-model="localOptions.yAxis.ticks.beforeValue"
        v-bind:placeholder="'Before tick labels, e.g. $'"
      ></Text>
      <Text
        v-model="localOptions.yAxis.ticks.afterValue"
        v-bind:placeholder="'After tick labels, e.g. $'"
      ></Text>

      <Checkbox
        v-model="localOptions.yAxis.grid.display"
        v-bind:label="'Display the y-axis grid'"
      ></Checkbox>

      <Checkbox
        v-model="localOptions.yAxis.grid.drawOnChartArea"
        v-bind:disabled="!localOptions.yAxis.grid.display"
        v-bind:label="'Gridlines'"
      ></Checkbox>

      <Checkbox
        v-model="localOptions.yAxis.grid.drawTicks"
        v-bind:disabled="!localOptions.yAxis.grid.display"
        v-bind:label="'Ticks'"
      ></Checkbox>

      <Checkbox
        v-model="localOptions.yAxis.ticks.display"
        v-bind:label="'Tick labels'"
      ></Checkbox>

      <Checkbox
        v-model="localOptions.yAxis.beginAtZero"
        v-bind:label="'Start axis values at y=0'"
      ></Checkbox>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import rgbHex from 'rgb-hex'
import hexRgb from 'hex-rgb'

import mainPackage from '../package.json'
import chartPackage from 'chart.js/package.json'
import vuePackage from 'vue/package.json'

import { ChartOptions, ChartType, Dataset, DatasetOption, DatasetOptions, getDefaultChartOptions } from './store'
import Color from './color'
import Checkbox from './components/Checkbox.vue'
import Slider from './components/Slider.vue'
import Text from './components/Text.vue'
import Dropdown from './components/Dropdown.vue'

export default defineComponent({
    name: "SidebarOptions",
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
            chartJSVersion: chartPackage.version,
            localOptions: getDefaultChartOptions(),
            ignoreNextUpdate: false
        };
    },
    emits: [ 'copyChart', 'saveChart' ],
    computed: {
        dataset: function (): Dataset {
            return this.$store.state.dataset;
        },
        datasetOptions: function (): DatasetOptions {
            return this.$store.state.datasetOptions;
        },
        chartOptions: function (): ChartOptions {
            return this.$store.state.chartOptions;
        },
        labelDataset: function (): string {
            return this.$store.state.labelDataset;
        },
        activeDataset: function (): string {
            return this.$store.state.activeDataset;
        },
        activeDatasetOptions: function (): DatasetOption {
            return this.$store.getters.activeDatasetOptions();
        },
        chartType: function (): ChartType {
            return this.$store.state.chartType;
        }
    },
    watch: {
        // Here we implement two-way data binding: When the store options change,
        // we update the local options, and vice versa. This way we can perform an
        // easy data-binding above in the components. We prevent endless loops
        // using the ignoreNextUpdate property
        chartOptions: {
          deep: true,
          handler () {
            if (this.ignoreNextUpdate) {
              this.ignoreNextUpdate = false
              return
            }
            this.ignoreNextUpdate = true

            // Store --> here
            const deepClone = JSON.parse(JSON.stringify(this.chartOptions));
            this.localOptions = deepClone;
          }
        },
        localOptions: {
          deep: true,
          handler () {
            if (this.ignoreNextUpdate) {
              this.ignoreNextUpdate = false
              return
            }
            this.ignoreNextUpdate = true

            // Here --> store
            const deepClone = JSON.parse(JSON.stringify(this.localOptions));
            this.$store.commit("chartOptions", deepClone);
          }
        }
    },
    mounted: function () {
    },
    methods: {
        handleFileUpload: function (event: Event) {
            if (!(event.target instanceof HTMLInputElement)) {
                return;
            }
            const fileList = event.target.files;
            if (fileList === null) {
                return;
            }
            this.$store.dispatch('readFile', fileList[0])
        },
        setChartType: function (newType: string) {
            this.$store.commit("chartType", newType);
        },
        startFileupload: function () {
            (this.$refs["file-input"] as HTMLInputElement).click();
        },
        setActiveDataset: function (newDataset: string) {
            this.$store.commit("activeDataset", newDataset);
        },
        setLabelDataset: function (newDataset: string | undefined) {
            if (newDataset === "") {
                newDataset = undefined;
            }
            this.$store.commit("labelDataset", newDataset);
        },
        addDataset: function () {
          this.$store.dispatch('addDataset')
        },
        addRow: function () {
          this.$store.dispatch('addRow')
        }
    },
    components: { Checkbox, Slider, Text, Dropdown }
})
</script>

<style>
/** Such empty */
</style>
