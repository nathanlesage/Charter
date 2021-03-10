<template>
  <table class="data-table">
    <tr>
      <th><input type="text" value="One"></th>
      <th><input type="text" value="Two"></th>
      <th><input type="text" value="Three"></th>
      <th><input type="text" value="Four"></th>
    </tr>
    <tr>
      <td><input type="text" value="One"></td>
      <td><input type="text" value="Two"></td>
      <td><input type="text" value="Three"></td>
      <td><input type="text" value="Four"></td>
    </tr>
  </table>
</template>

<script>
export default {
    name: 'DataViewer'
}
</script>

<style>
table.data-table {
  border-collapse: collapse;
}
table.data-table td, table.data-table th {
  border: 1px solid #aaa;
  padding: 0;
}

table.data-table td input {
  border: none;
  margin: 0;
  padding: 4px;
  width: 100%;
}

table.data-table th input {
  border: none;
  margin: 0;
  padding: 4px;
  width: 100%;
  font-weight: bold;
  background-color: rgb(230, 230, 230);
}
</style>
