import {
  findClassEnumStaticPropInstance,
  filterOutMaliciousSymbols,
} from '../public/js/common/util.js';
import Skill from './game-data/Skill.js';
import WeaponAttribute from './game-data/WeaponAttribute.js';
import WeaponType from './game-data/WeaponType.js';

/** Class representing info about a loadout. */
export class Loadout {
  /**
   * @param {string} name Loadout display name. Max length - 50
   * @param {string} description Loadout description. Max length - 100
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

  get name() {
    return this._name;
  }

  set name(value) {
    if (typeof value !== 'string' || value.trim() === '') {
      console.warn('Invalid name. Must be a non-empty string.');
      return;
    }

    if (value.length > 50) {
      throw new Error(
        `Invalid loadout name: ${value}. Should be less than 50 characters.`
      );
    } else {
      this._name = filterOutMaliciousSymbols(value);
    }
  }

  get description() {
    return this._description;
  }

  set description(value) {
    if (typeof value !== 'string' || value.trim() === '') {
      console.warn('Invalid description. Must be a non-empty string.');
      return;
    }
    if (value.length > 100) {
      throw new Error(
        `Invalid loadout description: ${value}. Should be less than 100 characters.`
      );
    } else {
      this._description = filterOutMaliciousSymbols(value);
    }
  }

  get roles() {
    return this._roles;
  }

  set roles(value) {
    if (
      !Array.isArray(value) ||
      value.some((role) => !(role instanceof LoadoutRole))
    ) {
      console.warn('Invalid roles. Must be an array of LoadoutRole.');
      return;
    }
    this._roles = value;
  }

  get weapon_types() {
    return this._weapon_types;
  }

  set weapon_types(value) {
    if (
      !Array.isArray(value) ||
      value.some((type) => !(type instanceof WeaponType))
    ) {
      console.warn('Invalid weapon_types. Must be an array of WeaponType.');
      return;
    }
    this._weapon_types = value;
  }

  get weapon_attr() {
    return this._weapon_attr;
  }

  set weapon_attr(value) {
    if (
      !Array.isArray(value) ||
      (Array.isArray(value) &&
        value.length &&
        value.some((attr) => !(attr instanceof WeaponAttribute)))
    ) {
      console.log(value);
      console.warn('Invalid weapon_attr. Must be an array of WeaponAttribute.');
      return;
    }
    this._weapon_attr = value;
  }

  get skills() {
    return this._skills;
  }

  set skills(value) {
    if (
      !Array.isArray(value) ||
      (value.length && value.some((skill) => !(skill instanceof Skill)))
    ) {
      throw new Error('Invalid skills. Must be an array of Skill.');
      return;
    }
    this._skills = value;
  }

  static fromDatabaseObject(dbObject) {
    return new Loadout(
      dbObject.name,
      dbObject.description,
      dbObject.roles.map((role) =>
        findClassEnumStaticPropInstance(LoadoutRole, role.name)
      ),
      dbObject.weapon_types.map((wt) =>
        findClassEnumStaticPropInstance(WeaponType, wt.name)
      ),
      dbObject.weapon_attr.map((wa) =>
        findClassEnumStaticPropInstance(WeaponAttribute, wa.name)
      ),
      dbObject.skills.map(
        (skill) =>
          new LoadoutSkill(
            skill.id,
            skill.name,
            skill.icon,
            skill.description,
            skill.category,
            skill.min_level,
            skill.max_level,
            skill.set_count,
            skill.level_descriptions
          )
      )
    );
  }
  toJSON() {
    return {
      name: this.name,
      description: this.description,
      roles: this.roles,
      weapon_types: this.weapon_types,
      weapon_attr: this.weapon_attr,
      skills: this.skills,
    };
  }
}

/** Enum about loadout roles. */
export class LoadoutRole {
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
export class LoadoutSkill extends Skill {
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
