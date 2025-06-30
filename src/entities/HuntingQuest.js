import QuestCategory from './game-data/QuestCategory.js';
import QuestType from './game-data/QuestType.js';
import GamingPlatforms from './game-data/GamingPlatforms.js';
import QuestMonster from './QuestMonster.js';
import Slot from './Slot.js';
import MonsterVariant from './game-data/MonsterVariant.js';
import QuestBonusReward from './QuestBonusRewards.js';
import { findClassEnumStaticPropInstance } from '../public/js/common/util.js';
import Monster from './game-data/Monster.js';
import MonsterCrown from './game-data/MonsterCrown.js';
import { Loadout } from './Loadout.js';
import Item from './game-data/Item.js';

/** Class representing a Game Hunting Quest */
export default class HuntingQuest {
  #title;
  #description;
  // Protected:
  _category;
  _type;
  _gamingPlatforms;
  _quest_monsters;
  _player_slots;
  _quest_bonus_rewards;

  #auto_generated_title = false;

  /**
   * Creates a HuntingQuest instance
   * @param {Object} options - Quest configuration object
   * @param {string} [options.id] - Unique ID
   * @param {string} [options.title] - Quest title. Max 100 characters
   * @param {string} [options.description] - Quest description. Max 200 characters
   * @param {QuestCategory} [options.category] - Quest category
   * @param {string} [options.star_rank] - Quest Star Rank
   * @param {string} [options.area] - Quest area
   * @param {QuestType} [options.type] - Quest type
   * @param {number} [options.hr_requirement] - Min HR needed. Min 1, Max 191 (cap is actually 999 , doesn't really matter tho)
   * @param {number} [options.time_limit] - Time limit in minutes. Min 15 , Max 60
   * @param {boolean} [options.crossplay_enabled=true] - Crossplay enabled
   * @param {GamingPlatforms[]} [options.gaming_platforms=[]] - Gaming platforms
   * @param {QuestMonster[]} [options.quest_monsters=[]] - Quest monsters
   * @param {Slot[]} [options.player_slots=[]] - Player slots
   * @param {QuestBonusReward[]} [options.quest_bonus_rewards=[]] - Quest Bonus rewards. Can only be defined by user who has the quest. Max 30 types (idk gaming cap)
   * @param {Date} [options.created_at] - Creation date
   */
  constructor(options = {}) {
    const {
      id,
      title = '',
      description = '',
      category = QuestCategory.FIELD_SURVEY,
      star_rank = 'High Rank',
      area = '',
      type = QuestType.HUNT,
      hr_requirement = 21,
      time_limit = 35,
      crossplay_enabled = true,
      gaming_platforms = [],
      quest_monsters = [],
      player_slots = [],
      quest_bonus_rewards = [],
      created_at,
    } = options;

    this.id = id;
    this.description = description;
    this.star_rank = star_rank;
    this.area = area;
    this.hr_requirement = hr_requirement;
    this.time_limit = time_limit;
    this.crossplay_enabled = crossplay_enabled;
    this.created_at = created_at;

    // Use setters for validation (will be null/empty if invalid during preview)
    this.category = category;
    this.type = type;
    this.gaming_platforms = gaming_platforms;
    this.quest_monsters = quest_monsters;
    this.player_slots = player_slots;
    this.quest_bonus_rewards = quest_bonus_rewards;

    this.title = title;
  }

  get title() {
    return this.#title;
  }

  set title(value) {
    if (value === null || value === undefined || value === '') {
      this.#auto_generated_title = true;
      this.#title = this.#generateQuestTitle(); // Set to default
      return;
    }

    if (value.length > 100) {
      console.warn(
        `Invalid title: ${value}. Should be less than 100 characters. Using default.`
      );
      this.#auto_generated_title = true;
      this.#title = this.#generateQuestTitle(); // Set to default
    } else {
      this.#title = value;
      this.#auto_generated_title = false;
    }
  }
  get description() {
    return this.#description;
  }

  set description(value) {
    if (value === null || value === undefined) {
      return;
    }

    if (value.length > 200) {
      throw new Error(
        `Invalid description: ${value}. Should be less than 200 characters.`
      );
    } else {
      this.#description = value;
    }
  }

  get category() {
    return this._category;
  }

  set category(value) {
    if (value === null || value === undefined || value === '') {
      this._category = null; // Allow empty for preview
      return;
    }

    if (!Object.values(QuestCategory).includes(value)) {
      console.warn(`Invalid category: ${value}. Using default.`);
      this._category = QuestCategory.FIELD_SURVEY;
    } else {
      this._category = value;
    }
  }

  get type() {
    return this._type;
  }

  set type(value) {
    if (value === null || value === undefined || value === '') {
      this._type = null;
      return;
    }

    if (!Object.values(QuestType).includes(value)) {
      console.warn(`Invalid type: ${value}. Using default.`);
      this._type = QuestType.HUNT;
    } else {
      this._type = value;
    }
  }

  get gaming_platforms() {
    return this._gamingPlatforms || [];
  }

  set gaming_platforms(value) {
    if (!Array.isArray(value)) {
      console.warn('Invalid gaming platforms. Must be array.');
      this._gamingPlatforms = [];
      return;
    }

    if (this.crossplay_enabled && value.length > 0) {
      console.warn('Crossplay enabled, ignoring specific platforms.');
      this._gamingPlatforms = [];
      return;
    }
    const validPlatforms = value.filter((platform) =>
      Object.values(GamingPlatforms).includes(platform)
    );

    if (validPlatforms.length !== value.length) {
      console.warn('Some invalid platforms filtered out.');
    }

    this._gamingPlatforms = validPlatforms;
  }

  get quest_monsters() {
    return this._quest_monsters || [];
  }

  set quest_monsters(value) {
    if (!Array.isArray(value)) {
      console.warn('Invalid quest monsters. Must be array.');
      this._quest_monsters = [];
      return;
    }

    // Allow empty array for preview (user might be adding monsters)
    if (value.length === 0) {
      this._quest_monsters = [];
      return;
    }

    if (value.length > 2) {
      console.warn('Too many monsters. Taking first 2.');
      value = value.slice(0, 2);
    }

    const validMonsters = value.filter(
      (monster) => monster instanceof QuestMonster
    );

    if (validMonsters.length !== value.length) {
      console.warn('Some invalid monsters filtered out.');
    }

    this._quest_monsters = validMonsters;
  }

  get player_slots() {
    return this._player_slots || [];
  }

  set player_slots(value) {
    if (!Array.isArray(value)) {
      console.warn('Invalid player slots. Must be array.');
      this._player_slots = [];
      return;
    }

    // Allow empty for preview, but warn if too many
    if (value.length > 4) {
      console.warn('Too many slots. Taking first 4.');
      value = value.slice(0, 4);
    }

    const validSlots = value.filter((slot) => slot instanceof Slot);

    if (validSlots.length !== value.length) {
      console.warn('Some invalid slots filtered out.');
    }

    this._player_slots = validSlots;
  }

  get quest_bonus_rewards() {
    return this._quest_bonus_rewards || [];
  }

  set quest_bonus_rewards(value) {
    if (!Array.isArray(value)) {
      console.warn('Invalid Quest Bonus Rewards. Must be array.');
      this._quest_bonus_rewards = [];
      return;
    }
    const validBonusRewards = value.filter(
      (bonus) => bonus instanceof QuestBonusReward
    );

    if (validBonusRewards.length !== value.length) {
      console.warn('Some invalid bonus rewards filtered out.');
    }

    this._quest_bonus_rewards = validBonusRewards;
  }

  #generateQuestTitle() {
    let questTitle = `${this.type}`;

    if (!this.quest_monsters) return questTitle;

    if (this.quest_monsters.length === 1) {
      const monsterName = this.#formatMonsterName(this.quest_monsters[0]);
      questTitle = questTitle + ' the ' + monsterName;
    } else {
      const monsterNames = this.quest_monsters.map((qm) =>
        this.#formatMonsterName(qm)
      );

      if (monsterNames.every((mn) => mn === monsterNames[0])) {
        questTitle =
          questTitle + ' ' + monsterNames.length + ' ' + monsterNames[0];
      } else {
        questTitle = questTitle + ' ' + monsterNames.join(' & ');
      }
    }

    return questTitle;
  }

  /**
   * Format monster to match its variant.
   * @param {QuestMonster} questMonster - Monster containing variant and name.
   * @returns {string} - Monster name with variant
   */
  #formatMonsterName(questMonster) {
    const monsterVariant = questMonster.variant;
    return `${
      monsterVariant.name === MonsterVariant.TEMPERED.name ? 'Tempered ' : ''
    }${
      monsterVariant.name === MonsterVariant.FRENZIED.name ? 'Frenzied ' : ''
    }${
      monsterVariant.name === MonsterVariant.ARCH_TEMPERED.name
        ? 'Arch-Tempered '
        : ''
    }${questMonster.monster.name}`.trim();
  }

  /**
   * Add a monster to the quest
   * @param {QuestMonster} monster - Monster to add
   * @returns {boolean} - Success status
   */
  addMonster(monster) {
    if (!(monster instanceof QuestMonster)) {
      console.warn('Invalid monster type.');
      return false;
    }

    if (this.quest_monsters.length >= 2) {
      console.warn('Cannot add more than 2 monsters.');
      return false;
    }

    const updatedMonsters = [...this.quest_monsters, monster];
    this.quest_monsters = updatedMonsters;
    return true;
  }

  /**
   * Remove a monster from the quest
   * @param {number} index - Index of monster to remove
   * @returns {boolean} - Success status
   */
  removeMonster(index) {
    if (index < 0 || index >= this.quest_monsters.length) {
      console.warn('Invalid monster index.');
      return false;
    }

    const updatedMonsters = this.quest_monsters.filter((_, i) => i !== index);
    this.quest_monsters = updatedMonsters;
    return true;
  }

  /**
   * Update a specific monster
   * @param {number} index - Index of monster to update
   * @param {QuestMonster} monster - New monster data
   * @returns {boolean} - Success status
   */
  updateMonster(index, monster) {
    if (index < 0 || index >= this.quest_monsters.length) {
      console.warn('Invalid monster index.');
      return false;
    }

    if (!(monster instanceof QuestMonster)) {
      console.warn('Invalid monster type.');
      return false;
    }

    const updatedMonsters = [...this.quest_monsters];
    updatedMonsters[index] = monster;
    this.quest_monsters = updatedMonsters;
    return true;
  }

  /**
   * Add a player slot
   * @param {Slot} slot - Slot to add
   * @returns {boolean} - Success status
   */
  addSlot(slot) {
    if (!(slot instanceof Slot)) {
      console.warn('Invalid slot type.');
      return false;
    }

    if (this.player_slots.length >= 4) {
      console.warn('Cannot add more than 4 slots.');
      return false;
    }

    const updatedSlots = [...this.player_slots, slot];
    this.player_slots = updatedSlots;
    return true;
  }

  /**
   * Remove a player slot
   * @param {number} index - Index of slot to remove
   * @returns {boolean} - Success status
   */
  removeSlot(index) {
    if (index < 0 || index >= this.player_slots.length) {
      console.warn('Invalid slot index.');
      return false;
    }

    const updatedSlots = this.player_slots.filter((_, i) => i !== index);
    this.player_slots = updatedSlots;
    return true;
  }

  // /**
  //  * Export quest data as plain object
  //  * @returns {Object}
  //  */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      category: this.category,
      star_rank: this.star_rank,
      area: this.area,
      type: this.type,
      hr_requirement: this.hr_requirement,
      time_limit: this.time_limit,
      crossplay_enabled: this.crossplay_enabled,
      gaming_platforms: this.gaming_platforms,
      quest_monsters: this.quest_monsters.map((m) =>
        m.toJSON ? m.toJSON() : m
      ),
      quest_bonus_rewards: this.quest_bonus_rewards.map((s) =>
        s.toJSON ? s.toJSON() : s
      ),
      player_slots: this.player_slots.map((s) => (s.toJSON ? s.toJSON() : s)),
      created_at: this.created_at,
    };
  }

  static fromDatabaseObject(dbObject, itemsList) {
    return new HuntingQuest({
      ...dbObject,
      category: findClassEnumStaticPropInstance(
        QuestCategory,
        dbObject.category.id
      ),
      type: findClassEnumStaticPropInstance(QuestType, dbObject.type.id),
      gaming_platforms:
        dbObject.gaming_platforms?.map((qp) =>
          findClassEnumStaticPropInstance(GamingPlatforms, qp.id)
        ) ?? [],
      quest_monsters: dbObject.quest_monsters.map(
        (qm) =>
          new QuestMonster(
            Monster.fromDatabaseObject(qm.monster),
            findClassEnumStaticPropInstance(MonsterVariant, qm.variant.id),

            findClassEnumStaticPropInstance(MonsterCrown, qm.crown.id),
            Number(qm.strength)
          )
      ),
      player_slots: dbObject.player_slots.map(
        (slot) =>
          new Slot({
            ...slot,
            loadout: Loadout.fromDatabaseObject(slot.loadout),
          })
      ),
      quest_bonus_rewards: dbObject.quest_bonus_rewards.map((qbr) => {
        const item = Item.fromDatabaseObject(
          itemsList.find((r) => r.id === qbr.item.id.toString())
        );
        const bonusReward = new QuestBonusReward(item, qbr.quantity);
        return bonusReward;
      }),
    });
  }
}
