# SkillPath

**Learning Path & Progress Tracking System**

## Description

SkillPath is a terminal-based (CLI) application designed to help instructors create structured learning paths and learners follow them with progress and study-time tracking. The application supports two user roles — **Instructors** and **Learners** — each with their own dashboard and set of features.

Instructors can define skills (e.g., "Python Programming"), create learning paths under those skills (e.g., "Python Beginner Path"), add ordered topics to each path, and attach educational resources such as PDFs, Word documents, videos, academic literature, and external links. They can also monitor how learners are progressing through their content.

Learners can browse all available learning paths, enroll in ones that interest them, study topics by viewing resources, track their study time through timed sessions, and mark topics as completed. The system automatically calculates progress percentages and provides detailed statistics at the topic level and skill level.

All data is stored in JSON files, making this a self-contained prototype that requires no external database setup.

## Features

- **User Registration & Login** — Create an account with a name, email, and password, choosing either the Instructor or Learner role
- **Instructor Role:**
  - Create skills (top-level categories like "Python Programming")
  - Create learning paths under skills (e.g., "Python Beginner Path")
  - Add ordered topics to learning paths
  - Attach resources to topics (PDF, Word Document, Video, Academic Literature, External Link)
  - View learning paths in a tree structure (Skill → Path → Topics → Resources)
  - View learner progress — see enrolled learners' completion % and study time
- **Learner Role:**
  - Browse all available learning paths
  - Enroll in learning paths
  - Study topics — view resources, start timed study sessions, mark topics complete
  - **My Dashboard** — summary view with progress bars, completed topic counts, and study times
  - **My Progress** — detailed progress overview with visual progress bars
  - **Topic Statistics** — per-topic study time breakdown for any enrolled path
  - **Skill Statistics** — total accumulated study time per skill with topic-level breakdown
- **Progress Tracking** — Automatic calculation: (completed topics / total topics) × 100
- **Study Time Tracking** — Timed study sessions recorded and summed per topic, path, and skill
- **Data Persistence** — All data saved to JSON files and persists across application restarts

## Technology

| Component       | Technology                      |
|----------------|---------------------------------|
| Language        | JavaScript                     |
| Runtime         | Node.js                        |
| Data Storage    | JSON files (prototype layer)   |
| Interface       | Terminal / CLI                  |
| Input Library   | readline-sync                  |
| Version Control | Git                            |

## How to Run

1. **Prerequisites:** Install [Node.js](https://nodejs.org/) (v16 or higher)

2. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd EduTrack
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the application:**
   ```bash
   node app.js
   ```
   Or using the npm script:
   ```bash
   npm start
   ```

## Project Structure

```
EduTrack/
├── app.js              # Main entry point — run this to start the app
├── package.json        # Node.js project configuration
├── .gitignore          # Files ignored by Git
├── README.md           # This file
├── data/               # JSON data files (prototype database)
│   ├── users.json          # Registered user accounts
│   ├── skills.json         # Skills (top-level categories)
│   ├── learningPaths.json  # Learning paths linked to skills
│   ├── topics.json         # Topics within learning paths
│   ├── resources.json      # Resources attached to topics
│   ├── enrollments.json    # Learner enrollments in paths
│   ├── progress.json       # Topic completion records
│   └── studySessions.json  # Study time tracking records
└── src/                # Application source code
    ├── menu.js         # Terminal menus and dashboard UIs
    ├── dataHelper.js   # JSON file read/write helper functions
    ├── auth.js         # User registration and login logic
    ├── instructor.js   # Instructor features (skills, paths, topics, resources, learner progress)
    └── learner.js      # Learner features (browse, enroll, study, progress, statistics)
```

## Data Structure

The application uses 8 JSON files in the `data/` folder, connected by ID relationships:

```
Skill (skills.json)
  └── Learning Path (learningPaths.json)  — linked via skillId
        └── Topic (topics.json)           — linked via learningPathId
              └── Resource (resources.json) — linked via topicId

Learner (users.json, role: 'learner')
  ├── Enrollment (enrollments.json)       — linked via learnerId + learningPathId
  ├── Progress (progress.json)            — linked via learnerId + topicId + learningPathId
  └── Study Session (studySessions.json)  — linked via learnerId + topicId + learningPathId
```

Each record stores the ID of its parent, similar to foreign keys in a relational database but using simple JSON properties.

## Limitations

- **Prototype data layer:** Uses JSON files instead of a proper database. Not suitable for concurrent users or large datasets.
- **Plain-text passwords:** Passwords are stored as plain text in `users.json`. A production application should hash passwords using a library like `bcrypt`.
- **No file uploads:** Resources store only file paths or URLs as text. The system does not actually upload, store, or render PDF/Word/Video files.
- **Single-user terminal:** Designed for one user at a time in a single terminal session.
- **Simple study timer:** Study time is tracked by recording when the user presses ENTER to start and stop — not a sophisticated timer.

## Future Improvements

The following features could be added in future development:

- **PostgreSQL/Database integration** — Replace JSON files with a relational database for production use
- **Real file upload/storage** — Actually store and serve PDF, Word, and video files
- **BibTeX import** — Parse academic citation files to auto-populate literature resources
- **Excel import** — Import learning path structures from spreadsheet files
- **Quizzes and assessments** — Test learner understanding after completing topics
- **Recommendation system** — Suggest learning paths based on learner interests and progress
- **Notifications** — Alert learners about new content or milestones
- **More advanced analytics** — Charts, trends, comparative statistics, instructor reports
- **Web/mobile interface** — Replace the CLI with a React web app or mobile application
- **Password hashing** — Use bcrypt or similar for secure password storage
- **Multi-user support** — Handle concurrent access with proper locking

## Development Progress

- **Day 1:** Project foundation — CLI app, sample data, folder structure
- **Day 2:** User registration, login, and role-based menus (Instructor / Learner)
- **Day 3:** Instructor features — create skills, learning paths, topics, resources; tree view
- **Day 4:** Learner features — browse, enroll, study sessions, progress tracking, progress bars
- **Day 5:** Final polish — learner dashboard, topic statistics, skill statistics, instructor learner progress view, improved resource display, UX improvements, full documentation

## Security Note

In this prototype, passwords are stored as plain text in the JSON file. This is **NOT safe for production**. A real application should hash passwords using a library like `bcrypt` before storing them. Hashing converts the password into a fixed-length string that cannot be reversed — so even if someone reads the database, they cannot see the original password.
