import monsters from './jsondata/monsters.json' with { type: 'json' };
import bonusQuestRewards from './jsondata/bonusQuestRewards.json' with { type: 'json' };
import monstersDrops from './jsondata/monstersDrops.json' with { type: 'json' };
import skills from './jsondata/skills.json' with { type: 'json' };
import systemLoadouts from './jsondata/systemLoadouts.json' with { type: 'json' };
import weaponAttributes from './jsondata/weaponAttributes.json' with { type: 'json' };
import weaponTypes from './jsondata/weaponTypes.json' with { type: 'json' };

const monsters__weakness_and_icons_ListGet = () => {
  return monsters;
};
const bonus_quest_rewards__ListGet = () => {
  return bonusQuestRewards;
};

const monsters_drops__ListGet = () => {
  return monstersDrops;
};

const skills_ListGet = () => {
  return skills;
};

const system_loadouts_ListGet = () => {
  return systemLoadouts;
};

const weapon_attributes_ListGet = () => {
  return weaponAttributes;
};

const weapon_types_ListGet = () => {
  return weaponTypes;
};

module.exports = {
  bonus_quest_rewards__ListGet,
  monsters__weakness_and_icons_ListGet,
  monsters_drops__ListGet,
  skills_ListGet,
  system_loadouts_ListGet,
  weapon_attributes_ListGet,
  weapon_types_ListGet,
};
