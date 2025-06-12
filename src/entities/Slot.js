import { guidGenerator } from 'js/common/util.js';

export default class Slot {
  /**
   * @param {string} displayName - The display name for this slot (e.g., "Player 1", "Newbie Hunter").
   * @param {boolean} [isOwner=false] - Flag indicating if this slot is for the quest owner.
   * @param {boolean} canEdit - Flag indicating if this slot can be edited.
   */
  constructor({
    id = guidGenerator().substring(0, 4),
    displayName,
    isOwner = false,
    configurationType = 'Flexible',
    loadoutName = 'Flexible Loadout',
    loadoutDescription = 'Any skills and equipment are permitted for this slot.',
    roles = ['ANY'],
    weaponTypes = ['ANY'],
    weaponAttributes = ['ANY'],
    skills = ['ANY'],
    monsterPartFocus = ['ANY'],
    roleNotes = '',
  }) {
    // Generate ID
    this.id = id;
    // --- Slot Identification ---
    this.displayName = displayName;
    this.isOwner = isOwner;

    // --- Configuration Type ---
    this.configurationType = configurationType;

    // General Loadout Information
    this.loadoutName = loadoutName;
    this.loadoutDescription = loadoutDescription;

    this.roles = roles;
    this.weaponTypes = weaponTypes;
    this.weaponAttributes = weaponAttributes;
    this.skills = skills;
    this.monsterPartFocus = monsterPartFocus;
    this.roleNotes = roleNotes;
  }

  initFromLoadout(loadout) {
    this.loadoutName = loadout.name;
    this.loadoutDescription = loadout.description;
    this.roles = loadout.roles.map((r) => r.name);
    this.weaponTypes = loadout.weapon_types.map((wp) => wp.id.toString());
    this.weaponAttributes = loadout.weapon_attr.map((wa) => wa.id.toString());
    this.skills = loadout.skills;
  }
}
