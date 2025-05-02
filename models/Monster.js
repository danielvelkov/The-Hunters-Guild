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
   * @param {Object[]} special_attacks[].skill_counters Skill that Counters that special attack. 
   * @param {Object[]} weaknesses Monster's weaknesses.
   * @param {Object[]} weaknesses[].elements Monster elemental weaknesses.
   * @param {string} weaknesses[].elements[].name Monster elemental weakness name.
   * @param {string} weaknesses[].elements[].icon Icon name
   * @param {Object[]} weaknesses[].ailments Monster ailment weaknesses.
   * @param {string} weaknesses[].ailments[].name Monster ailment weakness name.
   * @param {string} weaknesses[].ailments[].icon Icon name
   * @param {Object[]} part_dmg_effectiveness Damage effectiveness of certain elements or types to a monster part.
   * @param {string} part_dmg_effectiveness[].name Monster part name.
   * @param {string} part_dmg_effectiveness[].icon Monster part Icon name.
   * @param {Object[]} part_dmg_effectiveness[].damages Damage type name and effectiveness value.
   * @param {string} part_dmg_effectiveness[].damages[].type Damage type name.
   * @param {string} part_dmg_effectiveness[].damages[].value Damage effectiveness.
   * @param {Object[]} status_effectiveness Status effectiveness of the monster.
   * @param {string} status_effectiveness[].name Status Effect name.
   * @param {string} status_effectiveness[].icon Status Icon name.
   * @param {Object} status_effectiveness[].stats Status related stats like buildup, duration, etc.
   * @param {string} status_effectiveness[].stats.value Status value.
   * @param {Object[]} item_effectiveness item effectiveness of the monster.
   * @param {string} item_effectiveness[].name Item name.
   * @param {string} item_effectiveness[].icon Item Icon name.
   * @param {string} item_effectiveness[].iconColor Item Icon Color.
   * @param {Object} item_effectiveness[].stats Item related stats like effectiveness, duration, tolerance, etc.
   * @param {string} item_effectiveness[].stats.effectiveness item effectiveness.
   * @param {boolean} canBeCaptured Monster can be captured
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
    weaknesses,
    part_dmg_effectiveness,
    status_effectiveness,
    item_effectiveness,
    canBeCaptured
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
    this.part_dmg_effectiveness = part_dmg_effectiveness;
    this.status_effectiveness = status_effectiveness;
    this.item_effectiveness = item_effectiveness;
    this.canBeCaptured = canBeCaptured;
  }
}

module.exports = Monster;
