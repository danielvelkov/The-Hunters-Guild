const fs = require('fs');
const path = require('path');

// Helper function to load SQL files
function loadSqlFile(filename) {
  return fs.readFileSync(path.join(__dirname, 'queries', filename), 'utf8');
}

// Load all SQL queries
const queries = {
  getMonsters__AllWeaknesses: loadSqlFile('monsters.sql'),
  getStatusIcons__NamesAndIconId: 'SELECT id, name from status_icons;',
  getMonstersParts__DamageEffectiveness: loadSqlFile('parts_dmg_eff.sql'),
  getBonusQuestRewardsList: loadSqlFile('bonus_rewards.sql'),
  getMonsterDropsList: loadSqlFile('monster_drops.sql'),
  getMonsterSpecialAttacksAndCounterSkills: loadSqlFile(
    'spec_att_counters.sql'
  ),
  getSkills: loadSqlFile('skills.sql'),
  getWeaponTypes: 'SELECT index as id, name FROM weapon_types;',
  getWeaponAttributes: `SELECT index AS id, weapon_attributes.id AS name, status_icons.id AS icon
     FROM weapon_attributes JOIN status_icons on status_icons.name ILIKE weapon_attributes.id ;`,
};


module.exports = queries;
