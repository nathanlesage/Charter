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
import Chart from 'chart.js/auto'

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
        const barChartOptions = this.options.barChart

        // Now we need to fiddle a little bit with the colours. First, we need
        // some generic colours that apply by default.
        const defaultSolidColor = (options.colour !== undefined) ? options.colour.toString(1) : ''
        const defaultAlphaColor = (options.colour !== undefined) ? options.colour.toString(): ''
        const inverseSolidColor = (options.colour !== undefined) ? options.colour.inverseString(1): ''
        const inverseAlphaColor = (options.colour !== undefined) ? options.colour.inverseString(): ''

        // Apply these colors first.
        let bColor = defaultSolidColor
        let pBgColor = defaultSolidColor
        let bgColor = defaultAlphaColor
        let hBgColor = inverseAlphaColor
        let hBColor = inverseSolidColor

        // Now, if we have a pie chart, or a bar chart with just one data type,
        // we must instead apply an array of colours. For simplicity's sake, we
        // will simply use an array of shades computed from the actual bar
        // bar colour.
        const shadesNeeded = (this.chartType === 'pie' || this.chartType === 'bar') && data.length === 2
        if (shadesNeeded && options.colour !== undefined) {
          const solidArray = options.colour.shadeArray(data[i].length, 1)
          const alphaArray = options.colour.shadeArray(data[i].length)

          bColor = solidArray
          pBgColor = solidArray
          bgColor = alphaArray
        }

        // Last but not least, we need to re-form the data if the user wants
        // to create a scatter plot. In that case, the label dataset will also
        // provide the x-axis values, not just the labels.
        let datasetData = data[i]
        if (this.chartType === 'scatter' && labels.includes(this.useAsLabels)) {
          const xValues = data[labels.indexOf(this.useAsLabels)]

          datasetData = data[i].map((elem, index) => {
            return {
              x: xValues[index],
              y: elem
            }
          })
        }

        chartDatasets.push({
          label: labels[i],
          data: datasetData,
          // Border colour and point background are both always opacity 1,
          // but the background colour can differ, which is why we take the
          // alpha saved within the colour.
          borderColor: bColor,
          pointBackgroundColor: pBgColor,
          backgroundColor: bgColor,
          hoverBackgroundColor: hBgColor,
          hoverBoderColor: hBColor,
          pointStyle: options.pointStyle,
          pointRadius: options.pointRadius,
          tension: options.tension,
          fill: options.fill,
          borderWidth: options.borderWidth,
          // These options will be respected once the chart type is set to bar
          barPercentage: barChartOptions.barPercentage,
          categoryPercentage: barChartOptions.categoryPercentage
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
    options: function (newOptions, oldOptions) {
      if (this.chart === null) {
        return
      }

      const resChanged = this.chart.options.devicePixelRatio !== this.options.resolution

      if (resChanged) {
        // We need to re-create the whole thing
        this.createChart()
      } else {
        // Updating suffices
        this.chart.options = this.getChartOptions()
        // Finally, update the chart
        this.chart.update()
      }
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
            // After 3.x migration adapted from https://www.chartjs.org/docs/master/configuration/canvas-background.html
            id: 'background',
            beforeDraw: function (chart, mysteryOption, pluginOptions) {
              const { draw, color } = pluginOptions
              if (!draw) {
                return // Leave the transparent background
              }

              const ctx = chart.canvas.getContext('2d')
              ctx.save() // Save context settings, e.g. the fillStyle
              // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
              ctx.globalCompositeOperation = 'destination-over'
              ctx.fillStyle = color
              ctx.fillRect(0, 0, chart.width, chart.height)
              ctx.restore() // Restore the previous settings, e.g., the fillStyle
            }
          }
        ]
      }) // END chart instantiation
    },
    getChartOptions: function () {
      // Two variables we need for horizontal bar charts
      const isBar = this.chartType === 'bar'
      const isHorizontal = this.options.barChart.horizontal

      // First all options that we can define inline
      const options = {
        // Horizontal bar charts have y as the index axis
        indexAxis: (isBar && isHorizontal) ? 'y' : 'x',
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
        // Scales configuration
        scales: {
          y: {
            title: {
              display: this.options.yAxis.label.trim() !== '',
              text: this.options.yAxis.label
            },
            grid: this.options.yAxis.grid,
            beginAtZero: this.options.yAxis.beginAtZero,
            ticks: {
              display: this.options.yAxis.ticks.display,
            }
          },
          x: {
            title: {
              display: this.options.xAxis.label.trim() !== '',
              text: this.options.xAxis.label
            },
            grid: this.options.xAxis.grid,
            ticks: {
              display: this.options.xAxis.ticks.display
            },
            // Will be respected if this is a bar chart
            stacked: this.options.barChart.stacked
          }
        },
        // Generic options we need every time
        responsive: true,
        maintainAspectRatio: false,
        cutoutPercentage: this.options.pieChart.cutoutPercentage,
        hover: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          background: {
            draw: this.options.drawChartBackground,
            color: this.options.chartBackgroundColor
          },
          // Tooltips should be fastly visible, b/c they won't be exported either way
          tooltip: {
            mode: 'index',
            intersect: false,
          },
          legend: this.options.legend,
          title: {
            // Only display title if set
            display: this.options.title.text.trim() !== '',
            text: this.options.title.text.split('<lf>'), // Enable multi-line with "<lf>"
            position: this.options.title.position
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
        options.scales.x.ticks.callback = function (value, index, allValues) {
          return `${beforeXValue}${value}${afterXValue}`
        }
      }

      if (beforeYValue.trim() !== '' || afterYValue.trim() !== '') {
        options.scales.y.ticks.callback = function (value, index, allValues) {
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
