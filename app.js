require('dotenv').config();
const { PORT } = process.env;

const path = require('path');
const express = require('express');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.use('/', (req, res) => res.send('Hello Hunter!'));

app.listen(PORT, () => {
  console.log('Hunters guild listening on port:' + PORT);
});
