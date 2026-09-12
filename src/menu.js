// menu.js
// This module handles the terminal user interface — the welcome screen,
// the main menu, role-based dashboards, and reading user input.
//
// Updated on Day 3: The instructor dashboard now has real functionality
// instead of placeholders. It calls functions from instructor.js.

const readlineSync = require('readline-sync');
const {
  createSkill,
  createLearningPath,
  addTopic,
  addResource,
  viewMyLearningPaths
} = require('./instructor');

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
 * Updated in Day 2 to include Register and Login options.
 * The menu now has 4 options instead of the original 2.
 *
 * @returns {string} The user's menu choice (e.g., "1", "2", "3", or "4")
 */
function showMainMenu() {
  console.log('  1. Register');
  console.log('  2. Login');
  console.log('  3. View Sample Skills');
  console.log('  4. Exit');
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

/**
 * Displays the Instructor Dashboard menu and handles choices.
 *
 * Updated on Day 3: The instructor now has 6 real options:
 *   1. Create Skill        — define a new skill area
 *   2. Create Learning Path — create a path under a skill
 *   3. Add Topic            — add topics to a learning path
 *   4. Add Resource         — attach resources to topics
 *   5. View My Learning Paths — see the full tree view
 *   6. Logout               — return to main menu
 *
 * Each option (except Logout) calls a function from instructor.js.
 * The dashboard runs in its own loop until the instructor logs out.
 *
 * @param {Object} user - The logged-in user object
 */
function showInstructorDashboard(user) {
  // Dashboard loop — keeps running until the instructor logs out
  while (true) {
    console.log('');
    console.log('========================================');
    console.log('        INSTRUCTOR DASHBOARD            ');
    console.log('========================================');
    console.log(`  Logged in as: ${user.name}`);
    console.log('');
    console.log('  1. Create Skill');
    console.log('  2. Create Learning Path');
    console.log('  3. Add Topic');
    console.log('  4. Add Resource');
    console.log('  5. View My Learning Paths');
    console.log('  6. Logout');
    console.log('');

    const choice = readlineSync.question('  Enter your choice: ').trim();

    if (choice === '1') {
      // Create a new skill (e.g., "Python Programming")
      createSkill(user);

    } else if (choice === '2') {
      // Create a learning path under one of the instructor's skills
      createLearningPath(user);

    } else if (choice === '3') {
      // Add a topic to one of the instructor's learning paths
      addTopic(user);

    } else if (choice === '4') {
      // Add a resource (PDF, Video, etc.) to a topic
      addResource(user);

    } else if (choice === '5') {
      // View all learning paths with their topics and resources
      viewMyLearningPaths(user);

    } else if (choice === '6') {
      // Logout — exit the dashboard loop and return to the main menu
      console.log('');
      console.log('  Logged out successfully.');
      console.log('');
      return;

    } else {
      console.log('');
      console.log('  Invalid choice. Please enter 1-6.');
      console.log('');
    }
  }
}

/**
 * Displays the Learner Dashboard menu and handles choices.
 *
 * The learner sees options for browsing learning paths and viewing progress.
 * For Day 2, these are placeholder options — the actual implementation
 * will be done in later days.
 *
 * The dashboard runs in its own loop. When the learner chooses
 * "Logout", the function returns, which takes them back to the main menu.
 *
 * @param {Object} user - The logged-in user object
 */
function showLearnerDashboard(user) {
  // Dashboard loop — keeps running until the learner logs out
  while (true) {
    console.log('');
    console.log('========================================');
    console.log('          LEARNER DASHBOARD             ');
    console.log('========================================');
    console.log(`  Logged in as: ${user.name}`);
    console.log('');
    console.log('  1. Browse Learning Paths');
    console.log('  2. My Progress');
    console.log('  3. Logout');
    console.log('');

    const choice = readlineSync.question('  Enter your choice: ').trim();

    if (choice === '1') {
      // Placeholder — will be implemented in a later day
      console.log('');
      console.log('  This feature will be implemented on Day 3.');
      console.log('');
    } else if (choice === '2') {
      // Placeholder — will be implemented in a later day
      console.log('');
      console.log('  This feature will be implemented on Day 3.');
      console.log('');
    } else if (choice === '3') {
      // Logout — exit the dashboard loop and return to the main menu
      console.log('');
      console.log('  Logged out successfully.');
      console.log('');
      return;
    } else {
      console.log('');
      console.log('  Invalid choice. Please enter 1, 2, or 3.');
      console.log('');
    }
  }
}

// Export all functions so app.js can use them
module.exports = {
  showWelcome,
  showMainMenu,
  displaySkills,
  showInstructorDashboard,
  showLearnerDashboard
};

