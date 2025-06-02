/**
 * Class representing item info.
 * @property {string} id - Unique Item ID
 * @property {string} name - Item name
 * @property {string} icon - Icon name
 * @property {string} iconColor - Icon coloring
 * @property {string} description - Item description
 * @property {string} type - Item type ('Food Ingredient', 'Material', 'Consumable', etc)
 * @property {number} rarity - 1-7 with 1 being common; 7 - Super Rare
 * @property {string} source - Where to get the item
 */
class Item {
  /**
   * @param {string} id Unique Item ID
   * @param {string} name Item name.
   * @param {string} icon Icon name.
   * @param {string} iconColor Icon coloring.
   * @param {string} description
   * @param {string} type Item type ('Food Ingredient', 'Material', 'Consumable', etc)
   * @param {number} rarity 1-7 with 1 being common; 7 - Super Rare
   * @param {string} source Where to get the item.
   */
  constructor(id, name, icon, iconColor, description, type, rarity, source) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.iconColor = iconColor;
    this.description = description;
    this.type = type;
    this.rarity = rarity;
    this.source = source;
  }
}

module.exports = Item;
