const express = require('express');
const huntingQuestController = require('../controllers/huntingQuestController');

const huntingQuestsRouter = express.Router();

huntingQuestsRouter.get('/', huntingQuestController.indexGet);

huntingQuestsRouter.get('/create', huntingQuestController.createGet);

module.exports = huntingQuestsRouter;
