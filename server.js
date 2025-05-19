const app = require('./app');
const { PORT } = process.env;

app.listen(PORT, () => {
  console.log('Hunters Guild app listening on port:' + PORT);
});
