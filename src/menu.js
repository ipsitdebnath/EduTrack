// menu.js
// This module handles the terminal user interface — the welcome screen,
// the main menu, and reading user input.

const readlineSync = require('readline-sync');

/**
 * Displays the welcome banner at the top of the screen.
 * Uses simple ASCII characters to create a bordered header.
 */
function showWelcome() {
  console.log('');
  console.log('========================================');
  console.log('           S K I L L P A T H            ');
  console.log('   Learning Path & Progress System      ');
  console.log('========================================');
  console.log('');
}

/**
 * Displays the main menu options and returns the user's choice.
 *
 * How it works:
 * 1. We print each menu option with a number
 * 2. readlineSync.question() pauses the program and waits for the user to type
 * 3. The user's input is returned as a string
 * 4. We use trim() to remove any extra spaces the user might have typed
 *
 * @returns {string} The user's menu choice (e.g., "1" or "2")
 */
function showMainMenu() {
  console.log('  1. View Sample Skills');
  console.log('  2. Exit');
  console.log('');

  // readlineSync.question() displays the prompt and waits for user input
  // This is SYNCHRONOUS — the program stops here until the user types something
  const choice = readlineSync.question('  Enter your choice: ');

  // trim() removes whitespace from both ends of the string
  return choice.trim();
}

/**
 * Displays skills data in a formatted table-like view.
 * Takes an array of skill objects and prints each one nicely.
 *
 * @param {Array} skills - Array of skill objects from skills.json
 */
function displaySkills(skills) {
  console.log('');
  console.log('----------------------------------------');
  console.log('          AVAILABLE SKILLS               ');
  console.log('----------------------------------------');

  // Loop through each skill and display its details
  for (let i = 0; i < skills.length; i++) {
    const skill = skills[i];
    console.log('');
    console.log(`  #${skill.id}  ${skill.name}`);
    console.log(`      Description : ${skill.description}`);
    console.log(`      Difficulty  : ${skill.difficulty}`);
  }

  console.log('');
  console.log('----------------------------------------');
  console.log('');

  // Pause so the user can read the output before returning to the menu
  readlineSync.question('  Press ENTER to return to the menu...');
}

// Export all functions so app.js can use them
module.exports = { showWelcome, showMainMenu, displaySkills };
