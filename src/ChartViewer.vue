<template>
  <div id="chart-viewer">
    <canvas
      ref="chart"
      id="main-chart"
      width="400"
      height="300"
      aria-label="Main Chart Display"
      role="img"
      style="background-color: white;"
    ></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js'

export default {
  name: 'ChartViewer',
  props: {
    // The overall chart type
    chartType: {
      type: String,
      default: 'line'
    },
    // The data
    dataset: {
      type: Object,
      default: function () { return {} }
    },
    // Chart options
    options: {
      type: Object,
      default: function () { return {} }
    },
    // Which dataset to use as labels?
    useAsLabels: {
      type: String,
      default: ''
    },
    // Custom settings for each dataset
    datasetOptions: {
      type: Object,
      default: function () { return {} }
    }
  },
  data: function () {
    return {
      chart: null
    }
  },
  computed: {
    /**
     * Returns the dataset in a form that Chart.js can consume
     *
     * @return  {Array}  An array with all datasets
     */
    chartData: function () {
      const labels = Object.keys(this.dataset)
      const data = Object.values(this.dataset)

      const chartDatasets = []

      for (let i = 0; i < labels.length; i++) {
        if (labels[i] === this.useAsLabels) {
          continue // Obviously don't use *THAT* column
        }

        const options = this.datasetOptions[labels[i]]

        chartDatasets.push({
          label: labels[i],
          data: data[i],
          borderColor: (options.colour !== undefined) ? options.colour.toString(1) : '',
          backgroundColor: (options.colour !== undefined) ? options.colour.toString(0.6): '',
          pointBackgroundColor: (options.colour !== undefined) ? options.colour.toString(1) : '',
          pointStyle: options.pointStyle,
          pointRadius: options.pointRadius,
          tension: options.tension,
          fill: options.fill,
          borderWidth: options.borderWidth
        })
      }

      return chartDatasets
    }
  },
  watch: {
    chartType: function () {
      if (this.chart === null) {
        return
      }

      this.createChart()
    },
    chartData: function () {
      // The chart data has changed so we need to update
      if (this.chart === null) {
        return
      }

      this.chart.data.datasets = this.chartData
      this.chart.update()
    },
    options: function () {
      if (this.chart === null) {
        return
      }

      if (this.chart.options.devicePixelRatio !== this.options.resolution) {
        // We need to re-create the whole thing
        this.createChart()
      } else {
        // Updating suffices
        this.chart.options = this.getChartOptions()
      }



      // Finally, update the chart
      this.chart.update()
    }
  },
  mounted: function () {
    this.createChart()
  },
  methods: {
    createChart: function () {
      if (this.chart !== null) {
        this.chart.destroy()
      }

      this.chart = new Chart(this.$refs.chart, {
        type: this.chartType,
        data: {
          labels: this.dataset[this.useAsLabels], // Might be undefined, but doesn't throw
          datasets: this.chartData
        },
        options: this.getChartOptions(),
        plugins: [
          {
            // This custom plugin simply draws a rectangle that fills the whole
            // background of the chart with a single colour.
            id: 'background',
            beforeDraw: function (chart, mysteryOption, pluginOptions) {
              if (!pluginOptions.draw) {
                return // Leave the transparent background
              }

              // Fill the complete background with a colour of our choice.
              const width = chart.chart.width
              const height = chart.chart.height

              const oldStyle = chart.chart.ctx.fillStyle
              chart.chart.ctx.fillStyle = pluginOptions.color
              chart.chart.ctx.fillRect(0, 0, width, height)
              chart.chart.ctx.fillStyle = oldStyle
            }
          }
        ]
      }) // END chart instantiation
    },
    getChartOptions: function () {
      // First all options that we can define inline
      const options = {
        title: {
          // Only display title if set
          display: this.options.title.text.trim() !== '',
          ...this.options.title // Fill in with the rest of the value
        },
        // Determine the resolution of the chart (necessary for exporting)
        devicePixelRatio: this.options.resolution,
        layout: {
          padding: {
            left: this.options.padding,
            right: this.options.padding,
            top: this.options.padding,
            bottom: this.options.padding
          },
        },
        legend: this.options.legend,
        // Scales configuration
        scales: {
          yAxes: [{
            scaleLabel: {
              display: this.options.yAxis.label.trim() !== '',
              labelString: this.options.yAxis.label
            },
            gridLines: this.options.yAxis.gridLines,
            ticks: {
              display: this.options.yAxis.ticks.display,
              beginAtZero: this.options.yAxis.beginAtZero
            }
          }],
          xAxes: [{
            scaleLabel: {
              display: this.options.xAxis.label.trim() !== '',
              labelString: this.options.xAxis.label
            },
            gridLines: this.options.xAxis.gridLines,
            ticks: {
              display: this.options.xAxis.ticks.display
            }
          }]
        },
        // Generic options we need every time
        responsive: true,
        maintainAspectRatio: false,
        // Tooltips should be fastly visible, b/c they won't be exported either way
        tooltips: {
          mode: 'index',
          intersect: false,
        },
        hover: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          background: {
            draw: this.options.drawChartBackground,
            color: this.options.chartBackgroundColor
          }
        }
      }

      // Now, tend to options we need to customise

      // Should we customise the tick labels?
      const beforeXValue = this.options.xAxis.ticks.beforeValue
      const afterXValue = this.options.xAxis.ticks.afterValue
      const beforeYValue = this.options.yAxis.ticks.beforeValue
      const afterYValue = this.options.yAxis.ticks.afterValue

      if (beforeXValue.trim() !== '' || afterXValue.trim() !== '') {
        options.scales.xAxes[0].ticks.callback = function (value, index, allValues) {
          return `${beforeXValue}${value}${afterXValue}`
        }
      }

      if (beforeYValue.trim() !== '' || afterYValue.trim() !== '') {
        options.scales.yAxes[0].ticks.callback = function (value, index, allValues) {
          return `${beforeYValue}${value}${afterYValue}`
        }
      }

      return options
    },
    getBase64: function () {
      if (this.chart === null) {
        return undefined
      }

      return this.chart.toBase64Image()
    }
  }
}
</script>

<style>
div#chart-viewer {
  position: relative;
  height: 100%;
}
</style>
