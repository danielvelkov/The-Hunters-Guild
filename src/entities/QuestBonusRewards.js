const Item = require('./game-data/Item');

class QuestBonusReward {
  #item;
  #quantity;
  /**
   * @param {Item} item - Game Item
   * @param {number} quantity - Min 1, Max IDK (20 for now)
   */
  constructor(item, quantity = 1) {
    this.item = item;
    this.quantity = quantity;
  }

  get item() {
    return this.#item;
  }

  set item(value) {
    if (!(value instanceof Item)) {
      throw new Error(`Invalid item: ${value}. Must be an instance of Item.`);
    }
    this.#item = value;
  }

  get quantity() {
    return this.#quantity;
  }

  set quantity(value) {
    if (typeof value !== 'number' || value < 1 || value > 20) {
      throw new Error(
        `Invalid quantity: ${value}. Must be a number between 1 and 20.`
      );
    }
    this.#quantity = value;
  }
  toJSON() {
    return {
      item: { id: this.item.id },
      quantity: this.quantity,
    };
  }
}

module.exports = QuestBonusReward;
