<template>
  <div id="chart-viewer">
    <canvas
      ref="chart"
      id="main-chart"
      width="400"
      height="300"
      aria-label="Main Chart Display"
      role="img"
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
    }
  },
  data: function () {
    return {
      chart: null
    }
  },
  computed: {
    chartData: function () {
      const labels = Object.keys(this.dataset)
      const data = Object.values(this.dataset)

      const chartDatasets = []

      for (let i = 0; i < labels.length; i++) {
        if (labels[i] === this.useAsLabels) {
          continue // Obviously don't use *THAT* column
        }

        chartDatasets.push({
          label: labels[i],
          data: data[i],
          borderColor: 'rgba(205, 230, 200, 1.0)',
          borderWidth: 2
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

      this.chart.options = this.getChartOptions()

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
        options: this.getChartOptions()
      }) // END chart instantiation
    },
    getChartOptions: function () {
      return {
        title: {
          // Only display title if set
          display: this.options.title.text.trim() !== '',
          ...this.options.title // Fill in with the rest of the value
        },
        legend: this.options.legend,
        // Scales configuration
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        },
        // Generic options we need every time
        responsive: true,
        maintainAspectRatio: false
      }
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
