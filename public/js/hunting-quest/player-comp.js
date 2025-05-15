import { skillsList, weaponAttributesList, weaponTypesList } from './create.js';
import { guidGenerator } from '../common.js';

class PlayerComp {
  nextSkillIndex = 0;

  constructor(playerSlots = []) {
    this.playerSlots = createObservableArray(playerSlots, () =>
      this.handlePlayerSlotsChange()
    );
    this.cacheDOM();
    this.bindEvents();
    this.addSlot(
      new Slot({
        displayName: 'Custom Slot #' + guidGenerator().substring(0, 4),
        isOwner: true,
      })
    );
    this.setSelectedSlot(this.playerSlots[0]);
  }

  cacheDOM() {
    this.playerSlotsList = $('.player-slots-list');
    this.configureSlotSection = $('#configure-slot');

    this.addSlotTemplate = $(
      document
        .getElementById('add-player-slot-template')
        .content.cloneNode(true)
    ).find('.player-slot.open-slot');

    this.slotConfigFormTemplate = $(
      document
        .getElementById('player-configure-form-template')
        .content.cloneNode(true)
    ).find('.config-tabs');

    this.skillSelectTemplate = $(
      document.getElementById('skill-template').content
    )
      .clone(true)
      .find('.skill');

    this.slotTemplate = $(
      document.getElementById('hunter-slot-template').content
    )
      .clone(true)
      .find('.hunter-slot');
  }

  bindEvents() {
    this.addSlotTemplate.on('click', () => {
      this.addSlot(
        new Slot({
          displayName: 'Custom Slot #' + guidGenerator().substring(0, 4),
          isOwner: false,
        })
      );
    });
  }

  handlePlayerSlotsChange() {
    console.log('Slot changed');
    this.displaySlots();
  }

  get isSlotAvailable() {
    return this.playerSlots.length < 4;
  }

  addSlot(slot) {
    this.playerSlots.push(slot);
  }

  removeSlot(slot) {
    if (this.selectedSlot === slot) this.setSelectedSlot(this.playerSlots[0]);
    this.playerSlots.splice(this.playerSlots.indexOf(slot), 1);
  }

  setSelectedSlot(slot) {
    this.selectedSlot = slot;
    console.log('Selected slot: ' + slot.displayName);
    this.createSlotConfigElement(slot);
  }

  displaySlots() {
    this.playerSlotsList.empty();
    this.playerSlots.forEach((playerSlot) => {
      this.playerSlotsList.append(this.createSlotElement(playerSlot));
    });

    if (this.isSlotAvailable)
      this.playerSlotsList.append(this.addSlotTemplate.clone(true, true));
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

    let slotContainer = this.slotTemplate.clone(true, true);

    slotElement.append(slotContainer);
    this.updateSlotDisplay(slotContainer, slot);
    if (!slot.isOwner) slotElement.prepend(removeButtonElement);
    return slotElement;
  }

  createSlotConfigElement(slot) {
    this.configureSlotSection.find('.config-tabs').remove();

    const tabs = this.slotConfigFormTemplate.clone(true, true);

    this.configureSlotSection.append(tabs);
    const advancedTabForm = tabs.find('.advanced-form');

    tabs.tabs();

    initializeSelect(
      advancedTabForm.find('select[name="weapon-types[]"]'),
      '-- Choose a weapon --',
      (item) => formatOption(item, 'weaponIcon', 'Weapon Types')
    );

    initializeSelect(
      advancedTabForm.find('select[name="weapon-attributes[]"]'),
      '-- Choose an attribute --',
      (item) => formatOption(item, 'attrIcon', 'Status Icons')
    );

    initializeSelect(
      advancedTabForm.find('select[name="roles[]"]'),
      '-- Choose a role --',
      (item) => item.text
    );

    advancedTabForm
      .find('.add-skill-button')
      .on('click', () => this.addSkillSelectElement(advancedTabForm));

    advancedTabForm.on('change', (event) => {
      // Update Quest Preview
      // console.log(new FormData(advancedTabForm[0]));
      // console.log(processFormData(new FormData(advancedTabForm[0])));
      const updatedSlot = processFormData(new FormData(advancedTabForm[0]));
      this.playerSlots[this.playerSlots.indexOf(slot)] = updatedSlot;
      slot = updatedSlot;
    });
  }

  addSkillSelectElement(container) {
    const skillElement = this.skillSelectTemplate.clone(true, true);
    const skillFormGroup = $('<div>').addClass('skill-form-group');

    const skillSelect = skillElement.find('select[class="skill-dropdown"]');
    const levelSelect = skillElement.find('select[class="skill-level"]');
    const removeButton = skillElement.find('.remove-skill-button');

    skillElement.appendTo(skillFormGroup);
    container.append(skillFormGroup);

    // Set name attributes for form submission
    skillFormGroup.attr('data-skill-index', this.nextSkillIndex);
    skillSelect.attr('name', 'skill-select-' + this.nextSkillIndex);
    levelSelect.attr('name', 'skill-level-' + this.nextSkillIndex);

    this.nextSkillIndex++;

    initializeSelect(skillSelect, '-- Choose a skill --', (item) =>
      formatOption(item, 'skillIcon', 'Skill Icons')
    );

    skillSelect.on('select2:clear', function () {
      levelSelect.empty();
      levelSelect.prop('disabled', true);
    });

    // When skill is selected, populate level options
    skillSelect.on('select2:select', function (e) {
      const data = e.params.data;
      if (!data.id) {
        return;
      }

      const skillMaxLevel = data.element.dataset.skillMaxLevel;

      levelSelect.empty();

      if (skillMaxLevel) {
        levelSelect.prop('disabled', false);
        [...new Array(+skillMaxLevel)].forEach((_, i) => {
          levelSelect.append(`<option value="${i + 1}">${i + 1}</option>`);
        });

        // Default to level 1
        levelSelect.val(1).trigger('change');
      }
    });

    // Remove button handler
    removeButton.on('click', () => {
      skillFormGroup.remove();
      container.trigger('change');
    });
  }

  updateSlotDisplay(slotContainer, slotData) {
    // Basic slot info
    slotContainer
      .find('.slot-display-name')
      .text(slotData.displayName || 'Hunter Slot');
    slotContainer
      .find('.slot-config-type')
      .text(slotData.configurationType + ' Configuration');

    // Show/hide owner badge
    const ownerBadge = slotContainer.find('.slot-owner');
    ownerBadge.css('display', slotData.isOwner ? 'inline-block' : 'none');

    // Loadout info
    slotContainer
      .find('.loadout-name')
      .text(slotData.loadoutName || 'Custom Loadout');
    slotContainer
      .find('.loadout-description')
      .text(slotData.loadoutDescription || 'Custom hunter configuration.');

    // Roles
    const rolesList = slotContainer.find('.roles-list');
    rolesList.empty();
    if (slotData.roles?.length && slotData.roles[0] !== 'ANY') {
      slotData.roles.forEach((role) => {
        $('<li>')
          .addClass(`role-tag role-${role}`)
          .text(role)
          .appendTo(rolesList);
      });
    } else {
      rolesList.html('<li class="empty-message">Any role</li>');
    }

    // Weapons
    const weaponList = slotContainer.find('.weapon-list');
    weaponList.empty();
    if (slotData.weaponTypes?.length && slotData.weaponTypes[0] !== 'ANY') {
      slotData.weaponTypes.forEach((weapon) => {
        const weaponType = getWeaponType(weapon);
        if (weaponType) {
          $('<li>')
            .addClass('weapon-tag')
            .html(
              `<img src="icons/Weapon Types/${weaponType.name.replaceAll(
                ' ',
                '_'
              )}.png" alt="${weaponType.name}" class="weapon-icon">
                  <span>${weaponType.name}</span>`
            )
            .appendTo(weaponList);
        } else {
          $('<li>')
            .addClass('weapon-tag')
            .html(`<span>${weapon}</span>`)
            .appendTo(weaponList);
        }
      });
    } else {
      weaponList.html('<li class="empty-message">Any weapon type</li>');
    }

    // Attributes
    const attributeList = slotContainer.find('.attribute-list');
    attributeList.empty();
    if (
      slotData.weaponAttributes?.length &&
      slotData.weaponAttributes[0] !== 'ANY'
    ) {
      slotData.weaponAttributes.forEach((attr) => {
        const weaponAttr = getWeaponAttribute(attr);
        $('<li>')
          .addClass('attribute-tag')
          .html(
            `<img src="icons/Status Icons/${weaponAttr.icon}.png" alt="${weaponAttr.name}" class="attribute-icon">
                  <span>${weaponAttr.name}</span>`
          )
          .appendTo(attributeList);
      });
    } else {
      attributeList.html('<li class="empty-message">Any element/status</li>');
    }

    // Skills
    const skillsList = slotContainer.find('.skills-list');
    skillsList.empty();
    if (slotData.skills?.length) {
      slotData.skills.forEach((skill) => {
        const skillItem = $('<li>').addClass('skill-item');
        const skillInfo = getSkillInfo(skill.id);
        if (skillInfo) {
          const iconSrc = skillInfo?.icon + '.png' || 'SKILL_0000.png';
          const maxLevel = skillInfo?.max_level || 7;

          const skillNameEl = $('<div>').addClass('skill-name')
            .html(`<img src="icons/Skill Icons/${iconSrc}" alt="${skillInfo.name}" class="skill-icon">
                  <span>${skillInfo.name}</span>`);

          const skillLevelEl = $('<div>').addClass('skill-level');
          for (let i = 0; i < maxLevel; i++) {
            $('<div>')
              .addClass(
                i < skill.min_level
                  ? 'level-circle'
                  : 'level-circle level-empty'
              )
              .appendTo(skillLevelEl);
          }

          skillItem.append(skillNameEl, skillLevelEl).appendTo(skillsList);
        } else skillItem.append('Any Skill').appendTo(skillsList);
      });
    } else {
      skillsList.html(
        '<li class="empty-message">No specific skills required</li>'
      );
    }

    // Monster part focus
    const partFocusList = slotContainer.find('.part-focus-list');
    partFocusList.empty();
    if (slotData.monsterPartFocus?.length) {
      slotData.monsterPartFocus.forEach((part) => {
        $('<li>').addClass('part-focus-tag').text(part).appendTo(partFocusList);
      });
    } else {
      partFocusList.html(
        '<li class="empty-message">No specific part focus required</li>'
      );
    }

    // Notes
    slotContainer
      .find('.notes-content')
      .text(slotData.roleNotes || 'No additional notes for this slot.');
  }
}

function initializeSelect(selectElement, placeholder, formatFunction) {
  return selectElement.select2({
    placeholder: placeholder,
    allowClear: true,
    templateResult: formatFunction,
  });
}

function formatOption(item, iconType, folderName) {
  return $(`<span class='monster-select-content'>
      <span class='monster-select-name'>
        ${
          item.element?.dataset[iconType]
            ? `<img height='18' src="icons/${folderName}/${item.element?.dataset[iconType]}.png"/>`
            : ''
        }
        <b>${
          item.text.trim().charAt(0).toUpperCase() +
          item.text.trim().substring(1).toLowerCase()
        }</b>
      </span>
    </span>`);
}

function processFormData(formData) {
  const slotData = new Slot({
    displayName: 'Custom Slot #1',
    isOwner: true,
    configurationType: 'Advanced',
    loadoutName: 'Custom Loadout',
    loadoutDescription: 'This loadout has specific requirements for joining.',
    roles: [],
    weaponTypes: [],
    weaponAttributes: [],
    skills: [],
    monsterPartFocus: [],
    roleNotes: '',
  });

  // Process form data entries
  for (const [key, value] of formData.entries()) {
    // Process roles
    if (key === 'roles[]') {
      slotData.roles.push(value);
    }
    // Process weapon types
    else if (key === 'weapon-types[]') {
      slotData.weaponTypes.push(value);
    }
    // Process weapon attributes
    else if (key === 'weapon-attributes[]') {
      slotData.weaponAttributes.push(value);
    }
    // Process notes
    else if (key === 'notes') {
      slotData.roleNotes = value;
    }
    // Process skills
    else if (key.startsWith('skill-select-')) {
      const skillIndex = key.split('-').pop();
      const levelKey = `skill-level-${skillIndex}`;
      const levelValue = formData.get(levelKey);

      if (value && levelValue) {
        if (!slotData.skills.find((s) => s.id === value))
          slotData.skills.push({
            id: value,
            min_level: parseInt(levelValue, 10),
          });
      }
    }
  }

  // // If no specific selections were made, set to ANY
  // if (slotData.roles.length === 0) slotData.roles = ['ANY'];
  // if (slotData.weaponTypes.length === 0) slotData.weaponTypes = ['ANY'];
  // if (slotData.weaponAttributes.length === 0)
  //   slotData.weaponAttributes = ['ANY'];
  // if (slotData.skills.length === 0) slotData.skills = ['ANY'];

  // Set configuration type based on selections
  if (
    (slotData.weaponTypes.length > 0 && slotData.weaponTypes[0] !== 'ANY') ||
    (slotData.weaponAttributes.length > 0 &&
      slotData.weaponAttributes[0] !== 'ANY') ||
    (slotData.skills.length > 0 && slotData.skills[0] !== 'ANY') ||
    (slotData.roles.length > 0 && slotData.roles[0] !== 'ANY')
  ) {
    slotData.configurationType = 'Advanced';
    slotData.loadoutName = 'Custom Loadout';
    slotData.loadoutDescription =
      'This loadout has specific requirements for joining.';
  } else {
    slotData.configurationType = 'Flexible';
    slotData.loadoutName = 'Flexible Loadout';
    slotData.loadoutDescription =
      'Any skills and equipment are permitted for this slot.';
  }

  return slotData;
}

const getSkillInfo = (id) => skillsList.find((s) => s.id === id);
const getWeaponType = (id) => weaponTypesList.find((w) => w.id === id);
const getWeaponAttribute = (id) =>
  weaponAttributesList.find((w) => w.id === id);

class Slot {
  /**
   * @param {string} displayName - The display name for this slot (e.g., "Player 1", "Newbie Hunter").
   * @param {boolean} [isOwner=false] - Flag indicating if this slot is for the quest owner.
   * @param {boolean} canEdit - Flag indicating if this slot can be edited.
   */
  constructor({
    displayName,
    isOwner = false,
    loadoutName = 'Custom Loadout',
    loadoutDescription = 'Any skills and equipment are permitted for this slot.',
    roles = ['ANY'],
    weaponTypes = ['ANY'],
    weaponAttributes = ['ANY'],
    skills = ['ANY'],
    monsterPartFocus = ['ANY'],
    roleNotes = '',
  }) {
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

    // General Loadout Information
    this.loadoutName = loadoutName; // Name of the applied loadout configuration (e.g., "Flexible", "Vaal Hazak Support", "Custom Bow Build").
    // If a RoleLoadout is chosen, this would be its name. If modified, becomes "Custom Loadout".
    this.loadoutDescription = loadoutDescription; // Description of the current loadout configuration.

    this.roles = roles; // Array of selected roles (e.g., ['DPS', 'TANK'], or ['Any'] as default for Flexible). From "checkboxes for each role, multiple selection".
    this.weaponTypes = weaponTypes; // Array of selected weapon types (e.g., ['Sword', 'Bow'], or ['Any'] as default for Flexible).
    this.weaponAttributes = weaponAttributes; // Array of selected elements or ailments (e.g., ['Fire', 'Poison', 'KO']).

    this.skills = skills; // Array of skill objects, where each object contains skill name and level.
    // e.g., [{ skillName: 'Attack Boost', skillLevel: 7 }, { skillName: 'Health Boost', skillLevel: 3 }]

    this.monsterPartFocus = monsterPartFocus; // Array of preferred monster parts to target (e.g., ['Head', 'Tail']). From "part focus dropdown".
    // Also corresponds to "Monster Part focus preference" from "Role Loadout Fields".

    this.roleNotes = roleNotes; // "Notes - More details about the role - text field. Something specific for that position".

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
