// instructor.js
// This module handles all instructor-specific functionality for Day 3.
//
// It provides 5 features:
//   1. createSkill()        — Create a new skill
//   2. createLearningPath() — Create a learning path for a skill
//   3. addTopic()           — Add a topic to a learning path
//   4. addResource()        — Add a resource to a topic
//   5. viewMyLearningPaths() — View all learning paths the instructor created
//
// DATA RELATIONSHIPS (important for viva):
// =========================================
// The data is organized in a parent-child chain connected by IDs:
//
//   Skill (skills.json)
//     └── Learning Path (learningPaths.json)  — linked via skillId
//           └── Topic (topics.json)           — linked via learningPathId
//                 └── Resource (resources.json) — linked via topicId
//
// Each record stores the ID of its parent. This is similar to "foreign keys"
// in a relational database, but here we use simple JSON properties.
//
// For example, if a Topic has learningPathId: 2, it means that topic
// belongs to the Learning Path whose id is 2.
//
// The instructorId on Skills and Learning Paths ensures that each instructor
// can only see and manage their own data.

const readlineSync = require('readline-sync');
const { loadData, saveData } = require('./dataHelper');

// File names for our JSON data stores
const SKILLS_FILE = 'skills.json';
const PATHS_FILE = 'learningPaths.json';
const TOPICS_FILE = 'topics.json';
const RESOURCES_FILE = 'resources.json';

// The 5 supported resource types
// These match the problem statement: PDF, Word, Video, Academic Literature, External Link
const RESOURCE_TYPES = ['PDF', 'Word Document', 'Video', 'Academic Literature', 'External Link'];

/**
 * Generates a unique ID for a new record.
 *
 * This is the same approach used in auth.js:
 * - If the array is empty, start at 1
 * - Otherwise, find the highest existing ID and add 1
 *
 * @param {Array} items - The current array of records
 * @returns {number} A new unique ID
 */
function generateId(items) {
  if (items.length === 0) {
    return 1;
  }

  // Find the maximum ID in the array
  let maxId = 0;
  for (let i = 0; i < items.length; i++) {
    if (items[i].id > maxId) {
      maxId = items[i].id;
    }
  }

  return maxId + 1;
}

// ============================================================
// FEATURE 1: CREATE SKILL
// ============================================================

/**
 * Allows an instructor to create a new skill.
 *
 * A skill is the top-level entity in our hierarchy.
 * For example: "Python Programming", "Web Development", "Data Science"
 *
 * The skill is saved with the instructor's ID so we know who created it.
 * Only skills created by this instructor will appear when they create
 * a learning path.
 *
 * @param {Object} user - The logged-in instructor's user object
 */
function createSkill(user) {
  console.log('');
  console.log('========================================');
  console.log('           CREATE NEW SKILL             ');
  console.log('========================================');
  console.log('');

  // Ask the instructor for the skill details
  const name = readlineSync.question('  Skill name: ');

  // Validate: skill name cannot be empty
  if (!name.trim()) {
    console.log('');
    console.log('  Error: Skill name cannot be empty.');
    console.log('');
    return;
  }

  const description = readlineSync.question('  Description (optional): ');

  // Load existing skills from the JSON file
  const skills = loadData(SKILLS_FILE);

  // Create the new skill object
  // instructorId links this skill to the instructor who created it
  const newSkill = {
    id: generateId(skills),
    name: name.trim(),
    description: description.trim(),
    instructorId: user.id,
    createdAt: new Date().toISOString()
  };

  // Add to the array and save
  skills.push(newSkill);
  saveData(SKILLS_FILE, skills);

  console.log('');
  console.log('  Skill created successfully!');
  console.log(`  Skill: ${newSkill.name} (ID: ${newSkill.id})`);
  console.log('');
}

// ============================================================
// FEATURE 2: CREATE LEARNING PATH
// ============================================================

/**
 * Allows an instructor to create a learning path for one of their skills.
 *
 * A learning path is a structured sequence of topics under a skill.
 * For example: "Python Beginner Path" under the skill "Python Programming"
 *
 * The instructor first selects one of their skills, then provides the
 * path name and description. The path is saved with both skillId and
 * instructorId.
 *
 * @param {Object} user - The logged-in instructor's user object
 */
function createLearningPath(user) {
  console.log('');
  console.log('========================================');
  console.log('         CREATE LEARNING PATH           ');
  console.log('========================================');
  console.log('');

  // Load all skills and filter to only show this instructor's skills
  const allSkills = loadData(SKILLS_FILE);
  const mySkills = [];

  for (let i = 0; i < allSkills.length; i++) {
    if (allSkills[i].instructorId === user.id) {
      mySkills.push(allSkills[i]);
    }
  }

  // If the instructor has no skills yet, they need to create one first
  if (mySkills.length === 0) {
    console.log('  You have not created any skills yet.');
    console.log('  Please create a skill first (Option 1).');
    console.log('');
    return;
  }

  // Display the instructor's skills as a numbered list
  console.log('  Your Skills:');
  console.log('');
  for (let i = 0; i < mySkills.length; i++) {
    console.log(`  ${i + 1}. ${mySkills[i].name}`);
  }
  console.log('');

  // Ask the instructor to select a skill
  const skillChoice = readlineSync.question('  Select skill (number): ');
  const skillIndex = parseInt(skillChoice, 10) - 1;

  // Validate: must be a valid selection
  // parseInt returns NaN if the input is not a number
  // We also check that the index is within the array bounds
  if (isNaN(skillIndex) || skillIndex < 0 || skillIndex >= mySkills.length) {
    console.log('');
    console.log('  Error: Invalid selection.');
    console.log('');
    return;
  }

  const selectedSkill = mySkills[skillIndex];

  // Ask for the learning path details
  const name = readlineSync.question('  Learning path name: ');

  if (!name.trim()) {
    console.log('');
    console.log('  Error: Learning path name cannot be empty.');
    console.log('');
    return;
  }

  const description = readlineSync.question('  Description (optional): ');

  // Load existing learning paths
  const paths = loadData(PATHS_FILE);

  // Create the new learning path object
  // skillId links this path to the selected skill
  // instructorId links it to the instructor for ownership
  const newPath = {
    id: generateId(paths),
    skillId: selectedSkill.id,
    instructorId: user.id,
    name: name.trim(),
    description: description.trim(),
    createdAt: new Date().toISOString()
  };

  // Add to the array and save
  paths.push(newPath);
  saveData(PATHS_FILE, paths);

  console.log('');
  console.log('  Learning path created successfully!');
  console.log(`  Path: ${newPath.name} (ID: ${newPath.id})`);
  console.log(`  Linked to skill: ${selectedSkill.name}`);
  console.log('');
}

// ============================================================
// FEATURE 3: ADD TOPIC
// ============================================================

/**
 * Allows an instructor to add a topic to one of their learning paths.
 *
 * Topics are the individual lessons/units within a learning path.
 * Each topic has an "order" number that defines its position in the sequence.
 *
 * For example, under "Python Beginner Path":
 *   Order 1: Python Basics
 *   Order 2: Variables and Data Types
 *   Order 3: Loops
 *   Order 4: Functions
 *
 * The order is important because learning paths are meant to be followed
 * in a specific sequence — you should learn basics before functions.
 *
 * @param {Object} user - The logged-in instructor's user object
 */
function addTopic(user) {
  console.log('');
  console.log('========================================');
  console.log('              ADD TOPIC                 ');
  console.log('========================================');
  console.log('');

  // Load learning paths and filter to this instructor's paths
  const allPaths = loadData(PATHS_FILE);
  const myPaths = [];

  for (let i = 0; i < allPaths.length; i++) {
    if (allPaths[i].instructorId === user.id) {
      myPaths.push(allPaths[i]);
    }
  }

  // If no learning paths exist, prompt the instructor to create one first
  if (myPaths.length === 0) {
    console.log('  You have not created any learning paths yet.');
    console.log('  Please create a learning path first (Option 2).');
    console.log('');
    return;
  }

  // Display the instructor's learning paths
  console.log('  Your Learning Paths:');
  console.log('');
  for (let i = 0; i < myPaths.length; i++) {
    console.log(`  ${i + 1}. ${myPaths[i].name}`);
  }
  console.log('');

  // Ask the instructor to select a learning path
  const pathChoice = readlineSync.question('  Select learning path (number): ');
  const pathIndex = parseInt(pathChoice, 10) - 1;

  if (isNaN(pathIndex) || pathIndex < 0 || pathIndex >= myPaths.length) {
    console.log('');
    console.log('  Error: Invalid selection.');
    console.log('');
    return;
  }

  const selectedPath = myPaths[pathIndex];

  // Ask for the topic details
  const title = readlineSync.question('  Topic name: ');

  if (!title.trim()) {
    console.log('');
    console.log('  Error: Topic name cannot be empty.');
    console.log('');
    return;
  }

  const description = readlineSync.question('  Topic description (optional): ');

  // Ask for the order (position in the sequence)
  const orderInput = readlineSync.question('  Topic order (e.g., 1, 2, 3): ');
  const order = parseInt(orderInput, 10);

  // Validate: order must be a positive integer
  if (isNaN(order) || order < 1) {
    console.log('');
    console.log('  Error: Topic order must be a positive number (1, 2, 3, etc.).');
    console.log('');
    return;
  }

  // Load existing topics
  const topics = loadData(TOPICS_FILE);

  // Create the new topic object
  // learningPathId links this topic to the selected learning path
  const newTopic = {
    id: generateId(topics),
    learningPathId: selectedPath.id,
    title: title.trim(),
    description: description.trim(),
    order: order
  };

  // Add to the array and save
  topics.push(newTopic);
  saveData(TOPICS_FILE, topics);

  console.log('');
  console.log('  Topic added successfully!');
  console.log(`  Topic: ${newTopic.title} (Order: ${newTopic.order})`);
  console.log(`  Added to: ${selectedPath.name}`);
  console.log('');
}

// ============================================================
// FEATURE 4: ADD RESOURCE
// ============================================================

/**
 * Allows an instructor to add a resource to a topic.
 *
 * Resources are educational materials attached to topics, such as:
 *   - PDF documents
 *   - Word documents
 *   - Video links
 *   - Academic literature references
 *   - External website links
 *
 * We don't actually upload files — we just store the path or URL as a string.
 * This keeps the prototype simple while demonstrating the data structure.
 *
 * The flow is:
 *   1. Select a learning path (filtered to instructor's own paths)
 *   2. Select a topic within that path
 *   3. Enter the resource details (title, type, location)
 *
 * @param {Object} user - The logged-in instructor's user object
 */
function addResource(user) {
  console.log('');
  console.log('========================================');
  console.log('            ADD RESOURCE                ');
  console.log('========================================');
  console.log('');

  // Step 1: Select a learning path
  const allPaths = loadData(PATHS_FILE);
  const myPaths = [];

  for (let i = 0; i < allPaths.length; i++) {
    if (allPaths[i].instructorId === user.id) {
      myPaths.push(allPaths[i]);
    }
  }

  if (myPaths.length === 0) {
    console.log('  You have not created any learning paths yet.');
    console.log('  Please create a learning path first (Option 2).');
    console.log('');
    return;
  }

  console.log('  Your Learning Paths:');
  console.log('');
  for (let i = 0; i < myPaths.length; i++) {
    console.log(`  ${i + 1}. ${myPaths[i].name}`);
  }
  console.log('');

  const pathChoice = readlineSync.question('  Select learning path (number): ');
  const pathIndex = parseInt(pathChoice, 10) - 1;

  if (isNaN(pathIndex) || pathIndex < 0 || pathIndex >= myPaths.length) {
    console.log('');
    console.log('  Error: Invalid selection.');
    console.log('');
    return;
  }

  const selectedPath = myPaths[pathIndex];

  // Step 2: Find topics that belong to this learning path
  const allTopics = loadData(TOPICS_FILE);
  const pathTopics = [];

  for (let i = 0; i < allTopics.length; i++) {
    if (allTopics[i].learningPathId === selectedPath.id) {
      pathTopics.push(allTopics[i]);
    }
  }

  // If no topics exist for this path, prompt to add topics first
  if (pathTopics.length === 0) {
    console.log('');
    console.log('  This learning path has no topics yet.');
    console.log('  Please add topics first (Option 3).');
    console.log('');
    return;
  }

  // Sort topics by order so they display in the correct sequence
  // The sort function compares two items at a time:
  //   If a.order - b.order is negative, a comes first
  //   If a.order - b.order is positive, b comes first
  pathTopics.sort(function (a, b) {
    return a.order - b.order;
  });

  // Display the topics
  console.log('');
  console.log('  Topics:');
  console.log('');
  for (let i = 0; i < pathTopics.length; i++) {
    console.log(`  ${i + 1}. ${pathTopics[i].title} (Order: ${pathTopics[i].order})`);
  }
  console.log('');

  // Ask the instructor to select a topic
  const topicChoice = readlineSync.question('  Select topic (number): ');
  const topicIndex = parseInt(topicChoice, 10) - 1;

  if (isNaN(topicIndex) || topicIndex < 0 || topicIndex >= pathTopics.length) {
    console.log('');
    console.log('  Error: Invalid selection.');
    console.log('');
    return;
  }

  const selectedTopic = pathTopics[topicIndex];

  // Step 3: Collect resource details
  console.log('');
  const title = readlineSync.question('  Resource title: ');

  if (!title.trim()) {
    console.log('');
    console.log('  Error: Resource title cannot be empty.');
    console.log('');
    return;
  }

  // Show the supported resource types
  console.log('');
  console.log('  Resource type:');
  console.log('');
  for (let i = 0; i < RESOURCE_TYPES.length; i++) {
    console.log(`  ${i + 1}. ${RESOURCE_TYPES[i]}`);
  }
  console.log('');

  const typeChoice = readlineSync.question('  Select type (number): ');
  const typeIndex = parseInt(typeChoice, 10) - 1;

  // Validate: must be one of the 5 supported types
  if (isNaN(typeIndex) || typeIndex < 0 || typeIndex >= RESOURCE_TYPES.length) {
    console.log('');
    console.log('  Error: Invalid resource type. Please choose 1-5.');
    console.log('');
    return;
  }

  const selectedType = RESOURCE_TYPES[typeIndex];

  // Ask for the file path or URL
  // For PDFs/Word docs, this might be a local path like "resources/notes.pdf"
  // For videos/links, this might be a URL like "https://youtube.com/..."
  const location = readlineSync.question('  Resource location (path or URL): ');

  if (!location.trim()) {
    console.log('');
    console.log('  Error: Resource location cannot be empty.');
    console.log('');
    return;
  }

  // Load existing resources
  const resources = loadData(RESOURCES_FILE);

  // Create the new resource object
  // topicId links this resource to the selected topic
  const newResource = {
    id: generateId(resources),
    topicId: selectedTopic.id,
    title: title.trim(),
    type: selectedType,
    location: location.trim()
  };

  // Add to the array and save
  resources.push(newResource);
  saveData(RESOURCES_FILE, resources);

  console.log('');
  console.log('  Resource added successfully!');
  console.log(`  Resource: ${newResource.title} (${newResource.type})`);
  console.log(`  Added to topic: ${selectedTopic.title}`);
  console.log('');
}

// ============================================================
// FEATURE 5: VIEW MY LEARNING PATHS
// ============================================================

/**
 * Displays all learning paths created by this instructor in a tree view.
 *
 * The output looks like:
 *
 *   PYTHON BEGINNER PATH
 *   ====================
 *   Skill: Python Programming
 *
 *   1. Python Basics
 *      ├── Python Basics Notes.pdf
 *      ├── Introduction Video
 *      └── Academic Article
 *
 *   2. Variables
 *      └── Variables Notes.pdf
 *
 * This demonstrates that the system correctly organizes:
 *   Skill → Learning Path → Topics (ordered) → Resources
 *
 * HOW THE TREE VIEW WORKS (important for viva):
 * We need to pull data from 4 different JSON files and connect them:
 * 1. Load the instructor's learning paths (filtered by instructorId)
 * 2. For each path, find its skill (using skillId)
 * 3. For each path, find its topics (where topic.learningPathId === path.id)
 * 4. Sort topics by their order number
 * 5. For each topic, find its resources (where resource.topicId === topic.id)
 *
 * @param {Object} user - The logged-in instructor's user object
 */
function viewMyLearningPaths(user) {
  console.log('');
  console.log('========================================');
  console.log('        MY LEARNING PATHS               ');
  console.log('========================================');

  // Load all data we need
  const allPaths = loadData(PATHS_FILE);
  const allSkills = loadData(SKILLS_FILE);
  const allTopics = loadData(TOPICS_FILE);
  const allResources = loadData(RESOURCES_FILE);

  // Filter to only this instructor's learning paths
  const myPaths = [];
  for (let i = 0; i < allPaths.length; i++) {
    if (allPaths[i].instructorId === user.id) {
      myPaths.push(allPaths[i]);
    }
  }

  // If the instructor hasn't created any paths yet
  if (myPaths.length === 0) {
    console.log('');
    console.log('  You have not created any learning paths yet.');
    console.log('');
    readlineSync.question('  Press ENTER to return...');
    return;
  }

  // Loop through each learning path and display its full tree
  for (let p = 0; p < myPaths.length; p++) {
    const currentPath = myPaths[p];

    // Find the skill for this path by matching skillId
    let skillName = 'Unknown Skill';
    for (let s = 0; s < allSkills.length; s++) {
      if (allSkills[s].id === currentPath.skillId) {
        skillName = allSkills[s].name;
        break;
      }
    }

    // Print the path header
    console.log('');
    console.log('----------------------------------------');
    console.log(`  ${currentPath.name.toUpperCase()}`);
    console.log('----------------------------------------');
    console.log(`  Skill: ${skillName}`);
    console.log(`  ${currentPath.description}`);

    // Find all topics for this learning path
    const pathTopics = [];
    for (let t = 0; t < allTopics.length; t++) {
      if (allTopics[t].learningPathId === currentPath.id) {
        pathTopics.push(allTopics[t]);
      }
    }

    // Sort topics by their order number
    pathTopics.sort(function (a, b) {
      return a.order - b.order;
    });

    // If no topics yet
    if (pathTopics.length === 0) {
      console.log('');
      console.log('  (No topics added yet)');
    }

    // Display each topic and its resources
    for (let t = 0; t < pathTopics.length; t++) {
      const topic = pathTopics[t];
      console.log('');
      console.log(`  ${topic.order}. ${topic.title}`);

      // Find all resources for this topic
      const topicResources = [];
      for (let r = 0; r < allResources.length; r++) {
        if (allResources[r].topicId === topic.id) {
          topicResources.push(allResources[r]);
        }
      }

      // If no resources for this topic
      if (topicResources.length === 0) {
        console.log('     (No resources added yet)');
      }

      // Display resources with tree-style connectors
      // ├── is used for all items except the last one
      // └── is used for the last item
      // This creates a visual tree structure in the terminal
      for (let r = 0; r < topicResources.length; r++) {
        const resource = topicResources[r];
        const isLast = (r === topicResources.length - 1);
        const connector = isLast ? '└──' : '├──';
        console.log(`     ${connector} ${resource.title} [${resource.type}]`);
      }
    }
  }

  console.log('');
  console.log('========================================');
  console.log('');

  // Pause so the instructor can read the output
  readlineSync.question('  Press ENTER to return...');
}

// Export all 5 functions for use in menu.js
module.exports = {
  createSkill,
  createLearningPath,
  addTopic,
  addResource,
  viewMyLearningPaths
};
