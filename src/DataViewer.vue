<template>
  <table
    class="data-table"
    v-on:keyup="removeRow"
  >
    <tr>
      <th
        v-for="item, labelIndex in labels"
        v-bind:key="labelIndex"
        v-bind:class="{ 'row-number': labelIndex === 0 }"
        v-on:click="selectedRow = -1"
      >
        <div v-if="labelIndex > 0" style="position: relative">
          <input
            type="text"
            v-bind:value="item"
            v-on:input="renameDataset(labelIndex, $event)"
            v-on:focus="($event.target as any).select()"
          >
          <!-- Enable removal of single datasets -->
          <span
            class="icon icon-cancel"
            style="position: absolute; right:10px; top: 5px; cursor: pointer"
            v-bind:title="'Remove dataset ' + item"
            v-on:click="removeDataset(labelIndex)"
          ></span>
        </div>
        <span v-else>{{ item }}</span>
      </th>
    </tr>
    <tr v-for="row, rowIndex in dataRows" v-bind:key="rowIndex">
      <td
        v-for="column, colIndex in row"
        v-bind:key="colIndex"
        v-bind:class="{
          'row-number': colIndex === 0,
          'selected': selectedRow === rowIndex
        }"
      >
        <input
          v-if="colIndex > 0"
          type="text"
          v-bind:value="column"
          v-on:input="handleInput(rowIndex, colIndex, $event)"
          v-on:focus="($event.target as any).select()"
        >
        <span
          v-else
          v-on:click="selectedRow = rowIndex"
        >
          {{ column }}
        </span>
      </td>
    </tr>
  </table>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DataViewer',
  data: function () {
    return {
      selectedRow: -1
    }
  },
  computed: {
    dataset: function (): { [key: string]: string[] } {
      return this.$store.state.dataset
    },
    labels: function (): string[] {
      return [''].concat(Object.keys(this.dataset))
    },
    dataRows: function (): string[][] {
      // Because we have a different format in our data than the required HTML
      // for a table, we need to reshape the dataset here.
      const columns = Object.values(this.dataset)
      const rows: string[][] = []
      // Now we have a two-dimensional array which we basically have to pivot,
      // that is: every i-th element of every column goes into every i-th row.
      for (const column of columns) {
        for (let rowIndex = 0; rowIndex < column.length; rowIndex++) {
          if (rowIndex >= rows.length) {
            rows.push([])
          }
          rows[rowIndex].push(column[rowIndex])
        }
      }

      // Normalise the rows now to ensure we still have a matrix
      let max = 0
      for (const row of rows) {
        if (row.length > max) {
          max = row.length
        }
      }

      for (let i = 0; i < rows.length; i++) {
        while (rows[i].length < max) {
          // We pad with zeros
          rows[i].push('0') // TODO: Maybe also empty strings? We need a concept of "NaN"
        }

        // In the end, no matter what we have, prepend a row number
        rows[i].unshift(`${i + 1}`)
      }

      return rows
    }
  },
  methods: {
    handleInput: function (row: number, col: number, event: Event) {
      if (event.target === null) {
        return
      }

      if (!(event.target instanceof HTMLInputElement)) {
        return
      }

      // A data cell has been changed. Here we need to take the passed value,
      // modify the correct object, and emit an input event to the root.
      // NOTE that row indicates the index within a dataset, and col indicates
      // the dataset itself!
      const newDataset: any = {}

      // Deep clone our data
      for (const dataset in this.dataset) {
        newDataset[dataset] = this.dataset[dataset].map(elem => elem)
      }

      // Now we just need to find the correct dataset. Charter supports two basic
      // types of input: Strings and numbers.
      const datasetName = this.labels[col]
      newDataset[datasetName][row] = event.target.value

      this.$store.commit('dataset', newDataset)
    },
    renameDataset: function (labelID: number, event: Event) {
      if (event.target === null) {
        return
      }

      if (!(event.target instanceof HTMLInputElement)) {
        return
      }

      const oldName = this.labels[labelID]
      let newName = event.target.value
      const newDataset: any = {}

      if (this.labels.includes(newName)) {
        console.warn(`The new dataset name for ${oldName}, ${newName} is already taken.`)
        newName += ' (1)' // Four characters to remove for the user, I think that's okay.
      }

      for (const dataset in this.dataset) {
        if (dataset === oldName) {
          newDataset[newName] = this.dataset[oldName].map(elem => elem)
        } else {
          newDataset[dataset] = this.dataset[dataset].map(elem => elem)
        }
      }

      this.$store.commit('dataset', newDataset)
    },
    removeDataset: function (labelID: number) {
      // NOTE: labelID is offset by one due to the row numbers, but this.label
      // also includes the padding.
      const newDataset: any = {}
      const dataset = this.dataset
      const labels = Object.keys(this.$store.state.dataset)

      for (let i = 1; i < this.labels.length; i++) {
        if (i !== labelID) {
          newDataset[this.labels[i]] = dataset[this.labels[i]].map(elem => elem)
        }
      }
      this.$store.commit('dataset', newDataset)
    },
    removeRow: function (event: MouseEvent|KeyboardEvent) {
      const newDataset: any = {}
      for (const label in this.dataset) {
        newDataset[label] = this.dataset[label]
          .filter((elem, idx) => idx !== this.selectedRow)
          .map(elem => elem)
      }

      this.selectedRow = -1
      this.$store.commit('dataset', newDataset)
    }
  }
})
</script>

<style>
table.data-table {
  border-collapse: collapse;
  background-color: white;
}

table.data-table td, table.data-table th {
  border: 1px solid #aaa;
  padding: 0;
}

table.data-table td.selected, table.data-table td.row-number.selected {
  background-color: #116cd6; /* Stole the active color from Photon */
  color: white;
}

table.data-table input {
  cursor: text;
  border: none;
  margin: 0;  
  padding: 4px;
  width: 100%;
}

table.data-table td input {
  background-color: transparent;
  text-align: right;
}

table.data-table th input {
  font-weight: bold;
  background-color: rgb(230, 230, 230);
}

table.data-table th.row-number, table.data-table td.row-number {
  background-color: rgb(230, 230, 230);
  text-align: right;
  width: 25px; /* Make sure the row numbers look nice */
}

table.data-table td.row-number span {
  display: block;
  padding: 4px;
}
</style>
