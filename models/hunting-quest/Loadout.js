const Skill = require('../Skill.js');
const WeaponAttribute = require('../WeaponAttribute.js');
const WeaponType = require('../WeaponType.js');

/** Class representing info about a loadout. */
class Loadout {
  /**
   * @param {string} id Loadout ID.
   * @param {string} name Loadout name.
   * @param {string} description Loadout description.
   * @param {LoadoutRole[]} roles Any/DPS/TANK etc.
   * @param {WeaponType[]} weapon_types Insect Glaive, SnS etc.
   * @param {WeaponAttribute[]} weapon_attr Fire, Water, Poison
   * @param {LoadoutSkill[]} skills
   */
  constructor(name, description, roles, weapon_types, weapon_attr, skills) {
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
  static Any = new LoadoutRole('Flexible', 'Can be any role.');
  static DPS = new LoadoutRole('DPS', 'Tons of damage.');
  static STATUS = new LoadoutRole('Status', 'Applies status.');
  static TANK = new LoadoutRole('Tank', 'Can take a hit.');
  static SUPPORT = new LoadoutRole('Support', 'Heals/buffs teammates.');

  constructor(name, summary) {
    this.name = name;
    this.summary = summary;
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
