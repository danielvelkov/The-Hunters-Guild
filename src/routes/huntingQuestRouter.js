const express = require('express');
const huntingQuestController = require('../controllers/huntingQuestController');

const huntingQuestsRouter = express.Router();

huntingQuestsRouter.get('/', huntingQuestController.index_GET);

huntingQuestsRouter.get('/create', huntingQuestController.create_GET);

huntingQuestsRouter.get('/:questId', huntingQuestController.show_GET);

module.exports = huntingQuestsRouter;
