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
    </template>
    <!-- CHART VIEWER OPTIONS -->
    <template v-else-if="currentView === 'chart'">
      <p>This view allows you to configure your chart</p>
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
    }
  }
}
</script>

<style>
/** Such empty */
</style>
