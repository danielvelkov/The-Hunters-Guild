require('dotenv').config();
const huntingQuestsRouter = require('./src/routes/huntingQuestRouter');
const { PORT } = process.env;
const path = require('path');
const express = require('express');
const app = express();

app.use(express.static(path.join(__dirname, 'dist')));
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); // parse html form data

app.use('/', huntingQuestsRouter);

// Export the app for use with browser-sync in development mode
module.exports = app;

// Only start the server directly if not being imported elsewhere
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('Hunters guild listening on port:' + PORT);
  });
}
