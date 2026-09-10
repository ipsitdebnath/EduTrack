// auth.js
// This module handles user registration and login.
// It uses dataHelper to read/write user data from data/users.json.
//
// SECURITY NOTE:
// In this prototype, passwords are stored as plain text in the JSON file.
// This is NOT safe for a real (production) application.
// In production, you should hash passwords using a library like bcrypt
// before storing them. Hashing converts the password into a fixed-length
// string that cannot be reversed — so even if someone reads the database,
// they cannot see the original password.

const readlineSync = require('readline-sync');
const { loadData, saveData } = require('./dataHelper');

// The filename where user data is stored
const USERS_FILE = 'users.json';

/**
 * Generates a unique ID for a new user.
 *
 * How it works:
 * - If there are no users yet, the first ID is 1
 * - Otherwise, find the highest existing ID and add 1
 *
 * @param {Array} users - The current array of user objects
 * @returns {number} A new unique ID
 */
function generateId(users) {
  if (users.length === 0) {
    return 1;
  }

  // Find the maximum ID in the existing users array
  let maxId = 0;
  for (let i = 0; i < users.length; i++) {
    if (users[i].id > maxId) {
      maxId = users[i].id;
    }
  }

  return maxId + 1;
}

/**
 * Handles user registration.
 *
 * Flow:
 * 1. Ask the user for their name, email, and password
 * 2. Let them choose a role (Instructor or Learner)
 * 3. Check if the email is already registered
 * 4. If not, save the new user to users.json
 *
 * We return nothing — this function handles its own output messages.
 */
function registerUser() {
  console.log('');
  console.log('========================================');
  console.log('             REGISTER                   ');
  console.log('========================================');
  console.log('');

  // Collect user information from terminal input
  const name = readlineSync.question('  Name: ');
  const email = readlineSync.question('  Email: ');
  const password = readlineSync.question('  Password: ', { hideEchoBack: true });

  // Validate that all fields are filled in
  if (!name.trim() || !email.trim() || !password.trim()) {
    console.log('');
    console.log('  Error: All fields are required.');
    console.log('');
    return;
  }

  // Let the user choose a role
  console.log('');
  console.log('  Select role:');
  console.log('    1. Instructor');
  console.log('    2. Learner');
  console.log('');
  const roleChoice = readlineSync.question('  Enter choice (1 or 2): ');

  // Determine the role based on the user's input
  let role;
  if (roleChoice.trim() === '1') {
    role = 'instructor';
  } else if (roleChoice.trim() === '2') {
    role = 'learner';
  } else {
    console.log('');
    console.log('  Error: Invalid role. Please choose 1 or 2.');
    console.log('');
    return;
  }

  // Load existing users from the JSON file
  const users = loadData(USERS_FILE);

  // Check if a user with this email already exists
  // We convert both to lowercase so that "Rahul@Example.com" and "rahul@example.com"
  // are treated as the same email
  const emailLower = email.trim().toLowerCase();
  let emailExists = false;

  for (let i = 0; i < users.length; i++) {
    if (users[i].email.toLowerCase() === emailLower) {
      emailExists = true;
      break;
    }
  }

  if (emailExists) {
    console.log('');
    console.log('  Error: An account with this email already exists.');
    console.log('');
    return;
  }

  // Create the new user object
  const newUser = {
    id: generateId(users),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: password,   // Plain text — prototype only!
    role: role
  };

  // Add the new user to the array and save to file
  users.push(newUser);
  saveData(USERS_FILE, users);

  console.log('');
  console.log('  Registration successful!');
  console.log(`  Welcome, ${newUser.name}. You are registered as: ${newUser.role}`);
  console.log('');
}

/**
 * Handles user login.
 *
 * Flow:
 * 1. Ask for email and password
 * 2. Search users.json for a matching email
 * 3. If found, compare passwords
 * 4. If passwords match, return the user object
 * 5. If anything fails, show an error and return null
 *
 * @returns {Object|null} The logged-in user object, or null if login failed
 */
function loginUser() {
  console.log('');
  console.log('========================================');
  console.log('               LOGIN                    ');
  console.log('========================================');
  console.log('');

  // Collect login credentials
  const email = readlineSync.question('  Email: ');
  const password = readlineSync.question('  Password: ', { hideEchoBack: true });

  // Load all users from the JSON file
  const users = loadData(USERS_FILE);

  // Search for a user with the matching email
  const emailLower = email.trim().toLowerCase();
  let foundUser = null;

  for (let i = 0; i < users.length; i++) {
    if (users[i].email.toLowerCase() === emailLower) {
      foundUser = users[i];
      break;
    }
  }

  // If no user was found with that email
  if (foundUser === null) {
    console.log('');
    console.log('  Error: No account found with this email.');
    console.log('');
    return null;
  }

  // Check if the password matches
  if (foundUser.password !== password) {
    console.log('');
    console.log('  Error: Incorrect password.');
    console.log('');
    return null;
  }

  // Login successful!
  console.log('');
  console.log('  Login successful!');
  console.log(`  Welcome, ${foundUser.name}.`);
  console.log(`  You are logged in as: ${foundUser.role}`);
  console.log('');

  return foundUser;
}

// Export both functions for use in app.js
module.exports = { registerUser, loginUser };
