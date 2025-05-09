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
}

module.exports = WeaponAttribute;
