/**
 * Visualizes a set of table data
 * @param  {{headers: Array, values: Array.<Array>}} data
 *         An object containing the headers and values of a table
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
 *         The parsed JSON object, an object with multiple parsed JSON objects, or a string containing an error code
 */
const getData = (string) => {

  if (isJSON(string)) {
    const data = JSON.parse(string);
    // Data must be an object with headers and values
    if (typeof data === "object") {
      if ("headers" in data) {
        // If there is a "values" key, the data is not nested
        if ("values" in data) {
          // All rows must contain the same number of values
          const length = data["headers"].length;
          const validTypes = ["string", "number", "boolean", "undefined"];
          for (const row of data["values"]) {
            if (row.length !== length) {
              return ".error4";
            }
            for (const value of row) {
              if (value !== null && !validTypes.includes(typeof value)) {
                return ".error5";
              }
            }
          }
          return data;
          // If there is a "rows" key, the data is nested
        } else if ("rows" in data) {
          const allHeaders = Object.keys(data.headers);
          const rows = Object.keys(data.rows);
          if (deepEqual(allHeaders, rows)) {
            const allData = {};
            const tableNames = Object.keys(data.headers);
            for (const tableName of tableNames) {
              const headers = data.headers[tableName];
              const values = data.rows[tableName];
              const tableJSON = JSON.stringify({ headers, values });
              const tableData = getData(tableJSON);
              // If the table data is invalid, return the error
              if (typeof tableData === "string") {
                return tableData;
              } else {
                allData[tableName] = tableData;
              }
            }
            return allData;
          }
          return ".error6"; // "headers" and "rows" must contain the same table names
        }
        return ".error3"; // Data must contain "values" or "rows" if nested
      }
      return ".error2";
    }
    return ".error1";
  }
  return ".error1";

};

// Returns true if the two given arrays are equal
const deepEqual = (array1, array2) => {
  if (array1.length !== array2.length) {
    return false;
  }
  for (let i = 0; i < array1.length; i++) {
    // If both items are arrays, check if they are equal
    if (Array.isArray(array1[i]) && Array.isArray(array2[i])) {
      return deepEqual(array1[i], array2[i]);
    // Otherwise, compare the primitive values normally
    } else if (array1[i] !== array2[i]) {
      return false;
    }
  }
  return true;
};


// Highlights the error message associated with the given class
const flashError = (errorClass) => {

  const errors = [".error1", ".error2", ".error3", ".error4", ".error5", ".error6"];
  for (const error of errors) {
    if (errorClass !== error) {
      $(error).css("color", "rgb(25, 255, 25)"); // green
    } else {
      $(error).css("color", "rgb(250, 83, 83)"); // red
      break;
    }
  }

};

// Toggles an element's visibility
const showElement = (element, show) => {

  if (show) {
    element.removeClass("d-none");
    element.addClass("d-flex");
  } else {
    element.removeClass("d-flex");
    element.addClass("d-none");
  }

};

// Clears the input form
const clearForm = () => {

  $("#data-form input").val("");

};

// Clears all instruction highlights
const clearErrors = () => {

  $("#usage1 span").css("color", "");
  $("#usage2 span").css("color", "");

};

// Toggles the submit button
const enableSubmit = (enable) => {

  if (enable) {
    $("#submit").removeAttr("disabled");
  } else {
    $("#submit").prop("disabled", "true");
  }

};

$(document).ready(function() {

  const instructions = $("#instructions");
  const form = $("#data-form");
  const inputField = $("#data-form input");
  let validData = false;

  // Dynamically check for table data errors
  inputField.on("input", function() {
    clearErrors();
    const formData = inputField.val();
    if (formData.length > 0) {
      const data = getData(formData);
      if (typeof data === "string") {
        enableSubmit(false);
        return flashError(data);
      } else {
        console.log(data);
        const testValue = Object.values(data)[0];
        if (Array.isArray(testValue)) {
          $("#usage1 .error").css("color", "rgb(25, 255, 25)");
        } else if (typeof testValue === "object") {
          $("#usage2 .error").css("color", "rgb(25, 255, 25)");
        }
        validData = true;
        enableSubmit(true);
      }
    } else {
      enableSubmit(false);
    }
  });

  // Submit handler
  form.on("submit", function(event) {

    event.preventDefault();
    if (!validData) return;

    // Hide results
    $("#resultCode").empty();
    showElement($("#result"), false);

    const formData = inputField.val();
    if (formData.length < 1) return;
    const data = getData(formData);

    // If data has objects for values, it's nested and there are multiple tables
    let nested = false;
    const testValue = Object.values(data)[0];
    if (typeof testValue === "object" && !Array.isArray(testValue)) {
      nested = true;
    }

    // Construct the table(s)
    if (nested) {
      for (const tableName in data) {
        const tableData = data[tableName];
        $("#resultCode")
          .append(`${tableName}\n`)
          .append(visualize(tableData))
          .append("\n\n");
      }
    } else {
      $("#resultCode").append(visualize(data));
    }

    // Display the results
    showElement(instructions, false);
    showElement(form, false);
    showElement($("#result"), true);
    showElement($("#back-btn"), true);

  });

  // Back button
  $("#back-btn").on("click", function() {

    showElement(instructions, true);
    showElement(form, true);
    showElement($("#result"), false);
    showElement($("#back-btn"), false);
    $("#resultCode").empty();

  });

  // Clear button
  $("#clear").on("click", function() {

    clearForm();
    clearErrors();

  });

});