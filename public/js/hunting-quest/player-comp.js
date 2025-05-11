import { skillsList, weaponAttributesList, weaponTypesList } from './create.js';

class PlayerComp {
  constructor(playerSlots = []) {
    this.playerSlots = playerSlots;
    this.cacheDOM();
    this.bindEvents();
    this.addSlot(new Slot('Custom Slot #' + this.playerSlots.length, true));
    this.setSelectedSlot(this.playerSlots[0]);
    this.displaySlots();
  }

  cacheDOM() {
    this.playerSlotsList = $('.player-slots-list');
    this.configureSlot = $('#configure-slot');

    const addSlotTemplate = document.getElementById('add-player-slot-template');
    this.addPlayerPlaceholderElement = $(
      addSlotTemplate.content.cloneNode(true)
    ).find('.player-slot.open-slot');

    const playerConfigFormTemplate = document.getElementById(
      'player-configure-form-template'
    );
    this.playerConfigFormTabs = $(
      playerConfigFormTemplate.content.cloneNode(true)
    ).find('.config-tabs');
  }

  bindEvents() {
    this.addPlayerPlaceholderElement.on('click', () => {
      this.addSlot(new Slot('Custom Slot #' + this.playerSlots.length));
    });
  }

  get isSlotAvailable() {
    return this.playerSlots.length < 4;
  }

  addSlot(slot) {
    this.playerSlots.push(slot);
    console.log('Slot added at index:' + this.playerSlots.length);
    this.displaySlots();
  }

  removeSlot(slot) {
    if (this.selectedSlot === slot) this.setSelectedSlot(this.playerSlots[0]);
    this.playerSlots.splice(this.playerSlots.indexOf(slot), 1);
    this.displaySlots();
  }

  setSelectedSlot(slot) {
    this.selectedSlot = slot;
    console.log('Selected slot: ' + slot.displayName);
    this.createPlayerSlotConfigurationElement(slot);
  }

  displaySlots() {
    this.playerSlotsList.empty();
    this.playerSlots.forEach((playerSlot, i) => {
      this.playerSlotsList.append(this.createSlotElement(playerSlot));
    });

    if (this.isSlotAvailable)
      this.playerSlotsList.append(
        this.addPlayerPlaceholderElement.clone(true, true)
      );
  }

  createSlotElement(slot) {
    let slotElement = $('<li>')
      .addClass('player-slot')
      .on('click', () => {
        this.setSelectedSlot(slot);
      });

    let removeButtonElement = $('<button>')
      .text('X')
      .addClass('remove-button')
      .on('click', () => {
        this.removeSlot(slot);
      });

    const title = $('<span>').text(slot.displayName).css('margin-left', '1em');

    const headerElement = $('<div>')
      .css('display', 'flex')
      .css('justify-content', 'space-between')
      .css('width', '100%');

    headerElement.append(title);
    if (!slot.isOwner) headerElement.append(removeButtonElement);

    slotElement.append(headerElement);
    return slotElement;
  }

  createPlayerSlotConfigurationElement(slot) {
    this.configureSlot.find('.config-tabs').remove();
    this.configureSlot.find('legend').text('Configure ' + slot.displayName);

    const tabs = this.playerConfigFormTabs.clone(true, true);

    this.configureSlot.append(tabs);

    tabs.tabs();
    initializeWeaponTypeSelect(tabs.find('select[name="weapon-types[]"]'));
    initializeWeaponAttributeSelect(
      tabs.find('select[name="weapon-attributes[]"]')
    );
  }
}

function initializeWeaponTypeSelect(weaponTypeSelect) {
  weaponTypeSelect.select2({
    placeholder: '-- Choose a weapon--',
    allowClear: true,
    templateResult: formatWeaponTypeOption,
  });

  // Clear handler
  weaponTypeSelect.on('select2:clear', () => {
    // Update player slot
  });

  // Select handler
  weaponTypeSelect.on('select2:select', function (e) {
    const data = e.params.data;
    if (!data.id) {
      return;
    }
    // Update player slot
  });
}

function formatWeaponTypeOption(item) {
  return $(`<span class='monster-select-content'>
      <span class='monster-select-name'>
        ${
          item.element?.dataset.weaponIcon
            ? `<img height='18' src="icons/Weapon Types/${item.element?.dataset.weaponIcon}.png"/>`
            : ''
        }
        <b>${item.text}</b>
      </span>
    </span>`);
}

function initializeWeaponAttributeSelect(weaponAttributeSelect) {
  weaponAttributeSelect.select2({
    placeholder: '-- Choose an attribute --',
    allowClear: true,
    templateResult: formatWeaponAttributeOption,
  });

  // Clear handler
  weaponAttributeSelect.on('select2:clear', () => {
    // Update player slot
  });

  // Select handler
  weaponAttributeSelect.on('select2:select', function (e) {
    const data = e.params.data;
    if (!data.id) {
      return;
    }
    // Update player slot
  });
}

function formatWeaponAttributeOption(item) {
  return $(`<span class='monster-select-content'>
      <span class='monster-select-name'>
        ${
          item.element?.dataset.attrIcon
            ? `<img height='18' src="icons/Status Icons/${item.element?.dataset.attrIcon}.png"/>`
            : ''
        }
        <b>${
          item.text.trim().charAt(0).toUpperCase() +
          item.text.trim().substring(1).toLowerCase()
        }</b>
      </span>
    </span>`);
}

class Slot {
  /**
   * @param {string} displayName - The display name for this slot (e.g., "Player 1", "Newbie Hunter").
   * @param {boolean} [isOwner=false] - Flag indicating if this slot is for the quest owner.
   * @param {boolean} canEdit - Flag indicating if this slot can be edited.
   * @param {object} loadout -
   */
  constructor(displayName, isOwner = false, canEdit = true, loadout) {
    // --- Slot Identification ---
    this.displayName = displayName;
    this.isOwner = isOwner;

    // --- Configuration Type ---
    // Determines how the slot's loadout is defined.
    // Possible values:
    // 'Flexible': Default, any skills/equipment allowed. Corresponds to "Flexible (Any skills and equipment)".
    // 'RoleLoadout': A predefined role loadout is selected.
    // 'Advanced': All fields manually specified by the quest creator.
    // 'Custom': Indicates a 'Flexible' or 'RoleLoadout' that has been modified.
    this.configurationType = 'Flexible';

    // --- Loadout Details ---
    // These fields store the specific requirements or preferences for the hunter in this slot.
    // Their values are determined by the configurationType and user input.

    // General Loadout Information
    this.loadoutName = 'Flexible'; // Name of the applied loadout configuration (e.g., "Flexible", "Vaal Hazak Support", "Custom Bow Build").
    // If a RoleLoadout is chosen, this would be its name. If modified, becomes "Custom Loadout".
    this.loadoutDescription =
      'Any skills and equipment are permitted for this slot.'; // Description of the current loadout configuration.

    // Hunter Tab Fields
    this.roles = ['Any']; // Array of selected roles (e.g., ['DPS', 'TANK'], or ['Any'] as default for Flexible). From "checkboxes for each role, multiple selection".
    this.weaponTypes = ['Any']; // Array of selected weapon types (e.g., ['Sword', 'Bow'], or ['Any'] as default for Flexible). From "also multiple selection have Any as weapon".
    this.elementsAilments = []; // Array of selected elements or ailments (e.g., ['Fire', 'Poison', 'KO']). From "alsi multiple selection, is enabled after selection weapon type".

    // Skills Tab Fields
    this.skills = []; // Array of skill objects, where each object contains skill name and level.
    // e.g., [{ skillName: 'Attack Boost', skillLevel: 7 }, { skillName: 'Health Boost', skillLevel: 3 }]
    // From "Skills on the left... You will also be able to select the skill level".

    // Strategy Tab Fields (as per "Ideas 1")
    this.monsterPartFocus = []; // Array of preferred monster parts to target (e.g., ['Head', 'Tail']). From "part focus dropdown".
    // Also corresponds to "Monster Part focus preference" from "Role Loadout Fields".

    // Role-Specific Notes (from "Role Loadout Fields")
    this.roleNotes = ''; // "Notes - More details about the role - text field. Something specific for that position".

    // Initialize for 'Flexible' state (most fields are already at their 'Flexible' defaults)
    if (this.configurationType === 'Flexible') {
      // This is the default state.
    }
  }

  // --- Placeholder for Methods ---
  // Methods would be added here to:
  // - Update individual fields (e.g., setRoles, addSkill, setStrategyNote).
  // - Handle the logic for changing configurationType (e.g., when a 'Flexible' or 'RoleLoadout' slot is modified,
  //   it might become 'Custom', and 'loadoutName' might change to "Custom Loadout").
  // - Load data from predefined role loadouts.
  //
  // applyPredefinedLoadout(predefinedLoadout) {
  //     this.configurationType = 'RoleLoadout';
  //     this.loadoutName = predefinedLoadout.name;
  //     this.loadoutDescription = predefinedLoadout.description;
  //     this.roles = [...predefinedLoadout.roles];
  //     this.weaponTypes = [...predefinedLoadout.weaponTypes];
  //     this.elementsAilments = [...predefinedLoadout.elementsAilments];
  //     this.skills = [...predefinedLoadout.skills]; // Assuming skills are {name, level}
  //     this.monsterPartFocus = [...predefinedLoadout.monsterPartFocusPreference];
  //     this.roleNotes = predefinedLoadout.notes;
  //     // StrategyNote might be separate or part of the predefined loadout's notes
  // }
}

new PlayerComp();
