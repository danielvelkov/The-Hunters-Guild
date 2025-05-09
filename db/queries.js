const fs = require('fs');
const path = require('path');
const pool = require('./pool');

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

// Create and export database functions
module.exports = {
  async getMonstersInfo__AllWeaknesses() {
    const { rows } = await pool.query(queries.getMonsters__AllWeaknesses);
    return rows;
  },

  async getStatusIcons__NamesAndIconId() {
    const { rows } = await pool.query(queries.getStatusIcons__NamesAndIconId);
    return rows;
  },

  async getMonsterSpecialAttacks__NamesAndCounterSkills() {
    const { rows } = await pool.query(
      queries.getMonsterSpecialAttacksAndCounterSkills
    );
    return rows;
  },

  async getMonstersPartsDamageEffectiveness__NamesAndIconId() {
    const { rows } = await pool.query(
      queries.getMonstersParts__DamageEffectiveness
    );
    return rows;
  },

  async getBonusQuestRewardsList() {
    const { rows } = await pool.query(queries.getBonusQuestRewardsList);
    return rows;
  },

  async getMonsterDropsList() {
    const { rows } = await pool.query(queries.getMonsterDropsList);
    return rows;
  },

  async getSkills() {
    const { rows } = await pool.query(queries.getSkills);
    return rows;
  },

  async getWeaponTypes() {
    const { rows } = await pool.query(queries.getWeaponTypes);
    return rows;
  },

  async getWeaponAttributes() {
    const { rows } = await pool.query(queries.getWeaponAttributes);
    return rows;
  },
};
