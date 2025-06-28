import 'dotenv/config';
import huntingQuestsRouter from './src/routes/huntingQuestRouter.js';
import path from 'path';
import express from 'express';
import methodOverride from 'method-override';
import compression from 'compression';
import { fileURLToPath } from 'url';

const { PORT } = process.env;
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(compression());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'dist')));
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); // parse html form data
app.use(express.json());

app.use('/', huntingQuestsRouter);

// Export the app for use with browser-sync in development mode
export default app;

if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log('Hunters guild listening on port:' + PORT);
  });
}
