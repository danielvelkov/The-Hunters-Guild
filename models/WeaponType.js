/** Class representing Weapon Type. */
class WeaponType {
  /**
   * @param {string} id Weapon Type ID
   * @param {string} name Weapon Type name.
   */
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
  // TODO: (change it to init from db somehow)
  // Static fields for each weapon type
  static GREAT_SWORD = new WeaponType('14', 'Great Sword');
  static SWORD_AND_SHIELD = new WeaponType('13', 'Sword & Shield');
  static DUAL_BLADES = new WeaponType('12', 'Dual Blades');
  static LONG_SWORD = new WeaponType('11', 'Long Sword');
  static HAMMER = new WeaponType('10', 'Hammer');
  static HUNTING_HORN = new WeaponType('9', 'Hunting Horn');
  static LANCE = new WeaponType('8', 'Lance');
  static GUNLANCE = new WeaponType('7', 'Gunlance');
  static SWITCH_AXE = new WeaponType('6', 'Switch Axe');
  static CHARGE_BLADE = new WeaponType('5', 'Charge Blade');
  static INSECT_GLAIVE = new WeaponType('4', 'Insect Glaive');
  static BOW = new WeaponType('3', 'Bow');
  static HEAVY_BOWGUN = new WeaponType('2', 'Heavy Bowgun');
  static LIGHT_BOWGUN = new WeaponType('1', 'Light Bowgun');
}

module.exports = WeaponType;
