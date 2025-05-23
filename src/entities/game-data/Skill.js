/** Class representing Skill info. */
class Skill {
  /**
   * @param {string} id Unique Skill ID.
   * @param {string} name Skill name.
   * @param {string} icon Icon name.
   * @param {string} description Skill description.
   * @param {string} category Group/Set/Equipment/Weapon/Meal
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
    max_level,
    set_count,
    level_descriptions
  ) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.description = description;
    this.category = category;
    this.max_level = max_level;
    this.set_count= set_count;
    this.level_descriptions = level_descriptions;
  }
}

module.exports = Skill;
