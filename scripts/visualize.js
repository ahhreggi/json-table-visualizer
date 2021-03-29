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
};

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
            return ".error3";
          }
          for (const value of row) {
            if (value !== null && !validTypes.includes(typeof value)) {
              return ".error4";
            }
          }
        }
        return data;
      }
      return ".error2";
    }
    return ".error1";
  }
  return ".error1";
};

const flashError = (errorClass) => {
  const errors = [".error1", ".error2", ".error3", ".error4"];
  for (const error of errors) {
    if (errorClass !== error) {
      $(error).css("color", "rgb(41, 209, 41)"); // green
    } else {
      $(error).css("color", "rgb(250, 83, 83)"); // red
      break;
    }
  }
};

const showElement = (element, show) => {
  if (show) {
    element.removeClass("d-none");
    element.addClass("d-flex");
  } else {
    element.removeClass("d-flex");
    element.addClass("d-none");
  }
};

const clearForm = () => {
  $("#data-form input").val("");
};

const clearErrors = () => {
  $("#usage span").css("color", "");
};

$(document).ready(function() {

  const instructions = $("#instructions");
  const form = $("#data-form");
  const inputField = $("#data-form input");

  form.on("submit", function(event) {
    event.preventDefault();

    // Clear all errors
    clearErrors();

    // Hide result
    $("#resultCode").empty();
    showElement($("#result"), false);

    const formData = inputField.val();
    if (formData.length < 1) return;
    const data = getData(formData);
    if (typeof data === "string") {
      return flashError(data);
    } else {
      $("#usage .error").css("color", "rgb(9, 158, 9)");
    }

    // Display results
    $("#resultCode").append(visualize(data));
    showElement(instructions, false);
    showElement(form, false);
    showElement($("#result"), true);
    showElement($("#back-btn"), true);
  });

  $("#back-btn").on("click", function() {
    console.log("clearing");
    showElement(instructions, true);
    showElement(form, true);
    showElement($("#result"), false);
    showElement($("#back-btn"), false);
    $("#resultCode").empty();
    clearErrors();

  });

  $("clear").on("click", function() {
    clearForm();
    clearErrors();
  });

});