/**
 * Visualizes a set of table data
 * @param  {{headers: Array, values: Array.<Array>}} data
 *         An object containing the headers and values of a table
 *         Each row must contain the same number of values
 * @return {string}
 *         A string representation of the table data
 */
 const visualize = (data) => {

  // Convert all cell values into strings
  let headers = data.headers.map(header => String(header));
  let values = data.values.map(row => row.map(value => String(value)));
  let tableRows = [headers].concat(values);

  // Record the max cell widths by column
  const maxWidths = {};
  for (const row of tableRows) {
    for (const col in row) {
      const cellWidth = row[col].length;
      if (!(col in maxWidths)) {
        maxWidths[col] = cellWidth;
      } else {
        if (cellWidth > maxWidths[col]) {
          maxWidths[col] = cellWidth;
        }
      }
    }
  }

  // Construct the string representations of each row
  let rows = tableRows
    .map(row => row.map((value, col) => ` ${value} ${" ".repeat(maxWidths[col] - value.length)}`))
    .map(row => row.join("|")).map(row => `|${row}|`)

  // Construct and insert horizontal dividers
  const div = rows[0].split("").map(e => e === "|" ? "+" : "-").join("");
  rows.splice(0, 0, div)
  rows.splice(2, 0, div);
  rows.push(div);

  return rows.join("\n");

}

console.log(visualize({"headers": ["Apple", "Banana", "Car"], "values": [[1, 2, 12], [3, 4, 7], [5, 0, null]]}));