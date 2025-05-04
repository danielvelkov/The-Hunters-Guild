const app = require('./app');
const { PORT } = process.env;

app.listen(PORT, () => {
  console.log('Hunters guild listening on port:' + PORT);
});
