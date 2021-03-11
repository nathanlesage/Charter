<template>
  <div class="padded-more">
    <h1>About Charter</h1>
    <p>
      Charter is a side-project by <a href="https://www.hendrik-erz.de/" target="_blank">Hendrik Erz</a>,
      written in a sleepless night. It allows you to quickly create simple
      charts based on some numbers. It is intended for those instances where you
      are in between meetings and neither want to use Excel nor spin up your
      data science IDE. The best: This service works completely in your browser
      with no data being sent to any server. Nothing leaves your computer.
    </p>
    <h2>Requirements</h2>
    <p>
      Charter has been developed and tested on Google Chrome and thus
      should work on any Chromium-based browser. There are known
      issues on, e.g., Safari for iOS. Since I do not have the time to
      make it work across the board, please use Chrome if you
      experience issues.
    </p>
    <h2>Usage</h2>
    <p>
      Charter works in three steps: First you load some data. Second,
      you select the chart type, adapt the design and add labels and
      titles. Lastly, you export the chart. You can either download it
      as a PNG-file to your computer or directly copy it to clipboard,
      if you don't need the file.
      <strong>
        Charter only supports saving the file as a PNG image.
      </strong>
    </p>
    <ul>
      <li><a href="#data-curation">Step 1: Data Curation</a></li>
      <li>
        <a href="#chart-designing">Step 2: Chart Designing</a>
        <ul>
          <li><a href="#export-options">Exporting</a></li>
          <li><a href="#chart-options">General Chart Options</a></li>
          <li><a href="#dataset-options">Dataset Customisation</a></li>
          <li><a href="#axis-options">Axis Options</a></li>
        </ul>
      </li>
      <li><a href="#exporting">Step 3: Exporting</a></li>
    </ul>
    <h3><a name="data-curation"></a>Step 1: Data Curation</h3>
    <p>
      The first step consists of loading some data to visualise. There
      are two ways of doing so: Either upload a TSV/CSV file, or add
      data manually. To <strong>upload a file</strong>, click the
      "Load file"-button in the data viewer and select your file.
    </p>
    <p>
      Since Charter is meant to be simple, the data loader is not
      very sophisticated. It will successfully load well-formed
      comma-separated or tab-separated files, but breaks under
      certain circumstances, such as CSV-files where some labels
      contain commas. Also, Charter uses the file extension to
      determine how to split the contents (TSV: Tabs, CSV: commas).
    </p>
    <p>
      To <strong>add data manually</strong>, you will have to create
      columns and rows manually. The button "Add dataset" will create
      a new <strong>column</strong>, which contains some values.
      Columns are being referred to as datasets, because that's how
      they are treated. The button "Add row" will do precisely that.
    </p>
    <p>
      After the data is in the app, you have the ability to modify it.
      You can remove columns by clicking the small "x" to the right
      of each column's data label. Also, you can edit each data cell
      as well as each label.
      <strong>
        Changes are recognised after you leave the cell by clicking
        somewhere else (or use tab to move to the next cell).
      </strong>
    </p>
    <h3><a name="chart-designing"></a>Step 2: Chart Designing</h3>
    <p>
      After you have loaded your data, click on the "Chart" button to
      move to the chart viewer. There you will see the chart always
      updated to the right, while all your options are in the sidebar.
      While the defaults are reasonable for simple charts, you have an
      excessive amount of options to customise the chart.
    </p>
    <h4><a name="export-options"></a>Exporting</h4>
    <p>
      At the top you can find options related to exporting the chart.
      The blue button will open a dialog where you can save your chart
      as a PNG file to your computer. The "Copy to clipboard" button
      will do exactly that. The export resolution slider allows you to
      adapt the resolution of the chart. This will not change the
      display but enable you to export the chart in bigger
      resolutions.
      <strong>
        It's best not to alter this setting before you're finished
        designing the chart as this will increase the computing power
        needed to render the chart and might also make it look ugly.
      </strong>
    </p>
    <h4><a name="chart-options"></a>General Chart Options</h4>
    <p>
      The next section contains general options. First you can select
      the chart type. Available as of now are line charts, bar charts,
      polar charts, pie charts, radar charts, and scatter plots. The
      following options allow you to name your chart and determine if
      and where you want to have a legend. The chart spacing can be
      used if you don't want the chart to exactly align with the image
      borders.
    </p>
    <p>
      Lastly, you can set a colour for the whole chart. By default, charts have
      a transparent background (Charter displays the chart on a white canvas,
      but that is not the background colour of the chart). Here you can choose a
      custom colour.
    </p>
    <h4><a name="dataset-options"></a>Dataset Customisation</h4>
    <p>
      Next, you can customise each dataset. Select the dataset using
      the dropdown. You can adapt an amount of options, but not all of
      them have an effect on all chart types. The options work as
      following:
    </p>
    <dl>
      <dt>Colour</dt>
      <dd>
        By default, each dataset has a randomly selected colour. Here
        you can change that to one you like.
      </dd>
      <dt>Point style</dt>
      <dd>
        If you want to display each datapoint explicitly, you can
        select a point style here. Note that these do not have an
        effect on bar or pie charts.
      </dd>
      <dt>Point size</dt>
      <dd>
        Allows you to change the size of the points for the dataset.
        Setting it to zero disables points.
      </dd>
      <dt>Curvedness</dt>
      <dd>
        Controls the amount of curviness of the lines connecting the
        datapoints. Set this to zero for simple, straight lines.
      </dd>
      <dt>Line width</dt>
      <dd>
        Controls the thickness of various lines used in the charts,
        such as the connecting lines in line charts or the borders
        of the bars in bar charts.
      </dd>
      <dt>Fill area under curve</dt>
      <dd>
        This instructs Charter to fill the areas in the charts. Bar
        charts will always be filled.
      </dd>
    </dl>
    <h4><a name="axis-options"></a>Axis Options</h4>
    <p>
      The last set of options let you control various settings of the
      two axes involved in the chart. The settings are as follows:
    </p>
    <dl>
      <dt>Axis label</dt>
      <dd>Label your axis here. Leave blank to remove.</dd>
      <dt>Before tick label</dt>
      <dd>
        If not empty, adds whatever is in there before your values. A
        $-sign, for instance, is useful when displaying monetary
        values.
      </dd>
      <dt>After tick label</dt>
      <dd>
        If not empty, adds whatever is in there after your values. If
        your values contain percentages, you might want to add a
        percent sign here.
      </dd>
      <dt>Display the axis grid</dt>
      <dd>
        If checked, display the axis grid. If disabled, hides all
        lines of that axis. If you only want to hide certain types of
        lines, leave this on and use the other two options to fine-
        tune this.
      </dd>
      <dt>Gridlines</dt>
      <dd>
        Controls whether or not the lines inside the chart area should
        be visible.
      </dd>
      <dt>Tick lines</dt>
      <dd>
        Controls whether or not the short lines between the chart area
        and your tick labels should be visible.
      </dd>
      <dt>Tick labels</dt>
      <dd>
        This setting allows you to hide the tick labels.
      </dd>
      <dt>Start axis values at y=0</dt>
      <dd>
        <strong>Only available for the y-Axis.</strong>
        By default, the range displayed on the y-axis in line charts
        will be computed dynamically based on the lowest and highest
        value across your datasets. If you check this option, the
        x-axis will always start at 0, no matter how high the values
        in your data become.
      </dd>
    </dl>
    <h3><a name="exporting"></a>Step 3: Exporting</h3>
    <p>
      After you have adapted everything and the chart looks as you
      like it, you can export it. Now is a good time to do one test
      export and see whether the size of your chart is good. If it
      is to small, increase the resolution of the chart. The actual
      pixel values will be updated next to the slider so that you can
      see how big your chart is.
    </p>
    <p>
      You can either copy the chart as it is into your clipboard. This
      makes sense if you just want to drop the chart into an email or
      a message and don't need to have the file on your computer. But
      in case you need it, you can directly save it to your computer.
    </p>
  </div>
</template>

<script>
export default {
  name: 'InfoViewer'
}
</script>

<style>
/* Make the definition lists a little bit more legible. */
dl dt {
  margin-top: 10px;
  font-weight: bold;
}
</style>
