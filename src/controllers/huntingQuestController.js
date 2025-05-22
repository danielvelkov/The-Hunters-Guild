import {
  monsters__weakness_and_icons_ListGet,
  bonus_quest_rewards__ListGet,
  monsters_drops__ListGet,
  weapon_types_ListGet,
  weapon_attributes_ListGet,
  skills_ListGet,
  system_loadouts_ListGet,
} from '../../db/game-data-queries.js';

export const indexGet = (req, res) => {
  res.render('pages/hunting-quest/index', { title: 'Hunting Quests' });
};

export const createGet = async (req, res) => {
  const monsters = await monsters__weakness_and_icons_ListGet();
  const bonusQuestRewards = await bonus_quest_rewards__ListGet();
  const monstersDrops = await monsters_drops__ListGet();
  const skills = await skills_ListGet();
  const weaponTypes = await weapon_types_ListGet();
  const weaponAttributes = await weapon_attributes_ListGet();
  const systemLoadouts = await system_loadouts_ListGet();

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
