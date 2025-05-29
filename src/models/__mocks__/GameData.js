var monsters = require('./jsondata/monsters.json');
var bonusQuestRewards = require('./jsondata/bonusQuestRewards.json');
var monstersDrops = require('./jsondata/monstersDrops.json');
var skills = require('./jsondata/skills.json');
var systemLoadouts = require('./jsondata/systemLoadouts.json');
var weaponAttributes = require('./jsondata/weaponAttributes.json');
var weaponTypes = require('./jsondata/weaponTypes.json');

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
