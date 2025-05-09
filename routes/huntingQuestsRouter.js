const express = require('express');
const gameDataController = require('../controllers/gameDataController');

const huntingQuestsRouter = express.Router();

huntingQuestsRouter.get('/', (req, res) => {
  res.render('pages/hunting-quest/index', { title: 'Hunting Quests' });
});

huntingQuestsRouter.get('/create', async (req, res) => {
  const monsters =
    await gameDataController.monsters__weakness_and_icons_ListGet();
  const bonusQuestRewards =
    await gameDataController.bonus_quest_rewards__ListGet();
  const monstersDrops = await gameDataController.monsters_drops__ListGet();
  const skills = await gameDataController.skills_ListGet();
  const weaponAttributes = await gameDataController.weapon_attributes_ListGet();

  res.render('pages/hunting-quest/create', {
    title: 'Create Hunting Quest Post',
    monsters,
    bonusQuestRewards,
    monstersDrops,
    skills,
    weaponAttributes,
  });
});

module.exports = huntingQuestsRouter;
