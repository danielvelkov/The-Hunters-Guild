/** Class representing base monster info. */
class Monster {
  /**
   * @param {string} id Unique Monster ID
   * @param {string} name Monster name.
   * @param {string} icon Icon name.
   * @param {boolean} frenzied Whether the monster has a frenzied variant.
   * @param {boolean} tempered Whether the monster has a tempered variant.
   * @param {boolean} arch_tempered If it Has Arch Tempered Variant (MH Wilds - TU1)
   * @param {string[]} locales Areas it inhabits.
   * @param {number} base_health Health at lowest possible quest rank for monster.
   * @param {Object[]} special_attacks Monster's signature moves.
   * @param {string} special_attacks[].name Move name.
   * @param {string} special_attacks[].description Attack description.
   * @param {Object[]} weaknesses Monster's weaknesses.
   * @param {Object[]} weaknesses[].elements Monster elemental weaknesses.
   * @param {string} weaknesses[].elements[].name Monster elemental weakness name.
   * @param {string} weaknesses[].elements[].icon Icon name
   * @param {Object[]} weaknesses[].ailments Monster ailment weaknesses.
   * @param {string} weaknesses[].ailments[].name Monster ailment weakness name.
   * @param {string} weaknesses[].ailments[].icon Icon name
   */
  constructor(
    id,
    name,
    icon,
    frenzied,
    tempered,
    arch_tempered,
    locales,
    base_health,
    special_attacks,
    weaknesses
  ) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.frenzied = frenzied;
    this.tempered = tempered;
    this.arch_tempered = arch_tempered;
    this.locales = locales;
    this.base_health = base_health;
    this.special_attacks = special_attacks;
    this.weaknesses = weaknesses;
  }
}

module.exports = Monster;
