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

<script lang="ts">
import { defineComponent } from 'vue'
import Chart, { ChartType, ChartDataset } from 'chart.js/auto'
import { Dataset, ChartOptions, DatasetOptions } from './store'

let chart: Chart|null = null

export default defineComponent({
  name: 'ChartViewer',
  data: function () {
    return {}
  },
  computed: {
    dataset: function (): Dataset {
      return this.$store.state.dataset
    },
    chartType: function (): ChartType {
      return this.$store.state.chartType
    },
    labelDataset: function (): string|undefined {
      return this.$store.state.labelDataset
    },
    datasetOptions: function (): DatasetOptions {
      return this.$store.state.datasetOptions
    },
    options: function (): ChartOptions {
      return this.$store.state.chartOptions
    },
    chartCanvas: function (): HTMLCanvasElement {
      return this.$refs.chart as HTMLCanvasElement
    },
    /**
     * Returns the dataset in a form that Chart.js can consume
     *
     * @return  {Array}  An array with all datasets
     */
    chartData: function (): ChartDataset[] {
      const labels = Object.keys(this.dataset)
      const data = Object.values(this.dataset)

      const chartDatasets: ChartDataset[] = []

      for (let i = 0; i < labels.length; i++) {
        if (labels[i] === this.labelDataset) {
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
        let bColor: string|string[] = defaultSolidColor
        let pBgColor: string|string[] = defaultSolidColor
        let bgColor: string|string[] = defaultAlphaColor
        let hBgColor = inverseAlphaColor
        let hBColor = inverseSolidColor

        // Now, if we have a pie chart, or a bar chart with just one data type,
        // we must instead apply an array of colours. For simplicity's sake, we
        // will simply use an array of shades computed from the actual bar
        // bar colour.
        const shadesNeeded = ([ 'pie', 'bar' ].includes(this.chartType)) && data.length === 2
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
        let datasetData: number[]|{ x: number, y: number }[] = data[i].map(elem => parseFloat(elem))
        if (this.chartType === 'scatter' && labels.includes(this.labelDataset as string)) {
          const xValues = data[labels.indexOf(this.labelDataset as string)]

          datasetData = data[i].map((elem, index) => {
            return {
              x: parseFloat(xValues[index]),
              y: parseFloat(elem)
            }
          })
        }

        chartDatasets.push({
          label: labels[i],
          data: datasetData as any,
          // Border colour and point background are both always opacity 1,
          // but the background colour can differ, which is why we take the
          // alpha saved within the colour.
          borderColor: bColor,
          pointBackgroundColor: pBgColor,
          backgroundColor: bgColor,
          hoverBackgroundColor: hBgColor,
          hoverBorderColor: hBColor,
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

      console.log(chartDatasets)

      return chartDatasets
    }
  },
  watch: {
    chartType: function () {
      if (chart === null) {
        return
      }

      this.createChart()
    },
    chartData: function () {
      // The chart data has changed so we need to update
      if (chart === null) {
        return
      }

      chart.data.datasets = this.chartData
      chart.update()
    },
    options: function (newOptions, oldOptions) {
      if (chart === null) {
        return
      }

      const resChanged = chart.options.devicePixelRatio !== this.options.resolution

      if (resChanged) {
        // We need to re-create the whole thing
        this.createChart()
      } else {
        // Updating suffices
        chart.options = this.getChartOptions()
        // Finally, update the chart
        chart.update()
      }
    }
  },
  mounted: function () {
    this.createChart()
  },
  methods: {
    createChart: function () {
      if (chart !== null) {
        chart.destroy()
      }

      // @ts-ignore The ChartJS types are too complex for dynamic instantiation
      chart = new Chart(this.chartCanvas, {
        type: this.chartType,
        data: {
          labels: this.dataset[this.labelDataset ?? ''],
          datasets: this.chartData
        },
        options: this.getChartOptions(),
        plugins: [
          {
            // This custom plugin simply draws a rectangle that fills the whole
            // background of the chart with a single colour.
            // After 3.x migration adapted from https://www.chartjs.org/docs/master/configuration/canvas-background.html
            id: 'background',
            beforeDraw: function (chart: Chart, args: { cancelable: true }, options: any) {
              const { draw, color } = options
              if (!draw) {
                return // Leave the transparent background
              }

              const ctx = chart.canvas.getContext('2d')
              if (ctx === null) {
                return
              }

              ctx.save() // Save context settings, e.g. the fillStyle
              // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
              ctx.globalCompositeOperation = 'destination-over'
              ctx.fillStyle = color
              ctx.fillRect(0, 0, chart.width, chart.height)
              ctx.restore() // Restore the previous settings, e.g., the fillStyle
            }
          }
        ]
      } as any) // END chart instantiation
    },
    getChartOptions: function (): any {
      // Two variables we need for horizontal bar charts
      const isBar = this.chartType === 'bar'
      const isHorizontal = this.options.barChart.horizontal

      // Should we customise the tick labels?
      const beforeXValue = this.options.xAxis.ticks.beforeValue
      const afterXValue = this.options.xAxis.ticks.afterValue
      const beforeYValue = this.options.yAxis.ticks.beforeValue
      const afterYValue = this.options.yAxis.ticks.afterValue

      let xCallback = undefined
      if (beforeXValue.trim() !== '' || afterXValue.trim() !== '') {
        xCallback = function (value: any, index: number, allValues: any[]) {
          return `${beforeXValue}${value}${afterXValue}`
        }
      }

      let yCallback = undefined
      if (beforeYValue.trim() !== '' || afterYValue.trim() !== '') {
        xCallback = function (value: any, index: number, allValues: any[]) {
          return `${beforeYValue}${value}${afterYValue}`
        }
      }

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
              text: this.options.yAxis.label,
              font: { size: this.options.fontSize }
            },
            grid: this.options.yAxis.grid,
            beginAtZero: this.options.yAxis.beginAtZero,
            ticks: {
              display: this.options.yAxis.ticks.display,
              callback: yCallback,
              font: { size: this.options.fontSize }
            }
          },
          x: {
            title: {
              display: this.options.xAxis.label.trim() !== '',
              text: this.options.xAxis.label,
              font: { size: this.options.fontSize }
            },
            grid: this.options.xAxis.grid,
            ticks: {
              display: this.options.xAxis.ticks.display,
              callback: xCallback,
              font: { size: this.options.fontSize }
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
            position: this.options.title.position,
            font: { size: this.options.fontSize }
          }
        }
      }

      return options
    },
    getBase64: function () {
      if (chart === null) {
        return undefined
      }

      return chart.toBase64Image()
    }
  }
})
</script>

<style>
div#chart-viewer {
  position: relative;
  height: 100%;
}
</style>
