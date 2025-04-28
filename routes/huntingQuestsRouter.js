const express = require('express');
const gameDataController = require('../controllers/gameDataController');

const huntingQuestsRouter = express.Router();

huntingQuestsRouter.get('/', (req, res) => {
  res.render('hunting-quests', { title: 'Hunting Quests' });
});

huntingQuestsRouter.get('/new', async (req, res) => {
  const monsters =
    await gameDataController.monsters__weakness_and_icons_ListGet();
  const bonusQuestRewards =
    await gameDataController.bonus_quest_rewards__ListGet();
  const monstersDrops = await gameDataController.monsters_drops__ListGet();

  res.render('new-quest-post', {
    title: 'Create Hunting Quest Post',
    monsters,
    bonusQuestRewards,
    monstersDrops,
  });
});

module.exports = huntingQuestsRouter;
