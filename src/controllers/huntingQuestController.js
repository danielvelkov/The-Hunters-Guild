const expressAsyncHandler = require('express-async-handler');
const CustomNotFoundError = require('../errors/CustomNotFoundError');
const GameData = require('../models/GameData');
const HuntingQuest = require('../models/HuntingQuest');

const index_GET = async (req, res) => {
  const huntingQuests = HuntingQuest.getAll();
  const weaponTypes = await GameData.weapon_types_ListGet();
  const weaponAttributes = await GameData.weapon_attributes_ListGet();
  const monsters = await GameData.monsters__weakness_and_icons_ListGet();
  const monstersDrops = await GameData.monsters_drops__ListGet();
  huntingQuests.forEach((hq) => {
    hq.quest_monsters = hq.quest_monsters.map((qm) => ({
      ...qm,
      monster: monsters.find((m) => m.id === qm.monster.id),
    }));
  });
  res.render('pages/hunting-quest/index', {
    title: 'Hunting Quests',
    huntingQuests,
    monstersDrops,
    monsters,
    weaponAttributes,
    weaponTypes,
  });
};

const show_GET = expressAsyncHandler(async (req, res) => {
  const { questId } = req.params;
  const huntingQuest = HuntingQuest.findById(Number(questId));

  if (!huntingQuest)
    throw new CustomNotFoundError('No hunting quest found with ID: ' + questId);

  const monsters = await GameData.monsters__weakness_and_icons_ListGet();
  const monstersDrops = await GameData.monsters_drops__ListGet();

  huntingQuest.quest_monsters = huntingQuest.quest_monsters.map((qm) => ({
    ...qm,
    monster: monsters.find((m) => m.id === qm.monster.id),
  }));
  res.render('pages/hunting-quest/show', {
    title: huntingQuest.title,
    huntingQuest,
    monstersDrops,
    monsters,
  });
});

const create_GET = async (req, res) => {
  const monsters = await GameData.monsters__weakness_and_icons_ListGet();
  const bonusQuestRewards = await GameData.bonus_quest_rewards__ListGet();
  const monstersDrops = await GameData.monsters_drops__ListGet();
  const skills = await GameData.skills_ListGet();
  const weaponTypes = await GameData.weapon_types_ListGet();
  const weaponAttributes = await GameData.weapon_attributes_ListGet();
  const systemLoadouts = await GameData.system_loadouts_ListGet();

  ////////////////////////
  // FOR CREATING MOCKS //
  ////////////////////////
  // const path = require('path');
  // const fs = require('fs');
  // const mocksData = {
  //   monsters,
  //   bonusQuestRewards,
  //   monstersDrops,
  //   skills,
  //   weaponTypes,
  //   weaponAttributes,
  //   systemLoadouts,
  // };

  // for (const key in mocksData) {
  //   console.log(key);
  //   fs.writeFile(
  //     path.resolve(
  //       process.cwd(),
  //       'src',
  //       'models',
  //       '__mocks__',
  //       'jsondata',
  //       `${key}.json`
  //     ),
  //     JSON.stringify(mocksData[key].splice(0, 5)),
  //     (err) => {
  //       if (err) {
  //         console.error(err);
  //       } else {
  //         // file written successfully
  //       }
  //     }
  //   );
  // }
  ////////////////////////

  res.render('pages/hunting-quest/create', {
    title: 'Create Hunting Quest Post',
    monsters,
    bonusQuestRewards,
    monstersDrops,
    skills,
    weaponTypes,
    weaponAttributes,
    systemLoadouts,
  });
};

const create_POST = async (req, res) => {
  const { successful, id } = HuntingQuest.addQuest(req.body);
  if (successful) res.redirect(`/${id}`);
  else res.redirect('/create');
};
module.exports = {
  index_GET,
  show_GET,
  create_GET,
  create_POST,
};
