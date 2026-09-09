# SkillPath

**Learning Path & Progress Tracking System**

A terminal-based (CLI) application that allows instructors to create structured learning paths and learners to follow them, with progress and study-time tracking.

## Tech Stack

- **Runtime:** Node.js
- **Data Storage:** JSON files (prototype data layer)
- **Interface:** Terminal / Command Line

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd EduTrack
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

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
├── data/               # JSON data files (our prototype database)
│   └── skills.json     # Sample skills data
└── src/                # Application source code
    ├── menu.js         # Terminal menu and display functions
    └── dataHelper.js   # Functions to read/write JSON data files
```

## How the JSON Data Layer Works

Instead of a traditional database, this application uses JSON files stored in the `data/` folder. The `src/dataHelper.js` module provides helper functions to read these files. Node.js built-in `fs` (file system) module reads the file, and `JSON.parse()` converts the text into JavaScript objects.

## Development Progress

- **Day 1:** Project foundation — CLI app, sample data, folder structure
