/** Enum representing Different Monster Crowns*/
class MonsterCrown {
  /**
   * @param {number} id Crown ID
   * @param {string} name Crown name
   */
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }

  static BASE = new MonsterCrown(1, 'Base');
  static MINI = new MonsterCrown(2, 'Mini');
  static SILVER = new MonsterCrown(3, 'Silver');
  static GOLD = new MonsterCrown(4, 'Gold');

  static values() {
    return Object.values(MonsterCrown).filter((v) => v instanceof MonsterCrown);
  }

  toString() {
    return this.name;
  }
}

export default MonsterCrown;
