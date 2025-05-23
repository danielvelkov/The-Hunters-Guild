const browserSync = require('browser-sync');
const nodemon = require('nodemon');
require('dotenv').config();
const { PORT } = process.env;
const BROWSER_SYNC_PORT = 3001;

// Start nodemon to watch server files
nodemon({
  script: './server.js', // A minimal server file that imports your app.js
  watch: [
    'app.js',
    'src/routes/**/*.js',
    'src/models/**/*.js',
    'src/controllers/**/*.js',
    'src/middleware/**/*.js',
    'src/utils/**/*.js',
  ],
  ext: 'js,json,ejs',
})
  .on('start', () => {
    console.log('Nodemon started');
  })
  .on('restart', () => {
    console.log('Nodemon restarted');
  });

// Initialize Browser-Sync
browserSync.init({
  proxy: `http://localhost:${PORT}`,
  port: BROWSER_SYNC_PORT,
  files: ['src/public/**/*.css', 'src/public/**/*.js', 'src/views/**/*.ejs'],
  notify: true,
  open: false, // Set to true if you want the browser to open automatically
});
