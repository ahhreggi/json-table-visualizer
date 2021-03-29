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
    .map(row => row.join("|")).map(row => `|${row}|`);

  // Construct and insert horizontal dividers
  const div = rows[0].split("").map(e => e === "|" ? "+" : "-").join("");
  rows.splice(0, 0, div);
  rows.splice(2, 0, div);
  rows.push(div);

  return rows.join("\n");

};

/**
 * Visualizes a set of table data
 * @param  {{headers: Array, values: Array.<Array>}} data
 *         An object containing the headers and values of a table
 *         Each row must contain the same number of values
 * @return {string}
 *         A string representation of the table data
 */
const visualizeNested = (data) => {

  // Convert all cell values into strings
  const allHeaders = data.headers;
  for (const headers in allHeaders) {
    allHeaders[headers] = allHeaders[headers].map(header => String(header));
  }
  const rows = data.rows;
  for (const values in rows) {
    rows[values] = rows[values].map(values => values.map(value => String(value)));
  }

  const tableNames = Object.keys(rows); // VALIDATION: check that keys for allHeaders and rows are the same

  const tables = {};

  for (const tableName of tableNames) {
    const headers = data["headers"][tableName];
    const values = data["rows"][tableName];
    const tableData = { headers, values };
    tables[tableName] = visualize(tableData);
  }

  return tables;

};

const nested = {
  "headers":
  {
    "Playback": ["session_id","customer_id","start_time","end_time"],
    "Ads": ["ad_id","customer_id","timestamp"]
  },
  "rows": {
    "Playback":[[1,1,1,5],[2,1,15,23],[3,2,10,12],[4,2,17,28],[5,2,2,8]],
    "Ads":[[1,1,5],[2,2,15],[3,2,20]]
  }
};

console.log(visualizeNested(nested));
