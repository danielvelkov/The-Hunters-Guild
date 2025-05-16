import { skillsList, weaponAttributesList, weaponTypesList } from './create.js';
import { guidGenerator } from '../common.js';

class PlayerComp {
  nextSkillIndex = 0;

  constructor(playerSlots = []) {
    this.playerSlots = playerSlots;
    this.cacheDOM();
    this.bindEvents();
    this.addSlot(
      new Slot({
        displayName: 'Custom Slot #' + guidGenerator().substring(0, 4),
        isOwner: true,
      })
    );
    this.render();
  }

  cacheDOM() {
    this.playerSlotsList = $('.player-slots-list').accordion({
      autoHeight: false,
      collapsible: true,
      header: '> h3:not(.ignore)', // stick accordion items to direct h3 children with no .ignore class
    });
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

    this.playerSlotsList.on('click', '.remove-button', (event) => {
      event.stopPropagation();
      const slotIndex = $(event.target).closest('h3').index() / 2;
      this.removeSlot(this.playerSlots[slotIndex]);
    });

    this.playerSlotsList.on('click', 'h3', (event) => {
      // ok thats kinda cool
      // index() shows which index the h3 is
      // but because each h3 has a div for accordion content
      // we divide by 2
      const slotIndex = $(event.target).index() / 2;
      this.setSelectedSlot(this.playerSlots[slotIndex]);
    });
  }

  get isSlotAvailable() {
    return this.playerSlots.length < 4;
  }

  addSlot(slot) {
    this.playerSlots.push(slot);
    this.render();
  }

  removeSlot(slot) {
    const index = this.playerSlots.indexOf(slot);
    if (index === -1) return;

    // Select prev slot if the removed one was selected
    if (this.selectedSlot === slot) {
      const newSelectedIndex = Math.max(0, index - 1);
      if (this.playerSlots.length > 1) {
        this.setSelectedSlot(this.playerSlots[newSelectedIndex]);
      } else {
        this.selectedSlot = null;
      }
    }

    this.playerSlots.splice(index, 1);
    this.render();
  }

  setSelectedSlot(slot) {
    this.selectedSlot = slot;
    this.createSlotConfigElement(slot);
    console.log('selected slot', this.playerSlots.indexOf(slot));
  }

  // Complete rendering of all slots
  render() {
    this.playerSlotsList.empty();

    this.playerSlots.forEach((slot) => {
      const [slotAccordionHeader, slotAccordionContent] =
        this.createSlotElementAccordion(slot);
      this.playerSlotsList.append(slotAccordionHeader, slotAccordionContent);
    });

    // Add "add slot" button if slots are available
    if (this.isSlotAvailable) {
      this.playerSlotsList.append(this.addSlotTemplate.clone(true));
    }

    this.playerSlotsList.accordion('refresh');

    // If no slot is selected, select the first one
    if (!this.selectedSlot) {
      this.setSelectedSlot(this.playerSlots[0]);
    }
  }

  createSlotElementAccordion(slot) {
    let title = $('<h3>').css('position', 'relative').text(slot.displayName);

    // Add remove button if not the owner slot
    if (!slot.isOwner) {
      let removeButtonElement = $('<button>')
        .text('X')
        .addClass('remove-button');
      title.prepend(removeButtonElement);
    }

    // Create slot content
    let slotElement = $('<div>').addClass('player-slot');
    let slotContainer = this.slotTemplate.clone(true);
    slotElement.append(slotContainer);

    // Update slot display with current data
    console.log('Creating slot element', slot.skills);
    this.updateSlotDisplay(slotContainer, slot);

    return [title, slotElement];
  }

  createSlotConfigElement(slot) {
    if (!slot) return;

    this.configureSlotSection.find('.config-tabs').remove();

    const tabs = this.slotConfigFormTemplate.clone(true);

    this.configureSlotSection.append(tabs);

    // Initialize jQuery UI tabs
    tabs.tabs();

    const advancedTabForm = tabs.find('.advanced-form');

    // Initialize selects with current values
    this.initializeFormControls(advancedTabForm, slot);

    // Add event listeners for form changes
    this.bindFormEvents(advancedTabForm, slot);
  }

  initializeFormControls(form, slot) {
    // Initialize weapon types select
    const weaponTypesSelect = form.find('select[name="weapon-types[]"]');
    initializeSelect(weaponTypesSelect, '-- Choose a weapon --', (item) =>
      formatOption(item, 'weaponIcon', 'Weapon Types')
    );

    // Select current weapon types
    if (slot.weaponTypes && slot.weaponTypes[0] !== 'ANY') {
      weaponTypesSelect.val(slot.weaponTypes).trigger('change');
    }

    // Initialize weapon attributes select
    const weaponAttributesSelect = form.find(
      'select[name="weapon-attributes[]"]'
    );
    initializeSelect(
      weaponAttributesSelect,
      '-- Choose an attribute --',
      (item) => formatOption(item, 'attrIcon', 'Status Icons')
    );

    // Select current weapon attributes
    if (slot.weaponAttributes && slot.weaponAttributes[0] !== 'ANY') {
      weaponAttributesSelect.val(slot.weaponAttributes).trigger('change');
    }

    // Initialize roles select
    const rolesSelect = form.find('select[name="roles[]"]');
    initializeSelect(rolesSelect, '-- Choose a role --', (item) => item.text);

    // Select current roles
    if (slot.roles && slot.roles[0] !== 'ANY') {
      rolesSelect.val(slot.roles).trigger('change');
    }

    // Set notes
    form.find('textarea[name="notes"]').val(slot.roleNotes || '');

    // Initialize skills
    if (slot.skills && slot.skills.length && slot.skills[0] !== 'ANY') {
      slot.skills.forEach((skill) => {
        this.addSkillSelectElement(form, skill);
      });
    }

    // Add skill button
    form.find('.add-skill-button').on('click', () => {
      this.addSkillSelectElement(form);
    });
  }

  bindFormEvents(form, slot) {
    // Store slot's initial index for later reference
    const initialIndex = this.playerSlots.indexOf(slot);
    if (initialIndex === -1) {
      console.log('Slot not found');
      return; // Slot not found in array
    }

    // Handle form changes
    form.off('change').on('change', () => {
      const formData = new FormData(form[0]);

      // Always use the current slot from the array instead of the closure reference
      const currentSlot = this.playerSlots[initialIndex];
      console.log('Current slot skills', currentSlot.skills); // only skills gone, everything
      const updatedSlot = processFormData(formData, currentSlot);
      console.log('updated ', updatedSlot.skills); // skills gone

      // Update the slot in the array
      this.playerSlots[initialIndex] = updatedSlot;

      // Update the slot display
      const slotContainer = this.playerSlotsList
        .find(`.player-slot:eq(${initialIndex})`)
        .find('.hunter-slot');

      this.updateSlotDisplay(slotContainer, updatedSlot);

      // Update the header text
      this.playerSlotsList
        .find(`h3:eq(${initialIndex})`)
        .contents()
        .last()
        .replaceWith(document.createTextNode(updatedSlot.displayName));
    });
  }

  addSkillSelectElement(container, existingSkill = null) {
    const skillElement = this.skillSelectTemplate.clone(true);
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

    // When skill is selected, populate level options
    skillSelect.on('select2:select', function (e) {
      const data = e.params.data;
      if (!data.id) return;

      const skillMaxLevel = data.element.dataset.skillMaxLevel;
      levelSelect.empty();
      console.log({ skillMaxLevel });

      if (skillMaxLevel) {
        console.log('adding skill level');
        levelSelect.prop('disabled', false);
        [...new Array(+skillMaxLevel)].forEach((_, i) => {
          levelSelect.append(`<option value="${i + 1}">${i + 1}</option>`);
        });

        // Default to level 1
        levelSelect.val(1).trigger('change');
      }
    });

    // When skill is cleared
    skillSelect.on('select2:clear', function () {
      levelSelect.empty();
      levelSelect.prop('disabled', true);
    });

    // Set existing skill if provided
    if (existingSkill) {
      console.log('Existing skill', existingSkill);
      skillSelect.val(existingSkill.id).trigger('change');

      // Need to wait for the levels to be populated
      setTimeout(() => {
        levelSelect.val(+existingSkill.min_level).trigger('change');
      }, 100);
    }

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
    console.log('render Skills', slotData.skills);
    if (slotData.skills?.length && slotData.skills[0] !== 'ANY') {
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
    if (
      slotData.monsterPartFocus?.length &&
      slotData.monsterPartFocus[0] !== 'ANY'
    ) {
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

function processFormData(formData, originalSlot) {
  // Create a new slot object based on the original // this makes every field other than skills work
  const slotData = new Slot({
    displayName: originalSlot.displayName,
    isOwner: originalSlot.isOwner,
    configurationType: 'Advanced',
    loadoutName: 'Custom Loadout',
    loadoutDescription: 'This loadout has specific requirements for joining.',
    roles: [],
    weaponTypes: [],
    weaponAttributes: [],
    skills: originalSlot.skills || ['ANY'],
    monsterPartFocus: originalSlot.monsterPartFocus || ['ANY'],
    roleNotes: '',
  });

  // Process form data entries
  for (const [key, value] of formData.entries()) {
    // Skip empty values
    if (!value) continue;

    // Process roles
    if (key === 'roles[]') {
      if (!slotData.roles.includes(value)) slotData.roles.push(value);
    }
    // Process weapon types
    else if (key === 'weapon-types[]') {
      if (!slotData.weaponTypes.includes(value))
        slotData.weaponTypes.push(value);
    }
    // Process weapon attributes
    else if (key === 'weapon-attributes[]') {
      if (!slotData.weaponAttributes.includes(value))
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
  if (slotData.roles.length === 0) slotData.roles = ['ANY'];
  else if (slotData.roles.length > 1 && slotData.roles[0] === 'ANY')
    slotData.roles.shift();

  if (slotData.weaponTypes.length === 0) slotData.weaponTypes = ['ANY'];
  else if (slotData.weaponTypes.length > 1 && slotData.weaponTypes[0] === 'ANY')
    slotData.weaponTypes.shift();

  if (slotData.weaponAttributes.length === 0)
    slotData.weaponAttributes = ['ANY'];
  else if (
    slotData.weaponAttributes.length > 1 &&
    slotData.weaponAttributes[0] === 'ANY'
  )
    slotData.weaponAttributes.shift();

  if (slotData.skills.length === 0) slotData.skills = ['ANY'];
  else if (slotData.skills.length > 1 && slotData.skills[0] === 'ANY')
    slotData.skills.shift();

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
}

// Initialize the component
$(document).ready(() => {
  new PlayerComp();
});
