import { filterOutMaliciousSymbols, guidGenerator } from 'js/common/util.js';
import { Loadout } from './Loadout';
import SlotConfigType from './SlotConfigType';

/**
 * Slot details for Hunting Quest
 */
export default class Slot {
  _notes;
  _loadout;
  /**
   * @param {string} displayName - The display name for this slot (e.g., "Player 1", "Newbie Hunter"). Max length - 50
   * @param {boolean} [isOwner=false] - Flag indicating if this slot is for the quest owner.
   * @param {boolean} canEdit - Flag indicating if this slot can be edited.
   * @param {SlotConfigType} configurationType - Flag indicating if this slot can be edited.
   * @param {Loadout} loadout - Contains loadout details like role, used weapons/weapon attributes
   * @param {Object[]} monsterPartFocus - which monster parts will be focused
   * @param {string} monsterPartFocus[].id - part id
   * @param {string} monsterPartFocus[].name - part name
   * @param {string} monsterPartFocus[].monster - monster name
   * @param {string} notes - Specific notes for this slot. Max length - 100
   */
  constructor({
    id = guidGenerator().substring(0, 4),
    displayName,
    isOwner = false,
    canEdit = true,
    configurationType = SlotConfigType.FLEXIBLE,
    loadout,
    monsterPartFocus = [],
    notes = '',
  }) {
    // Generate ID
    this.id = id;
    // --- Slot Identification ---
    this.displayName = displayName;
    this.isOwner = isOwner;

    // --- Configuration Type ---
    this.configurationType = configurationType;
    this.canEdit = canEdit;

    this.monsterPartFocus = monsterPartFocus;

    // General Loadout Information
    this.loadout = loadout;
    this.notes = notes;
  }

  get loadout() {
    return this._loadout;
  }

  set loadout(value) {
    if (value === null || value === undefined || value === '') {
      this._loadout = new Loadout();
      return;
    }
    if (!(value instanceof Loadout)) {
      console.warn(`Invalid loadout: ${value}. Using default.`);
      this._loadout = new Loadout();
    } else {
      this._loadout = value;
    }
  }

  get notes() {
    return this._notes;
  }

  set notes(value) {
    if (typeof value !== 'string' || (value && value.trim() === '')) {
      console.warn('Invalid notes. Must be a non-empty string.');
      return;
    }
    if (value.length > 100) {
      throw new Error(
        `Invalid slot notes: ${value}. Should be less than 100 characters.`
      );
    } else {
      this._notes = filterOutMaliciousSymbols(value);
    }
  }
  toJSON() {
    return {
      id: this.id,
      displayName: this.displayName,
      isOwner: this.isOwner,
      canEdit: this.canEdit,
      configurationType: this.configurationType,
      loadout: this.loadout,
      monsterPartFocus: this.monsterPartFocus,
      notes: this.notes,
    };
  }
}
