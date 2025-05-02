/** Class representing Skill info. */
class Skill {
  /**
   * @param {string} id Unique Skill ID.
   * @param {string} name Skill name.
   * @param {string} icon Icon name.
   * @param {string} description Skill description.
   * @param {string} category Group/Set/Equipment/Weapon/Meal
   * @param {number} max_level Skill max level.
   * @param {string[]} level_descriptions Description for each skill level.
   */
  constructor(
    id,
    name,
    icon,
    description,
    category,
    max_level,
    level_descriptions
  ) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.description = description;
    this.category = category;
    this.max_level = max_level;
    this.level_descriptions = level_descriptions;
  }
}

module.exports = Skill;
