import HuntingQuest from 'entities/HuntingQuest.js';
import GamingPlatforms from 'entities/game-data/GamingPlatforms';
import QuestCategory from 'entities/game-data/QuestCategory';
import QuestType from 'entities/game-data/QuestType';
import QuestMonster from 'entities/QuestMonster';
import Slot from 'entities/Slot';
import QuestBonusReward from 'entities/QuestBonusRewards';
/**
 * Client-side model for handling Hunting Quest form data and previews
 */
class HuntingQuestFormModel extends HuntingQuest {
  _changeListeners = [];

  constructor(options = {}) {
    super(options);
  }

  /**
   * Creates a HuntingQuest from form data
   * @param {FormData} formData - Form data from quest form
   * @param {QuestMonster[]} monsters - Array of quest monsters
   * @param {Slot[]} slots - Array of player slots
   * @param {QuestBonusReward[]} bonusQuestRewards - Array of bonus quest rewards
   * @returns {HuntingQuest}
   */
  static fromFormData(
    formData,
    monsters = [],
    slots = [],
    bonusQuestRewards = []
  ) {
    return new HuntingQuestFormModel({
      title: formData.get('quest-title') || '',
      description: formData.get('quest-description') || '',
      category: formData.get('quest-category'),
      star_rank: formData.get('quest-star-rank') || '1',
      area: formData.get('locale') || formData.get('area'),
      type: formData.get('quest-type'),
      hr_requirement: parseInt(formData.get('hunter-rank-requirement')) || 1,
      time_limit: parseInt(formData.get('time-limit')) || 50,
      crossplay_enabled: formData.get('cross-play-enabled') === 'on',
      gaming_platforms: formData.getAll('gaming-platform') || [],
      quest_monsters: monsters,
      player_slots: slots,
      quest_bonus_rewards: bonusQuestRewards,
    });
  }

  // Preview-specific validation
  isValidForPreview() {
    return Boolean(
      this.title &&
        this.category &&
        this.type &&
        this.area &&
        this.quest_monsters
    );
  }

  // Submit Validation
  isValid() {
    return Object.keys(this.getValidationErrors()).length === 0;
  }

  /**
   * Get validation errors for current state
   * @returns {Object} - Object containing validation errors
   */
  getValidationErrors() {
    const errors = {};

    if (!this.category) errors.category = 'Category is required';
    if (!this.type) errors.type = 'Type is required';
    if (!this.area) errors.area = 'Area is required';
    if (this.quest_monsters.length === 0)
      errors.quest_monsters = 'At least one selected monster is required';
    if (this.player_slots.length < 2)
      errors.player_slots = 'At least 2 player slots are required for a quest';

    if (this.area === '-- No Common Locale --')
      errors.quest_monsters =
        'Selected monsters do not exist in a common locale.';

    return errors;
  }

  // UI update methods
  updateProperties(updates) {
    const oldValues = {};

    Object.keys(updates).forEach((key) => {
      if (this.hasOwnProperty(key)) {
        oldValues[key] = this[key];
        this[key] = updates[key];
      }
    });

    this.notifyChange('bulk_update', { updates, oldValues });
  }

  // Change listener methods
  onChange(callback) {
    this._changeListeners.push(callback);
    return () => {
      const index = this._changeListeners.indexOf(callback);
      if (index > -1) this._changeListeners.splice(index, 1);
    };
  }

  notifyChange(property, value) {
    if (this._changeListeners)
      this._changeListeners.forEach((callback) => {
        try {
          callback(property, value, this);
        } catch (error) {
          console.error('Error in change listener:', error);
        }
      });
  }

  get category() {
    return super.category;
  }

  // Override setters to include change notifications
  /**
   * @param {QuestCategory} value
   */
  set category(value) {
    // Handle string (from form)
    if (typeof value === 'string') {
      value = findClassEnumStaticPropInstance(QuestCategory, value);
    }
    super.category = value;
    this.notifyChange('category', this.category);
  }

  get type() {
    return super.type;
  }

  /**
   * @param {QuestType} value
   */
  set type(value) {
    // Handle string (from form)
    if (typeof value === 'string') {
      value = findClassEnumStaticPropInstance(QuestType, value);
    }
    super.type = value;
    this.notifyChange('type', this.type);
  }

  get gaming_platforms() {
    return super.gaming_platforms;
  }

  /**
   * @param {GamingPlatforms[]} values
   */
  set gaming_platforms(values) {
    // Handle string (from form)
    if (values.some((i) => typeof i === 'string')) {
      values = values.map((v) =>
        findClassEnumStaticPropInstance(GamingPlatforms, v)
      );
    }
    super.gaming_platforms = values; // Ensure parent class has `gaming_platforms`
    this.notifyChange('gaming_platforms', this.gamingPlatforms);
  }

  get quest_monsters() {
    return super.quest_monsters;
  }

  /**
   * @param {QuestMonster[]} values
   */
  set quest_monsters(values) {
    super.quest_monsters = values;
    this.notifyChange('quest_monsters', this.quest_monsters);
  }

  get player_slots() {
    return super.player_slots;
  }

  /**
   * @param {Slot[]} values
   */
  set player_slots(values) {
    super.player_slots = values;
    this.notifyChange('player_slots', this.player_slots);
  }

  get quest_bonus_rewards() {
    return super.quest_bonus_rewards;
  }

  /**
   * @param {QuestBonusReward[]} values
   */
  set quest_bonus_rewards(values) {
    super.quest_bonus_rewards = values;
    this.notifyChange('quest_bonus_rewards', this.quest_bonus_rewards);
  }
}

function findClassEnumStaticPropInstance(Class, value) {
  const staticPropInstance = Class.values().find(
    (staticProps) =>
      staticProps === value ||
      staticProps.id.toString() === value ||
      staticProps.name === value
  );
  return staticPropInstance || null;
}

export default HuntingQuestFormModel;
