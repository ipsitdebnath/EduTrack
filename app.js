// app.js
// This is the MAIN ENTRY POINT of the SkillPath application.
// You run this file with: node app.js
//
// How the application flows:
// 1. Show the welcome banner
// 2. Show the main menu
// 3. Read the user's choice
// 4. Perform the action (view skills or exit)
// 5. Repeat steps 2-4 until the user chooses to exit

// Import our modules
const { showWelcome, showMainMenu, displaySkills } = require('./src/menu');
const { loadData } = require('./src/dataHelper');

/**
 * Main application function.
 * This runs the entire application using a while loop.
 *
 * The while(true) loop keeps the menu running until the user picks "Exit".
 * When they pick Exit, we use "return" to stop the function (and the program).
 */
function main() {
  // Show the welcome banner once when the app starts
  showWelcome();

  // Main application loop — keeps running until the user exits
  while (true) {
    // Show the menu and get the user's choice
    const choice = showMainMenu();

    // Handle the user's choice
    if (choice === '1') {
      // Option 1: Load skills from the JSON file and display them
      // loadData('skills.json') reads data/skills.json and returns a JS array
      const skills = loadData('skills.json');
      displaySkills(skills);

    } else if (choice === '2') {
      // Option 2: Exit the application
      console.log('');
      console.log('  Goodbye! Happy Learning!');
      console.log('');
      return; // Stops the function, which ends the program

    } else {
      // Invalid input — the user typed something other than 1 or 2
      console.log('');
      console.log('  Invalid choice. Please enter 1 or 2.');
      console.log('');
    }
  }
}

// Call the main function to start the application
main();
