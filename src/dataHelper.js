// dataHelper.js
// This module handles reading data from our JSON files.
// Think of it as our "database access layer" — but instead of SQL queries,
// we simply read JSON files from the data/ folder.

const fs = require('fs');
const path = require('path');

/**
 * Reads a JSON file from the data/ folder and returns the parsed data.
 *
 * How it works:
 * 1. path.join() builds the full file path (e.g., "data/skills.json")
 * 2. fs.readFileSync() reads the file contents as a string
 * 3. JSON.parse() converts that string into a JavaScript array/object
 *
 * @param {string} filename - The name of the JSON file (e.g., "skills.json")
 * @returns {Array|Object} The parsed data from the JSON file
 */
function loadData(filename) {
  // Build the full path to the file inside the data/ folder
  // __dirname gives us the folder where THIS file (dataHelper.js) lives (src/)
  // We go one level up (..) to reach the project root, then into data/
  const filePath = path.join(__dirname, '..', 'data', filename);

  // Read the file contents as a UTF-8 string
  const rawData = fs.readFileSync(filePath, 'utf-8');

  // Parse the JSON string into a JavaScript object/array and return it
  const parsedData = JSON.parse(rawData);
  return parsedData;
}

// Export the function so other files can use it
// Usage in other files: const { loadData } = require('./src/dataHelper');
module.exports = { loadData };
