/** Enum about loadout roles. */

class SlotConfigType {
  static FLEXIBLE = new SlotConfigType('Flexible', 'No loadout requirements.');
  static CUSTOM = new SlotConfigType('Custom', 'Customized loadout.');
  static PRESET = new SlotConfigType('Preset', 'Set from a loadout preset.');

  constructor(name, description) {
    this.name = name;
    this.description = description;
  }

  static values() {
    return Object.values(SlotConfigType).filter(
      (v) => v instanceof SlotConfigType
    );
  }

  toString() {
    return `${this.name}`;
  }
}

export default SlotConfigType;
