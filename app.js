// app.js
// This is the MAIN ENTRY POINT of the SkillPath application.
// You run this file with: node app.js
//
// How the application flows (Day 2):
// 1. Show the welcome banner
// 2. Show the main menu (Register / Login / View Skills / Exit)
// 3. Read the user's choice
// 4. Perform the action:
//    - Register: collect info and save to users.json
//    - Login: verify credentials, then show role-based dashboard
//    - View Skills: display sample skills from skills.json
//    - Exit: close the application
// 5. Repeat steps 2-4 until the user chooses to exit

// Import our modules
const {
  showWelcome,
  showMainMenu,
  displaySkills,
  showInstructorDashboard,
  showLearnerDashboard
} = require('./src/menu');

const { loadData } = require('./src/dataHelper');
const { registerUser, loginUser } = require('./src/auth');

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
      // Option 1: Register a new user
      registerUser();

    } else if (choice === '2') {
      // Option 2: Login
      // loginUser() returns the user object on success, or null on failure
      const user = loginUser();

      // If login was successful, show the appropriate dashboard
      if (user !== null) {
        if (user.role === 'instructor') {
          showInstructorDashboard(user);
        } else if (user.role === 'learner') {
          showLearnerDashboard(user);
        }
      }
      // If login failed (user is null), we just fall through back to the main menu

    } else if (choice === '3') {
      // Option 3: Load skills from the JSON file and display them
      // loadData('skills.json') reads data/skills.json and returns a JS array
      const skills = loadData('skills.json');
      displaySkills(skills);

    } else if (choice === '4') {
      // Option 4: Exit the application
      console.log('');
      console.log('  Goodbye! Happy Learning!');
      console.log('');
      return; // Stops the function, which ends the program

    } else {
      // Invalid input — the user typed something other than 1-4
      console.log('');
      console.log('  Invalid choice. Please enter 1, 2, 3, or 4.');
      console.log('');
    }
  }
}

// Call the main function to start the application
main();

