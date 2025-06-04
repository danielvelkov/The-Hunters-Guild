import Monster from './game-data/Monster';
import MonsterVariant from './game-data/MonsterVariant';
import MonsterCrown from './game-data/MonsterCrown';

/** Class representing selected monster and additional details like if it has a crown.  */
export default class QuestMonster {
  #monster;
  #variant;
  #crown;
  #strength;

  /**
   * @param {Monster} monster - Game Monster
   * @param {MonsterVariant} variant - Monster Variant. 'Tempered', 'Frenzied', etc.
   * @param {MonsterCrown} crown - Monster crown. 'Silver', 'Gold' , etc.
   * @param {number} strength - Monster Strength. Values 1-5
   */
  constructor(monster, variant, crown, strength) {
    this.monster = monster;
    this.variant = variant;
    this.crown = crown;
    this.strength = strength;
  }

  get monster() {
    return this.#monster;
  }

  set monster(value) {
    if (!(value instanceof Monster)) {
      throw new Error(
        `Invalid monster: ${value}. Must be an instance of Monster.`
      );
    }
    this.#monster = value;
  }

  get variant() {
    return this.#variant;
  }

  set variant(value) {
    if (!Object.values(MonsterVariant).includes(value)) {
      console.warn(`Invalid variant: ${value}. Using default.`);
      this.#variant = MonsterVariant.BASE;
    } else {
      this.#variant = value;
    }
  }

  get crown() {
    return this.#crown;
  }

  set crown(value) {
    if (!Object.values(MonsterCrown).includes(value)) {
      console.warn(`Invalid crown: ${value}. Using default.`);
      this.#crown = MonsterCrown.BASE;
    } else {
      this.#crown = value;
    }
  }

  get strength() {
    return this.#strength;
  }

  set strength(value) {
    if (typeof value !== 'number' || value < 1 || value > 5) {
      throw new Error(
        `Invalid strength: ${value}. Must be a number between 1 and 5.`
      );
    }
    this.#strength = value;
  }
}
