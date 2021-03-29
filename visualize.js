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
 * Returns true if a string is valid JSON, false otherwise
 * @param  {string} string
 *         A JSON string
 * @return {boolean}
 *         Whether or not the string is valid JSON
 */
const isJSON = (string) => {
  try {
    JSON.parse(string);
  } catch (e) {
    return false;
  }
  return true;
}

/**
 * Returns a table data object if the given string is valid, otherwise returns
 * an error code
 * @param  {string} string
 *         A JSON string
 * @return {Object|string}
 *         The parsed JSON object or a string containing an error code
 */
const getData = (string) => {
  if (isJSON(string)) {
    const data = JSON.parse(string);
    // Data must be an object with headers and values
    if (typeof data === "object") {
      if ("headers" in data && "values" in data) {
        // All rows must contain the same number of values
        const length = data["headers"].length;
        const validTypes = ["string", "number", "boolean", "undefined"];
        for (const row of data["values"]) {
          if (row.length !== length) {
            return "4"
          }
          for (const value of row) {
            if (value !== null && !validTypes.includes(typeof value)) {
              return "5";
            }
          }
        }
        return data;
      }
      return "3"
    }
    return "2"
  }
  return "1"
}

/**
 * Returns an error message given an error code
 * @param  {string} code
 *         An error code
 * @return {string|false}
 *         The corresponding error message or false if nonexistent
 */
const getError = (code) => {
  const errors = {
    "1": "invalid JSON",
    "2": "invalid object",
    "3": "object must contain 'headers' and 'values'",
    "4": "rows must contain the same number of values",
    "5": "values must be a double-quoted string, number, boolean, null, or undefined"
  }
  return errors[code] || false;
}

$(document).ready(function() {

  const form = $("#data-form");
  const inputField = $("#data-form input");

  form.on("submit", function(event) {
    event.preventDefault();
    const data = getData(inputField.val());
    if (typeof data === "string") {
      alert(getError(data))
    }
  });

});