// dataHelper.js
// This module handles reading and writing data to our JSON files.
// Think of it as our "database access layer" — but instead of SQL queries,
// we simply read and write JSON files from the data/ folder.

const fs = require('fs');
const path = require('path');

/**
 * Reads a JSON file from the data/ folder and returns the parsed data.
 *
 * How it works:
 * 1. path.join() builds the full file path (e.g., "data/skills.json")
 * 2. fs.existsSync() checks if the file exists first
 * 3. fs.readFileSync() reads the file contents as a string
 * 4. JSON.parse() converts that string into a JavaScript array/object
 *
 * If the file does not exist, we return an empty array instead of crashing.
 * This is useful for files like users.json that may not exist yet on first run.
 *
 * @param {string} filename - The name of the JSON file (e.g., "skills.json")
 * @returns {Array|Object} The parsed data from the JSON file
 */
function loadData(filename) {
  // Build the full path to the file inside the data/ folder
  // __dirname gives us the folder where THIS file (dataHelper.js) lives (src/)
  // We go one level up (..) to reach the project root, then into data/
  const filePath = path.join(__dirname, '..', 'data', filename);

  // If the file doesn't exist yet, return an empty array
  // This prevents the app from crashing when no users have registered yet
  if (!fs.existsSync(filePath)) {
    return [];
  }

  // Read the file contents as a UTF-8 string
  const rawData = fs.readFileSync(filePath, 'utf-8');

  // Parse the JSON string into a JavaScript object/array and return it
  const parsedData = JSON.parse(rawData);
  return parsedData;
}

/**
 * Saves data to a JSON file in the data/ folder.
 *
 * How it works:
 * 1. path.join() builds the full file path
 * 2. JSON.stringify() converts the JavaScript object/array into a JSON string
 *    - The third argument (2) adds indentation for readability
 * 3. fs.writeFileSync() writes the string to the file
 *
 * @param {string} filename - The name of the JSON file (e.g., "users.json")
 * @param {Array|Object} data - The data to save
 */
function saveData(filename, data) {
  // Build the full path to the file inside the data/ folder
  const filePath = path.join(__dirname, '..', 'data', filename);

  // Convert the data to a nicely formatted JSON string
  // JSON.stringify(data, null, 2) means:
  //   data  = the object/array to convert
  //   null  = no custom replacer function
  //   2     = indent with 2 spaces for readability
  const jsonString = JSON.stringify(data, null, 2);

  // Write the JSON string to the file
  fs.writeFileSync(filePath, jsonString, 'utf-8');
}

// Export both functions so other files can use them
// Usage: const { loadData, saveData } = require('./src/dataHelper');
module.exports = { loadData, saveData };
