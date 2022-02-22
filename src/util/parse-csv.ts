import { Dataset } from '../store'

export default function parseFile (contents: string, format: 'csv'|'tsv'): Dataset {
  // Rudimentary TSV/CSV parsing. TOLD YOU IT'S JUST A SMALL TOOL! Don't
  // expect the data loader to fulfill wonders. HOWEVER it's still easier
  // to get a TSV file right than it is to force Excel to produce a simple
  // chart.

  const isTSV = format === 'tsv'
  const lines = contents.trim().split('\n')
  const parsedLines: string[][] = []
  const separator = (isTSV) ? '\t' : ','

  for (const line of lines) {
      parsedLines.push(line.split(separator))
  }

  const labels = parsedLines.shift()
  if (labels === undefined) {
      throw new Error(`Could not parse dataset: Did not contain any lines`)
  }
  // Now we should have a two-dimensional array in the form of row:col. We
  // now need to get that into our dataset format.
  const datasets: Dataset = {}

  for (const label of labels) {
      datasets[label] = []
  }

  for (let row = 0; row < parsedLines.length; row++) {
      for (let col = 0; col < parsedLines[row].length; col++) {
          // Retrieve the correct label
          datasets[labels[col]].push(parsedLines[row][col])
      }
  }
  
  return datasets
}
