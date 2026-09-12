// learner.js
// This module handles all learner-specific functionality for Day 4.
//
// It provides 5 main features:
//   1. browseLearningPaths()  — Browse all available learning paths
//   2. myLearningPaths()      — View enrolled paths with progress
//   3. myProgress()           — View detailed progress across all enrolled paths
//   4. studyTopic()           — Study a topic (view resources, study session, mark complete)
//   5. startStudySession()    — Track study time for a topic
//
// NEW DATA FILES CREATED ON DAY 4:
// =================================
// enrollments.json   — Records which learner enrolled in which learning path
// progress.json      — Records which topics a learner has completed
// studySessions.json — Records how long a learner studied each topic
//
// DATA RELATIONSHIPS (important for viva):
// =========================================
//
//   Learner (users.json, role: 'learner')
//     └── Enrollment (enrollments.json)
//           └── learnerId → users.id
//           └── learningPathId → learningPaths.id
//
//   Learner → Progress (progress.json)
//           └── learnerId → users.id
//           └── learningPathId → learningPaths.id
//           └── topicId → topics.id
//
//   Learner → Study Session (studySessions.json)
//           └── learnerId → users.id
//           └── learningPathId → learningPaths.id
//           └── topicId → topics.id
//
// These relationships allow us to:
//   - Know which paths a learner is enrolled in
//   - Know which topics they have completed
//   - Calculate progress percentage (completed topics / total topics)
//   - Know how much time they spent studying each topic

const readlineSync = require('readline-sync');
const { loadData, saveData } = require('./dataHelper');

// File names for our JSON data stores
const PATHS_FILE = 'learningPaths.json';
const SKILLS_FILE = 'skills.json';
const TOPICS_FILE = 'topics.json';
const RESOURCES_FILE = 'resources.json';
const ENROLLMENTS_FILE = 'enrollments.json';
const PROGRESS_FILE = 'progress.json';
const SESSIONS_FILE = 'studySessions.json';

/**
 * Generates a unique ID for a new record.
 * Same approach used in auth.js and instructor.js:
 *   - If the array is empty, start at 1
 *   - Otherwise, find the highest existing ID and add 1
 *
 * @param {Array} items - The current array of records
 * @returns {number} A new unique ID
 */
function generateId(items) {
  if (items.length === 0) {
    return 1;
  }

  let maxId = 0;
  for (let i = 0; i < items.length; i++) {
    if (items[i].id > maxId) {
      maxId = items[i].id;
    }
  }

  return maxId + 1;
}

/**
 * Formats a number of minutes into a human-readable string.
 *
 * Examples:
 *   0   → "0m"
 *   25  → "25m"
 *   90  → "1h 30m"
 *   120 → "2h 0m"
 *
 * How it works:
 *   - Divide total minutes by 60 to get hours (use Math.floor to round down)
 *   - Use the remainder (%) to get leftover minutes
 *   - If less than 60 minutes, just show "Xm"
 *   - If 60 or more, show "Xh Ym"
 *
 * @param {number} totalMinutes - The total number of minutes
 * @returns {string} A formatted string like "1h 25m" or "35m"
 */
function formatStudyTime(totalMinutes) {
  if (totalMinutes < 60) {
    return totalMinutes + 'm';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours + 'h ' + minutes + 'm';
}

// ============================================================
// FEATURE 1: BROWSE LEARNING PATHS
// ============================================================

/**
 * Displays all available learning paths created by any instructor.
 *
 * The learner can browse all paths, select one to view its details,
 * and optionally enroll.
 *
 * Flow:
 *   1. Load all learning paths and skills
 *   2. Display each path with its associated skill name
 *   3. Let the learner select a path to view details
 *   4. If they select a path, call viewLearningPathDetails()
 *
 * @param {Object} user - The logged-in learner's user object
 */
function browseLearningPaths(user) {
  console.log('');
  console.log('========================================');
  console.log('       AVAILABLE LEARNING PATHS         ');
  console.log('========================================');
  console.log('');

  // Load all learning paths and skills
  const allPaths = loadData(PATHS_FILE);
  const allSkills = loadData(SKILLS_FILE);

  // If there are no learning paths at all
  if (allPaths.length === 0) {
    console.log('  No learning paths available yet.');
    console.log('  Instructors need to create learning paths first.');
    console.log('');
    readlineSync.question('  Press ENTER to return...');
    return;
  }

  // Display each learning path with its skill name
  for (let i = 0; i < allPaths.length; i++) {
    const currentPath = allPaths[i];

    // Find the skill name for this path by matching skillId
    let skillName = 'Unknown Skill';
    for (let s = 0; s < allSkills.length; s++) {
      if (allSkills[s].id === currentPath.skillId) {
        skillName = allSkills[s].name;
        break;
      }
    }

    console.log('  ' + (i + 1) + '. ' + currentPath.name);
    console.log('     Skill: ' + skillName);
    console.log('');
  }

  // Ask the learner to select a path or go back
  console.log('  0. Back to Dashboard');
  console.log('');
  const choice = readlineSync.question('  Enter path number: ').trim();

  // If they chose to go back
  if (choice === '0') {
    return;
  }

  // Parse and validate the selection
  const pathIndex = parseInt(choice, 10) - 1;

  if (isNaN(pathIndex) || pathIndex < 0 || pathIndex >= allPaths.length) {
    console.log('');
    console.log('  Error: Invalid selection.');
    console.log('');
    return;
  }

  // Show the details of the selected learning path
  const selectedPath = allPaths[pathIndex];
  viewLearningPathDetails(user, selectedPath);
}

// ============================================================
// FEATURE 2: VIEW LEARNING PATH DETAILS
// ============================================================

/**
 * Displays full details of a learning path: description, topics, and resources.
 *
 * This is a READ-ONLY view — the learner cannot modify the content.
 * Only the instructor who owns the path can change it.
 *
 * After viewing, the learner can choose to enroll in the path.
 *
 * How the display works (important for viva):
 *   1. Find the skill name using the path's skillId
 *   2. Find all topics for this path using learningPathId
 *   3. Sort topics by their order number
 *   4. For each topic, find its resources using topicId
 *   5. Display everything in a structured format
 *
 * @param {Object} user - The logged-in learner's user object
 * @param {Object} path - The learning path object to display
 */
function viewLearningPathDetails(user, path) {
  // Load all data we need
  const allSkills = loadData(SKILLS_FILE);
  const allTopics = loadData(TOPICS_FILE);
  const allResources = loadData(RESOURCES_FILE);

  // Find the skill name for this path
  let skillName = 'Unknown Skill';
  for (let s = 0; s < allSkills.length; s++) {
    if (allSkills[s].id === path.skillId) {
      skillName = allSkills[s].name;
      break;
    }
  }

  // Display the path header
  console.log('');
  console.log('========================================');
  console.log('  ' + path.name.toUpperCase());
  console.log('========================================');
  console.log('');
  console.log('  Skill: ' + skillName);
  console.log('');

  // Show description if available
  if (path.description) {
    console.log('  Description:');
    console.log('  ' + path.description);
    console.log('');
  }

  // Find all topics for this learning path
  const pathTopics = [];
  for (let t = 0; t < allTopics.length; t++) {
    if (allTopics[t].learningPathId === path.id) {
      pathTopics.push(allTopics[t]);
    }
  }

  // Sort topics by their order number
  pathTopics.sort(function (a, b) {
    return a.order - b.order;
  });

  // Display topics and their resources
  if (pathTopics.length === 0) {
    console.log('  (No topics added yet)');
  } else {
    console.log('  Topics:');
    console.log('');

    for (let t = 0; t < pathTopics.length; t++) {
      const topic = pathTopics[t];
      console.log('  ' + topic.order + '. ' + topic.title);

      // Find all resources for this topic
      const topicResources = [];
      for (let r = 0; r < allResources.length; r++) {
        if (allResources[r].topicId === topic.id) {
          topicResources.push(allResources[r]);
        }
      }

      // Display each resource with its type
      if (topicResources.length === 0) {
        console.log('     (No resources yet)');
      } else {
        for (let r = 0; r < topicResources.length; r++) {
          console.log('     * ' + topicResources[r].title + ' [' + topicResources[r].type + ']');
        }
      }

      console.log('');
    }
  }

  // Show options: Enroll or Go Back
  console.log('----------------------------------------');
  console.log('');
  console.log('  1. Enroll in this Learning Path');
  console.log('  2. Back');
  console.log('');

  const choice = readlineSync.question('  Enter choice: ').trim();

  if (choice === '1') {
    enrollInPath(user, path);
  }
  // If choice is '2' or anything else, just return to the previous menu
}

// ============================================================
// FEATURE 3: ENROLLMENT
// ============================================================

/**
 * Enrolls the learner in a learning path.
 *
 * Before enrolling, we perform two checks:
 *   1. Verify the learning path exists (it should, since we got here from browsing)
 *   2. Verify the learner is NOT already enrolled (prevent duplicates)
 *
 * The enrollment record stores:
 *   - id: unique enrollment ID
 *   - learnerId: the learner's user ID (from users.json)
 *   - learningPathId: the learning path's ID (from learningPaths.json)
 *   - enrolledAt: timestamp of when the enrollment happened
 *
 * @param {Object} user - The logged-in learner's user object
 * @param {Object} path - The learning path to enroll in
 */
function enrollInPath(user, path) {
  // Load existing enrollments
  const enrollments = loadData(ENROLLMENTS_FILE);

  // Check if the learner is already enrolled in this path
  // We look for a record where both learnerId AND learningPathId match
  let alreadyEnrolled = false;
  for (let i = 0; i < enrollments.length; i++) {
    if (enrollments[i].learnerId === user.id && enrollments[i].learningPathId === path.id) {
      alreadyEnrolled = true;
      break;
    }
  }

  if (alreadyEnrolled) {
    console.log('');
    console.log('  You are already enrolled in this learning path.');
    console.log('');
    return;
  }

  // Verify the learning path still exists (safety check)
  const allPaths = loadData(PATHS_FILE);
  let pathExists = false;
  for (let i = 0; i < allPaths.length; i++) {
    if (allPaths[i].id === path.id) {
      pathExists = true;
      break;
    }
  }

  if (!pathExists) {
    console.log('');
    console.log('  Error: This learning path no longer exists.');
    console.log('');
    return;
  }

  // Create the enrollment record
  const newEnrollment = {
    id: generateId(enrollments),
    learnerId: user.id,
    learningPathId: path.id,
    enrolledAt: new Date().toISOString()
  };

  // Save the enrollment
  enrollments.push(newEnrollment);
  saveData(ENROLLMENTS_FILE, enrollments);

  console.log('');
  console.log('  Successfully enrolled in ' + path.name + '!');
  console.log('');
}

// ============================================================
// FEATURE 4: MY LEARNING PATHS
// ============================================================

/**
 * Displays the learner's enrolled learning paths with progress percentage.
 *
 * This shows ONLY paths the learner is enrolled in (not all paths).
 * For each path, we calculate progress:
 *   progress = (completed topics / total topics) * 100
 *
 * The learner can select a path to start studying its topics.
 *
 * How progress is calculated (important for viva):
 *   1. Find the total number of topics in the learning path
 *   2. Count how many of those topics the learner has completed
 *      (by checking progress.json for matching records)
 *   3. Divide completed by total and multiply by 100
 *
 * @param {Object} user - The logged-in learner's user object
 */
function myLearningPaths(user) {
  console.log('');
  console.log('========================================');
  console.log('          MY LEARNING PATHS             ');
  console.log('========================================');
  console.log('');

  // Load data
  const enrollments = loadData(ENROLLMENTS_FILE);
  const allPaths = loadData(PATHS_FILE);
  const allTopics = loadData(TOPICS_FILE);
  const progressData = loadData(PROGRESS_FILE);

  // Find this learner's enrollments
  const myEnrollments = [];
  for (let i = 0; i < enrollments.length; i++) {
    if (enrollments[i].learnerId === user.id) {
      myEnrollments.push(enrollments[i]);
    }
  }

  // If the learner hasn't enrolled in anything yet
  if (myEnrollments.length === 0) {
    console.log('  You have not enrolled in any learning paths yet.');
    console.log('  Use "Browse Learning Paths" to find and enroll in paths.');
    console.log('');
    readlineSync.question('  Press ENTER to return...');
    return;
  }

  // For each enrollment, find the path and calculate progress
  const enrolledPaths = [];

  for (let i = 0; i < myEnrollments.length; i++) {
    const enrollment = myEnrollments[i];

    // Find the learning path object
    let pathObj = null;
    for (let p = 0; p < allPaths.length; p++) {
      if (allPaths[p].id === enrollment.learningPathId) {
        pathObj = allPaths[p];
        break;
      }
    }

    // Skip if the path was somehow deleted
    if (pathObj === null) {
      continue;
    }

    // Count total topics in this path
    let totalTopics = 0;
    for (let t = 0; t < allTopics.length; t++) {
      if (allTopics[t].learningPathId === pathObj.id) {
        totalTopics++;
      }
    }

    // Count completed topics for this learner in this path
    let completedTopics = 0;
    for (let pr = 0; pr < progressData.length; pr++) {
      if (progressData[pr].learnerId === user.id &&
          progressData[pr].learningPathId === pathObj.id &&
          progressData[pr].completed === true) {
        completedTopics++;
      }
    }

    // Calculate progress percentage
    // If there are no topics, progress is 0%
    let percentage = 0;
    if (totalTopics > 0) {
      percentage = Math.round((completedTopics / totalTopics) * 100);
    }

    enrolledPaths.push({
      path: pathObj,
      totalTopics: totalTopics,
      completedTopics: completedTopics,
      percentage: percentage
    });
  }

  // Display enrolled paths with progress
  for (let i = 0; i < enrolledPaths.length; i++) {
    const item = enrolledPaths[i];
    console.log('  ' + (i + 1) + '. ' + item.path.name);
    console.log('     Progress: ' + item.percentage + '%');
    console.log('');
  }

  // Let the learner select a path to study
  console.log('  0. Back to Dashboard');
  console.log('');
  const choice = readlineSync.question('  Select a path: ').trim();

  if (choice === '0') {
    return;
  }

  const pathIndex = parseInt(choice, 10) - 1;

  if (isNaN(pathIndex) || pathIndex < 0 || pathIndex >= enrolledPaths.length) {
    console.log('');
    console.log('  Error: Invalid selection.');
    console.log('');
    return;
  }

  // Show the study view for the selected enrolled path
  const selectedItem = enrolledPaths[pathIndex];
  studyEnrolledPath(user, selectedItem.path);
}

// ============================================================
// FEATURE 5: STUDY ENROLLED PATH
// ============================================================

/**
 * Allows the learner to study topics within an enrolled learning path.
 *
 * Displays the path's topics with completion status (✓ or ○).
 * The learner can select a topic to study it (view resources, start a
 * study session, or mark it as completed).
 *
 * Validation:
 *   - The learner must be enrolled in the path to study it
 *   - This is checked before displaying topics
 *
 * @param {Object} user - The logged-in learner's user object
 * @param {Object} path - The learning path to study
 */
function studyEnrolledPath(user, path) {
  // Verify the learner is enrolled in this path
  const enrollments = loadData(ENROLLMENTS_FILE);
  let isEnrolled = false;
  for (let i = 0; i < enrollments.length; i++) {
    if (enrollments[i].learnerId === user.id && enrollments[i].learningPathId === path.id) {
      isEnrolled = true;
      break;
    }
  }

  if (!isEnrolled) {
    console.log('');
    console.log('  Error: You are not enrolled in this learning path.');
    console.log('');
    return;
  }

  // Study loop — keeps running until the learner goes back
  while (true) {
    // Load fresh data each iteration (because the learner may have just completed a topic)
    const allTopics = loadData(TOPICS_FILE);
    const progressData = loadData(PROGRESS_FILE);

    // Find topics for this path
    const pathTopics = [];
    for (let t = 0; t < allTopics.length; t++) {
      if (allTopics[t].learningPathId === path.id) {
        pathTopics.push(allTopics[t]);
      }
    }

    // Sort by order
    pathTopics.sort(function (a, b) {
      return a.order - b.order;
    });

    // Calculate progress
    let completedCount = 0;
    for (let pr = 0; pr < progressData.length; pr++) {
      if (progressData[pr].learnerId === user.id &&
          progressData[pr].learningPathId === path.id &&
          progressData[pr].completed === true) {
        completedCount++;
      }
    }

    let percentage = 0;
    if (pathTopics.length > 0) {
      percentage = Math.round((completedCount / pathTopics.length) * 100);
    }

    // Display the path header with progress
    console.log('');
    console.log('========================================');
    console.log('  ' + path.name.toUpperCase());
    console.log('========================================');
    console.log('');
    console.log('  Progress: ' + percentage + '%');
    console.log('');

    // Display topics with completion status
    if (pathTopics.length === 0) {
      console.log('  (No topics in this path yet)');
      console.log('');
      readlineSync.question('  Press ENTER to return...');
      return;
    }

    for (let t = 0; t < pathTopics.length; t++) {
      const topic = pathTopics[t];

      // Check if this topic is completed by this learner
      let isCompleted = false;
      for (let pr = 0; pr < progressData.length; pr++) {
        if (progressData[pr].learnerId === user.id &&
            progressData[pr].topicId === topic.id &&
            progressData[pr].learningPathId === path.id &&
            progressData[pr].completed === true) {
          isCompleted = true;
          break;
        }
      }

      // ✓ for completed, ○ for not completed
      const status = isCompleted ? '✓' : '○';
      console.log('  ' + (t + 1) + '. ' + status + ' ' + topic.title);
    }

    console.log('');
    console.log('  0. Back');
    console.log('');

    const choice = readlineSync.question('  Select a topic to study: ').trim();

    if (choice === '0') {
      return;
    }

    const topicIndex = parseInt(choice, 10) - 1;

    if (isNaN(topicIndex) || topicIndex < 0 || topicIndex >= pathTopics.length) {
      console.log('');
      console.log('  Error: Invalid selection.');
      console.log('');
      continue;
    }

    // Open the study view for the selected topic
    studyTopic(user, path, pathTopics[topicIndex]);
  }
}

// ============================================================
// FEATURE 6: STUDY A TOPIC
// ============================================================

/**
 * Displays the study view for a single topic.
 *
 * Shows the topic's resources and provides options to:
 *   1. Open Resource (displays resource details)
 *   2. Start Study Session (tracks study time)
 *   3. Mark Topic Complete (saves completion to progress.json)
 *   4. Back
 *
 * Validation:
 *   - The learner can only study topics from paths they are enrolled in
 *     (already validated in studyEnrolledPath before calling this)
 *   - Marking a topic complete does not create duplicate records
 *
 * @param {Object} user - The logged-in learner's user object
 * @param {Object} path - The learning path this topic belongs to
 * @param {Object} topic - The topic to study
 */
function studyTopic(user, path, topic) {
  while (true) {
    // Load resources for this topic
    const allResources = loadData(RESOURCES_FILE);
    const topicResources = [];

    for (let r = 0; r < allResources.length; r++) {
      if (allResources[r].topicId === topic.id) {
        topicResources.push(allResources[r]);
      }
    }

    // Check if this topic is already completed
    const progressData = loadData(PROGRESS_FILE);
    let isCompleted = false;
    for (let pr = 0; pr < progressData.length; pr++) {
      if (progressData[pr].learnerId === user.id &&
          progressData[pr].topicId === topic.id &&
          progressData[pr].learningPathId === path.id &&
          progressData[pr].completed === true) {
        isCompleted = true;
        break;
      }
    }

    // Display the topic header
    console.log('');
    console.log('========================================');
    console.log('           STUDY TOPIC                  ');
    console.log('========================================');
    console.log('');
    console.log('  Topic: ' + topic.title);

    if (isCompleted) {
      console.log('  Status: ✓ Completed');
    } else {
      console.log('  Status: ○ Not completed');
    }

    console.log('');

    // Display resources
    console.log('  Resources:');
    console.log('');

    if (topicResources.length === 0) {
      console.log('  (No resources available for this topic)');
    } else {
      for (let r = 0; r < topicResources.length; r++) {
        console.log('  ' + (r + 1) + '. ' + topicResources[r].title + ' [' + topicResources[r].type + ']');
      }
    }

    console.log('');
    console.log('----------------------------------------');
    console.log('');

    // Show options
    if (topicResources.length > 0) {
      console.log('  ' + (topicResources.length + 1) + '. Start Study Session');
      console.log('  ' + (topicResources.length + 2) + '. Mark Topic Complete');
      console.log('  ' + (topicResources.length + 3) + '. Back');
    } else {
      console.log('  1. Start Study Session');
      console.log('  2. Mark Topic Complete');
      console.log('  3. Back');
    }

    console.log('');
    const choice = readlineSync.question('  Enter choice: ').trim();
    const choiceNum = parseInt(choice, 10);

    if (isNaN(choiceNum)) {
      console.log('');
      console.log('  Error: Invalid choice.');
      console.log('');
      continue;
    }

    // Determine what the user selected based on the dynamic numbering
    // Resources are numbered 1..N, then Study Session, Mark Complete, Back
    const studySessionNum = topicResources.length + 1;
    const markCompleteNum = topicResources.length + 2;
    const backNum = topicResources.length + 3;

    if (choiceNum >= 1 && choiceNum <= topicResources.length) {
      // User selected a resource — display its details
      const selectedResource = topicResources[choiceNum - 1];
      console.log('');
      console.log('  ----------------------------------------');
      console.log('  Resource: ' + selectedResource.title);
      console.log('  Type: ' + selectedResource.type);
      console.log('  Location: ' + selectedResource.location);
      console.log('  ----------------------------------------');
      console.log('');
      readlineSync.question('  Press ENTER to continue...');

    } else if (choiceNum === studySessionNum) {
      // Start a study session
      startStudySession(user, path, topic);

    } else if (choiceNum === markCompleteNum) {
      // Mark the topic as complete
      markTopicComplete(user, path, topic);

    } else if (choiceNum === backNum) {
      // Go back to the topic list
      return;

    } else {
      console.log('');
      console.log('  Error: Invalid choice.');
      console.log('');
    }
  }
}

// ============================================================
// FEATURE 7: START STUDY SESSION
// ============================================================

/**
 * Starts a study session for a topic and tracks the time spent.
 *
 * How study time tracking works (important for viva):
 *   1. Record the current date/time as startTime using new Date()
 *   2. Wait for the learner to press ENTER (they are studying during this time)
 *   3. Record the current date/time as endTime using new Date()
 *   4. Calculate duration: endTime - startTime gives milliseconds
 *   5. Convert to minutes: Math.round(milliseconds / 60000)
 *   6. Save the session to studySessions.json
 *
 * This is a simple approach that demonstrates the concept.
 * In a real application, you might use a more sophisticated timer.
 *
 * @param {Object} user - The logged-in learner's user object
 * @param {Object} path - The learning path
 * @param {Object} topic - The topic being studied
 */
function startStudySession(user, path, topic) {
  console.log('');
  console.log('========================================');
  console.log('           STUDY SESSION                 ');
  console.log('========================================');
  console.log('');
  console.log('  Topic: ' + topic.title);
  console.log('');

  // Record the start time
  const startTime = new Date();
  console.log('  Study session started at: ' + startTime.toLocaleTimeString());
  console.log('');
  console.log('  Study the topic materials now.');
  console.log('  When you are finished, press ENTER to end the session.');
  console.log('');

  // Wait for the learner to press ENTER
  // During this time, the program is paused — the learner is studying
  readlineSync.question('  Press ENTER when you finish studying...');

  // Record the end time
  const endTime = new Date();

  // Calculate the duration in milliseconds, then convert to minutes
  // endTime - startTime gives the difference in milliseconds
  // 60000 = 1000ms * 60s = 1 minute in milliseconds
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationMinutes = Math.round(durationMs / 60000);

  // Load existing sessions and save the new one
  const sessions = loadData(SESSIONS_FILE);

  const newSession = {
    id: generateId(sessions),
    learnerId: user.id,
    topicId: topic.id,
    learningPathId: path.id,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    durationMinutes: durationMinutes
  };

  sessions.push(newSession);
  saveData(SESSIONS_FILE, sessions);

  // Display the result
  console.log('');
  console.log('  Study session completed!');
  console.log('  Time studied: ' + (durationMinutes < 1 ? 'less than 1 minute' : durationMinutes + ' minutes'));
  console.log('  Session saved successfully.');
  console.log('');
}

// ============================================================
// FEATURE 8: MARK TOPIC COMPLETE
// ============================================================

/**
 * Marks a topic as completed for the learner.
 *
 * Before marking as complete, we check if the topic is already completed
 * to prevent creating duplicate records in progress.json.
 *
 * A progress record stores:
 *   - id: unique progress record ID
 *   - learnerId: which learner completed it
 *   - learningPathId: which learning path it belongs to
 *   - topicId: which topic was completed
 *   - completed: always true (we only create records for completed topics)
 *   - completedAt: timestamp of when it was completed
 *
 * @param {Object} user - The logged-in learner's user object
 * @param {Object} path - The learning path
 * @param {Object} topic - The topic to mark as complete
 */
function markTopicComplete(user, path, topic) {
  // Load existing progress data
  const progressData = loadData(PROGRESS_FILE);

  // Check if this topic is already marked as complete for this learner
  for (let i = 0; i < progressData.length; i++) {
    if (progressData[i].learnerId === user.id &&
        progressData[i].topicId === topic.id &&
        progressData[i].learningPathId === path.id &&
        progressData[i].completed === true) {
      console.log('');
      console.log('  ' + topic.title + ' is already marked as completed.');
      console.log('');
      return;
    }
  }

  // Create the progress record
  const newProgress = {
    id: generateId(progressData),
    learnerId: user.id,
    learningPathId: path.id,
    topicId: topic.id,
    completed: true,
    completedAt: new Date().toISOString()
  };

  // Save the progress
  progressData.push(newProgress);
  saveData(PROGRESS_FILE, progressData);

  console.log('');
  console.log('  ✓ ' + topic.title + ' marked as completed!');
  console.log('');
}

// ============================================================
// FEATURE 9: MY PROGRESS
// ============================================================

/**
 * Displays a progress overview for all enrolled learning paths.
 *
 * For each enrolled path, shows:
 *   - Progress percentage
 *   - A visual progress bar (using █ and ░ characters)
 *   - List of topics with ✓ or ○ status
 *   - Total study time across all sessions for this path
 *
 * How the progress bar is generated (important for viva):
 *   1. We use a total bar width of 20 characters
 *   2. Filled characters = Math.round((percentage / 100) * 20)
 *   3. Empty characters = 20 - filled
 *   4. We repeat '█' for filled and '░' for empty
 *
 * How total study time is calculated:
 *   1. Find all study sessions for this learner + this learning path
 *   2. Sum up all durationMinutes values
 *   3. Format using formatStudyTime()
 *
 * @param {Object} user - The logged-in learner's user object
 */
function myProgress(user) {
  console.log('');
  console.log('========================================');
  console.log('             MY PROGRESS                ');
  console.log('========================================');

  // Load all needed data
  const enrollments = loadData(ENROLLMENTS_FILE);
  const allPaths = loadData(PATHS_FILE);
  const allTopics = loadData(TOPICS_FILE);
  const progressData = loadData(PROGRESS_FILE);
  const sessions = loadData(SESSIONS_FILE);

  // Find this learner's enrollments
  const myEnrollments = [];
  for (let i = 0; i < enrollments.length; i++) {
    if (enrollments[i].learnerId === user.id) {
      myEnrollments.push(enrollments[i]);
    }
  }

  if (myEnrollments.length === 0) {
    console.log('');
    console.log('  You have not enrolled in any learning paths yet.');
    console.log('');
    readlineSync.question('  Press ENTER to return...');
    return;
  }

  // Display progress for each enrolled path
  for (let i = 0; i < myEnrollments.length; i++) {
    const enrollment = myEnrollments[i];

    // Find the learning path
    let pathObj = null;
    for (let p = 0; p < allPaths.length; p++) {
      if (allPaths[p].id === enrollment.learningPathId) {
        pathObj = allPaths[p];
        break;
      }
    }

    if (pathObj === null) {
      continue;
    }

    // Find topics for this path
    const pathTopics = [];
    for (let t = 0; t < allTopics.length; t++) {
      if (allTopics[t].learningPathId === pathObj.id) {
        pathTopics.push(allTopics[t]);
      }
    }

    // Sort topics by order
    pathTopics.sort(function (a, b) {
      return a.order - b.order;
    });

    // Count completed topics
    let completedCount = 0;
    for (let t = 0; t < pathTopics.length; t++) {
      for (let pr = 0; pr < progressData.length; pr++) {
        if (progressData[pr].learnerId === user.id &&
            progressData[pr].topicId === pathTopics[t].id &&
            progressData[pr].learningPathId === pathObj.id &&
            progressData[pr].completed === true) {
          completedCount++;
          break;
        }
      }
    }

    // Calculate percentage
    let percentage = 0;
    if (pathTopics.length > 0) {
      percentage = Math.round((completedCount / pathTopics.length) * 100);
    }

    // Build progress bar (20 characters wide)
    // Example: ██████████░░░░░░░░░░ for 50%
    const barWidth = 20;
    const filledCount = Math.round((percentage / 100) * barWidth);
    const emptyCount = barWidth - filledCount;

    let progressBar = '';
    for (let b = 0; b < filledCount; b++) {
      progressBar += '█';
    }
    for (let b = 0; b < emptyCount; b++) {
      progressBar += '░';
    }

    // Calculate total study time for this path
    // Sum up durationMinutes from all sessions for this learner + path
    let totalStudyMinutes = 0;
    for (let s = 0; s < sessions.length; s++) {
      if (sessions[s].learnerId === user.id &&
          sessions[s].learningPathId === pathObj.id) {
        totalStudyMinutes += sessions[s].durationMinutes;
      }
    }

    // Display the progress for this path
    console.log('');
    console.log('  ' + pathObj.name);
    console.log('  Progress: ' + percentage + '%');
    console.log('  ' + progressBar);
    console.log('  Completed Topics: ' + completedCount + ' / ' + pathTopics.length);
    console.log('');

    // Display each topic with its completion status
    for (let t = 0; t < pathTopics.length; t++) {
      const topic = pathTopics[t];

      // Check if this topic is completed
      let isCompleted = false;
      for (let pr = 0; pr < progressData.length; pr++) {
        if (progressData[pr].learnerId === user.id &&
            progressData[pr].topicId === topic.id &&
            progressData[pr].learningPathId === pathObj.id &&
            progressData[pr].completed === true) {
          isCompleted = true;
          break;
        }
      }

      const status = isCompleted ? '✓' : '○';
      console.log('  ' + status + ' ' + topic.title);
    }

    console.log('');
    console.log('  Total study time: ' + formatStudyTime(totalStudyMinutes));
    console.log('');
    console.log('  ----------------------------------------');
  }

  console.log('');
  readlineSync.question('  Press ENTER to return...');
}

// Export all learner functions for use in menu.js
module.exports = {
  browseLearningPaths,
  myLearningPaths,
  myProgress
};
