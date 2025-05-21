# The-Hunters-Guild

A simple express app serving as an LFG hub, specifically made for "Monster Hunter Wilds"

This project is a tool designed to enhance the gaming experience of Monster Hunter Wilds players by providing a streamlined LFG system. It allows players to efficiently find and join player made hunting quests or LFG posts.

## Features

- Create hunting quests posts with additional details (IN DEVELOPMENT)
- Create LFG posts (_this includes squads, link party, private lobby, etc_) (PLANNED)
- Filter through posts (PLANNED)

## Purpose

This repository aims to showcase technical skills or provide users with tools inspired by the multiplayer functionality of Monster Hunter Wilds. The content herein is purely for non-commercial and educational use.

## Disclaimer

This tool is not affiliated with, sponsored by, or endorsed by CAPCOM. All trademarks and intellectual property associated with Monster Hunter Wilds belong to their respective owners. This tool is intended solely for enhancing the player experience in compliance with community guidelines.

## Project Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- PostgreSQL (for database functionality)

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/danielvelkov/The-Hunters-Guild.git
   cd The-Hunters-Guild
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Create environment variables:

   ```sh
   # Create a .env file in the root directory
   # Add necessary environment variables for database connection
   # See .env.example
   ```

4. Set up the database:
   ```sh
   npm run create-db
   npm run seed
   ```

### Scripts

- **Start Development Server with Hot Module Replacement (HMR)**:

  ```sh
  npm run start:HMR
  ```

  This runs the webpack dev server with HMR and the backend server concurrently.

- **Development Server**:

  ```sh
  npm run dev
  ```

  Runs the development server without webpack HMR.

- **Debug Mode**:

  ```sh
  npm run debug
  ```

  Runs the development server with Node.js inspector for debugging.

- **Build for Production**:

  ```sh
  npm run build
  ```

  Builds the frontend assets for production and starts the server.

- **Start Production Server**:

  ```sh
  npm start
  ```

  Runs the production server.

- **Run Tests**:

  ```sh
  npm test
  ```

  Runs Jest tests.

- **Watch Tests**:
  ```sh
  npm run test-watch
  ```
  Runs Jest tests in watch mode.

## Project Structure

- `src/`: Contains the frontend source code
- `server.js`: Main production server entry point
- `dev-server.js`: Development server entry point
- `db/`: Database configuration and seed scripts
- `webpack.dev.js` & `webpack.prod.js`: Webpack configurations

## Dependencies

### Main Dependencies

- **Backend**:

  - `express`: Web application framework
  - `pg`: PostgreSQL client for Node.js
  - `dotenv`: Environment variables management
  - `ejs`: Templating engine

- **Frontend**:

  - `jquery`: JavaScript library for DOM manipulation
  - `jquery-ui` & `jquery-ui-css`: UI components and styling
  - `select2`: Enhanced select boxes

- **Build Tools**:
  - `concurrently`: Run multiple commands concurrently
  - `webpack`: Module bundler
  - `mini-css-extract-plugin`: Extract CSS into separate files
  - `copy-webpack-plugin`: Copy files and directories in webpack

### Development Dependencies

- **Transpilation**:

  - `@babel/core`, `@babel/preset-env`, `babel-loader`: JavaScript transpilation
  - `@babel/plugin-proposal-decorators`: Support for decorators

- **Styling**:

  - `css-loader`: Webpack loader for CSS files

- **Development Tools**:

  - `nodemon`: Monitor for changes and automatically restart server
  - `webpack-dev-server`: Development server with HMR
  - `webpack-merge`: Simplify webpack configuration merging
  - `browser-sync`: Synchronize browser testing

- **Testing**:
  - `jest`, `jest-environment-jsdom`: JavaScript testing framework
  - `@testing-library/dom`, `@testing-library/jest-dom`: DOM testing utilities
  - `jsdom`: JavaScript implementation of HTML and DOM

## License

Licensed under MIT. For non-commercial use only. Please respect the intellectual property of Monster Hunter Wilds and avoid using this tool for monetization.
