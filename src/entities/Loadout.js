const Skill = require('./game-data/Skill');
const WeaponAttribute = require('./game-data/WeaponAttribute');
const WeaponType = require('./game-data/WeaponType');

/** Class representing info about a loadout. */
class Loadout {
  /**
   * @param {string} name Loadout display name.
   * @param {string} description
   * @param {LoadoutRole[]} roles
   * @param {WeaponType[]} weapon_types
   * @param {WeaponAttribute[]} weapon_attr
   * @param {LoadoutSkill[]} skills
   */
  constructor(
    name = 'Flexible Loadout',
    description = 'Any skills and equipment are permitted for this slot.',
    roles = [],
    weapon_types = [],
    weapon_attr = [],
    skills = []
  ) {
    this.name = name;
    this.description = description;
    this.roles = roles;
    this.weapon_types = weapon_types;
    this.weapon_attr = weapon_attr;
    this.skills = skills;
  }
}

/** Enum about loadout roles. */
class LoadoutRole {
  static DPS = new LoadoutRole(1, 'DPS', 'Tons of damage.');
  static STATUS = new LoadoutRole(2, 'Status', 'Applies status.');
  static TANK = new LoadoutRole(3, 'Tank', 'Can take a hit.');
  static SUPPORT = new LoadoutRole(4, 'Support', 'Heals/buffs teammates.');

  constructor(id, name, summary) {
    this.id = id;
    this.name = name;
    this.summary = summary;
  }
  static values() {
    return Object.values(LoadoutRole).filter((v) => v instanceof LoadoutRole);
  }
  toString() {
    return `${this.name} ${this.summary}`;
  }
}

/**
 * Loadout Skill info
 */
class LoadoutSkill extends Skill {
  /**
   * @param {string} id Unique Skill ID.
   * @param {string} name Skill name.
   * @param {string} icon Icon name.
   * @param {string} description Skill description.
   * @param {string} category Group/Set/Equipment/Weapon/Meal
   * @param {number} min_level Min required skill level for loadout.
   * @param {number} max_level Skill max level.
   * @param {string} set_count Number of similar equipment needed to activate the skill. Separated by comma like this '2,4'
   * @param {string[]} level_descriptions Description for each skill level.
   */
  constructor(
    id,
    name,
    icon,
    description,
    category,
    min_level,
    max_level,
    set_count,
    level_descriptions
  ) {
    super(
      id,
      name,
      icon,
      description,
      category,
      max_level,
      set_count,
      level_descriptions
    );
    this.min_level = min_level;
  }
}

module.exports = {
  Loadout,
  LoadoutRole,
  LoadoutSkill,
};
