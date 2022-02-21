/**
 * BEGIN HEADER
 *
 * Contains:        Vue component function
 * CVM-Role:        Model
 * Maintainer:      Hendrik Erz
 * License:         GNU GPL v3
 *
 * Description:     This file holds the configuration for the global Vuex store.
 *                  We only have a Vuex store in the main application window
 *                  as this one needs to actually handle a huge state – something
 *                  not applicable to the other windows.
 *
 * END HEADER
 */

import Color from './color'
import { StoreOptions, createStore, Store } from 'vuex'
 
export interface Dataset {
  [key: string]: string[]
}

export interface DatasetOption {
  colour: Color
  pointStyle: 'circle'|'cross'|'crossRot'|'dash'|'line'|'rect'|'rectRounded'|'rectRot'|'star'|'triangle'
  pointRadius: number
  tension: number
  borderWidth: number
  fill: boolean
}

export interface DatasetOptions {
  [key: string]: DatasetOption
}

export type ChartPosition = "left" | "right" | "bottom" | "top" | undefined

export interface ChartOptions {
  title: {
    text: string,
    position: ChartPosition
  }
  legend: {
    display: boolean
    position: ChartPosition
  }
  barChart: {
    barPercentage: number
    categoryPercentage: number
    stacked: boolean
    horizontal: boolean
  }
  pieChart: {
    cutoutPercentage: number
  }
  xAxis: {
    label: string
    grid: {
      display: boolean
      drawOnChartArea: boolean
      drawTicks: boolean
    }
    ticks: {
      display: boolean
      beforeValue: string
      afterValue: string
    }
  }
  yAxis: {
    label: string
    beginAtZero: boolean
    grid: {
      display: boolean
      drawOnChartArea: boolean
      drawTicks: boolean
    }
    ticks: {
      display: boolean
      beforeValue: string
      afterValue: string
    }
  }
  drawChartBackground: boolean
  chartBackgroundColor: string
  padding: number
  resolution: number
  fontSize: number
}

// Supported chart types by Charter
export type ChartType = 'line'|'bar'|'radar'|'pie'|'polarArea'|'scatter'

 /**
  * Declare the Vuex store interface
  */
export interface CharterState {
  dataset: Dataset
  datasetOptions: DatasetOptions
  chartOptions: ChartOptions
  chartType: ChartType
  labelDataset: string|undefined
  activeDataset: string|undefined
}

function getDefaultDatasetOptions (): DatasetOption {
  return {
    colour: new Color(),
    pointStyle: 'circle',
    pointRadius: 1,
    tension: 0.5,
    borderWidth: 1,
    fill: false
  }
}

const store: StoreOptions<CharterState> = {
  state () {
    return {
      dataset: {},
      datasetOptions: {},
      chartType: 'line',
      chartOptions: {
        title: {
          text: 'Untitled Chart',
          position: 'top'
        },
        legend: {
          display: true,
          position: 'top'
        },
        barChart: {
          barPercentage: 0.8,
          categoryPercentage: 0.8,
          stacked: false,
          horizontal: false
        },
        pieChart: {
          cutoutPercentage: 0
        },
        xAxis: {
          label: '',
          grid: {
            display: true,
            drawOnChartArea: true,
            drawTicks: true,
          },
          ticks: {
            display: true,
            beforeValue: '',
            afterValue: ''
          }
        },
        yAxis: {
          label: '',
          beginAtZero: false,
          grid: {
            display: true,
            drawOnChartArea: true,
            drawTicks: true
          },
          ticks: {
            display: true,
            beforeValue: '',
            afterValue: ''
          }
        },
        drawChartBackground: false,
        chartBackgroundColor: '#ffffff',
        padding: 30,
        resolution: window.devicePixelRatio,
        fontSize: 12
      },
      labelDataset: undefined,
      activeDataset: undefined
    }
  },
  getters: {
    activeDatasetOptions: function (state): DatasetOption|undefined {
      if (state.activeDataset === undefined) {
        return undefined
      } else {
        return state.datasetOptions[state.activeDataset]
      }
    }
  },
  mutations: {
    dataset: function (state, data: Dataset) {
      state.dataset = data

      // Make sure we have one dataset options per dataset
      for (const key in state.dataset) {
        if (!(key in state.datasetOptions)) {
          state.datasetOptions[key] = getDefaultDatasetOptions()
        }
      }

      // Remove excessive options again
      for (const key in state.datasetOptions) {
        if (!(key in state.dataset)) {
          delete state.datasetOptions[key]
        }
      }

      // Also, we always require one active dataset if applicable
      const labels = Object.keys(state.dataset)
      if (
        labels.length > 0 &&
        (state.activeDataset === undefined || !(state.activeDataset in state.dataset))
      ) {
        console.log(`Setting active Dataset to ${labels[0]}`, labels)
        state.activeDataset = labels[0]
      }
    },
    chartType: function (state, newType: ChartType) {
      state.chartType = newType
    },
    activeDataset: function (state, newDataset: string) {
      if (newDataset in state.dataset) {
        state.activeDataset = newDataset
      }
    },
    labelDataset: function (state, newDataset: string|undefined) {
      if (newDataset === undefined || newDataset in state.dataset) {
        state.labelDataset = newDataset
      }
    },
    chartOptions: function (state, newOptions: any) {
      state.chartOptions = newOptions
    }
  },
  actions: {
  }
}

// Make the Vuex-Store the default export
export default function (): Store<CharterState> {
  return createStore(store)
}
