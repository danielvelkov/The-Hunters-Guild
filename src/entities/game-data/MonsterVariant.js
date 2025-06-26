/** Enum representing different monster variants */
class MonsterVariant {
  /**
   * @param {number} id Variant ID
   * @param {string} name Variant name
   */
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }

  static BASE = new MonsterVariant(1, 'Base');
  static FRENZIED = new MonsterVariant(2, 'Frenzied');
  static TEMPERED = new MonsterVariant(3, 'Tempered');
  static ARCH_TEMPERED = new MonsterVariant(4, 'Arch Tempered');

  static values() {
    return Object.values(MonsterVariant).filter(
      (v) => v instanceof MonsterVariant
    );
  }

  toString() {
    return this.name;
  }
}

export default MonsterVariant;
