require('dotenv').config();
const express = require('express');
const app = express();
const { PORT } = process.env;

app.use('/', (req, res) => res.send('Hello Hunter!'));

app.listen(PORT, () => {
  console.log('Hunters guild listening on port:' + PORT);
});
