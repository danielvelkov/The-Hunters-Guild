import app from './app.js';
const { PORT } = process.env;

app.listen(PORT, () => {
  console.log('Hunters Guild app listening on port:' + PORT);
});
