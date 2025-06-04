/** Enum representing Different Quest Types*/
class QuestType {
  /**
   * @param {string} id Type ID
   * @param {string} name
   */
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }

  static HUNT = new QuestType(1, 'Hunt');
  static SLAY = new QuestType(2, 'Slay');
  static CAPTURE = new QuestType(3, 'Capture');
  static REPEL = new QuestType(4, 'Repel');
  static OTHER = new QuestType(5, 'Other');

  static values() {
    return Object.values(QuestType).filter((v) => v instanceof QuestType);
  }
  toString() {
    return this.name;
  }
}

module.exports = QuestType;
