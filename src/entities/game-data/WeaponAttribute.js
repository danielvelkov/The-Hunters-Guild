/** Class representing Weapon Type. */
class WeaponAttribute {
  /**
   * @param {string} id Weapon Attribute ID
   * @param {string} name Weapon Attribute name.
   * @param {string} icon Weapon Attribute icon name.
   */
  constructor(id, name, icon) {
    this.id = id;
    this.name = name;
    this.icon = icon;
  }
  // TODO: (change it to init from db somehow)
  // Static fields for each weapon attribute
  static FIRE = new WeaponAttribute('1', 'FIRE', 'STATUS_0000');
  static WATER = new WeaponAttribute('2', 'WATER', 'STATUS_0001');
  static ICE = new WeaponAttribute('3', 'ICE', 'STATUS_0003');
  static THUNDER = new WeaponAttribute('4', 'THUNDER', 'STATUS_0002');
  static DRAGON = new WeaponAttribute('5', 'DRAGON', 'STATUS_0004');
  static POISON = new WeaponAttribute('6', 'POISON', 'STATUS_0005');
  static PARALYSIS = new WeaponAttribute('7', 'PARALYSIS', 'STATUS_0007');
  static SLEEP = new WeaponAttribute('8', 'SLEEP', 'STATUS_0009');
  static BLAST = new WeaponAttribute('9', 'BLAST', 'STATUS_0010');

  static values() {
    return Object.values(WeaponAttribute).filter(
      (v) => v instanceof WeaponAttribute
    );
  }
}

module.exports = WeaponAttribute;
