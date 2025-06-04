/** Enum representing Different Quest Categories */
class QuestCategory {
  /**
   * @param {string} id Category ID
   * @param {string} name
   */
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }

  static ASSIGNMENT = new QuestCategory(1, 'Assignment');
  static OPTIONAL = new QuestCategory(2, 'Optional');
  static EVENT = new QuestCategory(3, 'Event');
  static FIELD_SURVEY = new QuestCategory(4, 'Field Survey');
  static SAVED_INVESTIGATION = new QuestCategory(5, 'Saved Investigation');
  static ARENA_QUEST = new QuestCategory(6, 'Arena Quest');
  static CHALLENGE_QUEST = new QuestCategory(7, 'Challenge Quest');
  static FREE_CHALLENGE_QUEST = new QuestCategory(8, 'Free Challenge Quest');

  static values() {
    return Object.values(QuestCategory).filter(
      (v) => v instanceof QuestCategory
    );
  }

  toString() {
    return this.name;
  }
}

module.exports = QuestCategory;
