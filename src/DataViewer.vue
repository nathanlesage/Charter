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
            v-on:input="renameDataset(labelIndex, $event.target.value)"
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
          v-on:input="handleInput(rowIndex, colIndex, $event.target.value)"
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

<script>
export default {
  name: 'DataViewer',
  props: {
    // This will be the modeled dataset; we have to emit changes.
    value: {
      type: Object,
      default: function () { return {} }
    }
  },
  data: function () {
    return {
      selectedRow: -1
    }
  },
  watch: {
    selectedRow: function () {
      this.$emit('rowselection', this.selectedRow)
    }
  },
  computed: {
    labels: function () {
      return [''].concat(Object.keys(this.value))
    },
    dataRows: function () {
      // Because we have a different format in our data than the required HTML
      // for a table, we need to reshape the dataset here.
      const columns = Object.values(this.value)
      const rows = []
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
          rows[i].push(0) // TODO: Maybe also empty strings? We need a concept of "NaN"
        }

        // In the end, no matter what we have, prepend a row number
        rows[i].unshift(i + 1)
      }

      return rows
    }
  },
  methods: {
    handleInput: function (row, col, value) {
      // A data cell has been changed. Here we need to take the passed value,
      // modify the correct object, and emit an input event to the root.
      // NOTE that row indicates the index within a dataset, and col indicates
      // the dataset itself!
      const newValue = {}

      // Deep clone our data
      for (const dataset in this.value) {
        newValue[dataset] = this.value[dataset].map(elem => elem)
      }

      // Now we just need to find the correct dataset. Charter supports two basic
      // types of input: Strings and numbers.
      const dataset = this.labels[col]
      newValue[dataset][row] = value

      this.$emit('input', newValue)
    },
    renameDataset: function (labelID, newName) {
      const oldName = this.labels[labelID]
      const newValue = {}
      if (Object.keys(this.value).includes(newName)) {
        console.warn(`The new dataset name for ${oldName}, ${newName} is already taken. Modifying ...`)
        newName += ' (1)' // Four characters to remove for the user, I think that's okay.
      }

      for (const dataset in this.value) {
        if (dataset === oldName) {
          newValue[newName] = this.value[oldName].map(elem => elem)
        } else {
          newValue[dataset] = this.value[dataset].map(elem => elem)
        }
      }

      this.$emit('input', newValue)
    },
    removeDataset: function (labelID) {
      // NOTE: labelID is offset by one due to the row numbers, but this.label
      // also includes the padding.
      const dataToRemove = this.labels[labelID]
      const newValue = {}
      for (const dataset in this.value) {
        // Deep clone the data but skip the dataset to remove
        if (dataset !== dataToRemove) {
          newValue[dataset] = this.value[dataset].map(elem => elem)
        }
      }

      this.$emit('input', newValue)
    },
    removeRow: function (event) {
      const newValue = {}

      for (const dataset in this.value) {
        newValue[dataset] = this.value[dataset]
          .filter((elem, idx) => idx !== this.selectedRow)
          .map(elem => elem)
      }

      this.selectedRow = -1

      this.$emit('input', newValue)
    }
  }
}
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

table.data-table td input {
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 4px;
  width: 100%;
  text-align: right;
}

table.data-table th input {
  border: none;
  margin: 0;
  padding: 4px;
  width: 100%;
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
