import express from 'express';
import huntingQuestController from '../controllers/huntingQuestController.js';

const huntingQuestsRouter = express.Router();

huntingQuestsRouter.get('/', huntingQuestController.index_GET);

huntingQuestsRouter.get('/create', huntingQuestController.create_GET);

huntingQuestsRouter.post('/create', huntingQuestController.create_POST);

huntingQuestsRouter.get('/:questId', huntingQuestController.show_GET);

huntingQuestsRouter.get('/:questId/edit', huntingQuestController.edit_GET);

huntingQuestsRouter.put('/:questId', huntingQuestController.edit_PUT);

huntingQuestsRouter.delete('/:questId', huntingQuestController.remove_DELETE);

// Every thrown error in the application or the previous middleware function calling `next` with an error as an argument will eventually go to this middleware function
// the 4 parameters are required to handle errors
huntingQuestsRouter.use((err, req, res, next) => {
  console.error(err);
  const { statusCode, message } = err;
  if (statusCode === 404)
    res.status(404).render('pages/errors/404', {
      title: 'Error - Not Found',
      error: message || 'Requested resource was not found',
    });
  else if (statusCode === 401)
    res.status(401).render('pages/errors/401', {
      title: 'Error - Unauthorized',
      error: message || 'Unauthorized access',
    });
  else
    res.status(500).render('pages/errors/500', {
      title: 'Internal Server Error',
      error: message || 'Oops! Something went wrong',
    });
});

export default huntingQuestsRouter;
