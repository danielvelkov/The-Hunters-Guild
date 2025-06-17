import {
  skillsList,
  weaponAttributesList,
  weaponTypesList,
  systemLoadoutsList,
} from '../create.js';
import createPageMediator from 'js/common/mediator';
import 'css/components/hunter-slot.css';
import 'css/components/player-comp.css';

import Slot, { SlotConfigType } from 'entities/Slot.js';
import {
  QUEST_PLAYER_SLOTS_CHANGE,
  SELECTED_MONSTERS_CHANGE,
} from 'js/common/events.js';
import { Loadout, LoadoutRole, LoadoutSkill } from 'entities/Loadout.js';
import {
  chooseEmoteBasedOnPart,
  findClassEnumStaticPropInstance,
} from 'js/common/util.js';
import WeaponType from 'entities/game-data/WeaponType.js';
import WeaponAttribute from 'entities/game-data/WeaponAttribute.js';

class PlayerComp {
  nextSkillIndex = 0;
  nextSlotIndex = 1;
  activeConfigTabIndex = 0;
  _playerSlots = [];
  _selectedMonsters = [];

  constructor(playerSlots = []) {
    this.cacheDOM();
    this.bindEvents();
    this._playerSlots =
      playerSlots.length > 1
        ? playerSlots
        : [
            // Owner
            new Slot({
              displayName: 'Host',
              isOwner: true,
              loadout: new Loadout(),
            }),
            // // Guest
            new Slot({
              displayName: 'Custom Slot #' + this.nextSlotIndex++,
              isOwner: false,
              loadout: new Loadout(),
            }),
          ];
    this.setSelectedSlot(this.playerSlots[0]);

    createPageMediator.on(SELECTED_MONSTERS_CHANGE, (monsters) => {
      this.selectedMonsters = monsters;
    });
  }

  cacheDOM() {
    $('.player-slots-list').attr('aria-label', 'player slot list').accordion({
      animate: false,
      header: '> h3:not(.ignore)', // stick accordion items to direct h3 children with no .ignore class
    });

    this.addPlayerSlotTemplate = $(
      document
        .getElementById('add-player-slot-template')
        .content.cloneNode(true)
    ).find('.player-slot.open-slot');
  }

  bindEvents() {
    $('.player-slots-list').on('click', 'button#add-player', () => {
      this.addSlot(
        new Slot({
          displayName: 'Custom Slot #' + this.nextSlotIndex++,
          isOwner: false,
          loadout: new Loadout(),
        })
      );
    });

    $('.player-slots-list').on('click', '.remove-button', (event) => {
      event.stopPropagation();
      const slotIndex = $(event.target).closest('h3').index() / 2;
      this.removeSlot(this.playerSlots[slotIndex]);
    });

    $('.player-slots-list').on('click', 'h3.accordion-title', (event) => {
      const slotIndex = $(event.target).index() / 2;
      this.setSelectedSlot(this.playerSlots[slotIndex]);
    });
  }

  get selectedMonsters() {
    return [...this._selectedMonsters];
  }

  set selectedMonsters(values) {
    this._selectedMonsters = values;
    this.updateSlotConfigTabs(this.selectedSlot);
    this.playerSlots.forEach((s, i) => {
      s.monsterPartFocus = s.monsterPartFocus.filter(({ monster }) =>
        values.map((m) => m.name).includes(monster)
      );
      this.updateSlot(s, i);
    });
  }

  get isSlotAvailable() {
    return this.playerSlots.length < 4;
  }

  get playerSlots() {
    return [...this._playerSlots];
  }

  set playerSlots(values) {
    if (!Array.isArray(values)) {
      console.warn('Invalid slots. Must be array.');
      return;
    }

    const validSlots = values.filter((slot) => slot instanceof Slot);

    if (validSlots.length !== values.length) {
      console.warn('Some invalid slots filtered out.');
    }
    this._playerSlots = values;
    this.render();
    createPageMediator.trigger(QUEST_PLAYER_SLOTS_CHANGE, this.playerSlots);
  }

  addSlot(slot) {
    this.playerSlots = [...this.playerSlots, slot];
  }

  removeSlot(slot) {
    const index = this.playerSlots.indexOf(slot);
    if (index === -1) return;

    // Select prev slot if the removed one was selected
    if (this.selectedSlot.id === slot.id) {
      const newSelectedIndex = Math.max(0, index - 1);
      this.selectedSlot = this.playerSlots[newSelectedIndex];
    }

    this.playerSlots = this.playerSlots.filter((_, i) => i !== index);
  }

  updateSlot(newSlot, index) {
    this.playerSlots = this.playerSlots.map((slot, i) =>
      i === index ? Object.assign(slot, newSlot) : slot
    );
  }

  setSelectedSlot(slot) {
    this.selectedSlot = slot;
    this.render();
  }

  getIndexOfSelectedSlot() {
    return Math.max(0, this.playerSlots.indexOf(this.selectedSlot));
  }

  getHunterSlotContainer(index) {
    return $('.player-slots-list').find(
      `> h3:eq(${index}) + .player-slot > .hunter-slot`
    );
  }

  // Complete rendering of all slots
  render() {
    const playerSlotList = $('.player-slots-list');

    playerSlotList.empty();

    this.playerSlots.forEach((slot) => {
      const [slotAccordionHeader, slotAccordionContent] =
        this.createSlotElementAccordion(slot);
      playerSlotList.append(slotAccordionHeader, slotAccordionContent);
    });

    // Add "add slot" button if slots are available
    if (this.isSlotAvailable) {
      playerSlotList.append(this.addPlayerSlotTemplate.clone(true));
    }

    playerSlotList.accordion('refresh');

    // If no slot is selected, select the first one
    if (this.playerSlots.length > 0 && !this.selectedSlot) {
      this.setSelectedSlot(this.playerSlots[0]);
    }

    playerSlotList.accordion('option', 'active', this.getIndexOfSelectedSlot());
    this.updateSlotConfigTabs(this.selectedSlot);
  }

  createSlotElementAccordion(slot) {
    let title = $('<h3>')
      .addClass('accordion-title')
      .addClass(slot === this.selectedSlot ? 'selected-slot' : '')
      .css('position', 'relative')
      .css('display', 'flex')
      .css('align-items', 'center')
      .css('justify-content', 'space-between')
      .css('flex-wrap', 'wrap')
      .attr('aria-label', 'accordion tab heading');

    title.append(
      $('<span>').text(slot.displayName).css('margin-right', 'auto')
    );
    const headerSlotDetailsSummary = $('<div>')
      .css('position', 'relative')
      .css('display', 'flex')
      .css('align-items', 'center')
      .css('gap', '1px')
      .css('color', 'white')
      .css('margin-right', '30px');

    headerSlotDetailsSummary.append(
      slot.loadout.weapon_types.map(
        (weaponType) =>
          `<img src="icons/Weapon Types/${weaponType.name.replaceAll(
            ' ',
            '_'
          )}.png" alt="${weaponType.name}" class="weapon-icon">`
      )
    );

    headerSlotDetailsSummary.append(
      slot.loadout.weapon_attr.map(
        (weaponAttr) =>
          `<img src="icons/Status Icons/${weaponAttr.icon}.png" alt="${weaponAttr.name}" class="attribute-icon">`
      )
    );

    headerSlotDetailsSummary.append(
      slot.loadout.roles.map((r) =>
        $('<span>').addClass('role-tag').addClass(`role-${r.name}`).text(r.name)
      )
    );

    title.append(headerSlotDetailsSummary);

    // Add remove button if not the owner slot
    if (!slot.isOwner) {
      let removeButtonElement = $('<button>')
        .text('X')
        .addClass('remove-button');
      title.prepend(removeButtonElement);
    }

    // Create slot content
    let slotElement = $('<div>').addClass('player-slot').attr('role', 'tab');
    let slotContainer = $(
      document.getElementById('hunter-slot-template').content.cloneNode(true)
    ).find('.hunter-slot');
    slotElement.append(slotContainer);

    // Update slot display with current data
    this.updateSlotDisplay(slotContainer, slot);

    return [title, slotElement];
  }

  updateSlotConfigTabs(slot) {
    const tabs = $('#configure-slot').find('.config-tabs');
    if (tabs.length === 0) this.createSlotConfigTabs(slot);
    else {
      const customTabForm = tabs.find('.custom-tab-form');
      customTabForm.off('change');
      this.initializeCustomTabFormControls(customTabForm, slot);
      this.bindCustomTabFormEvents(customTabForm);
    }
  }

  createSlotConfigTabs(slot) {
    if (!slot) return;

    const tabs = $(
      document
        .getElementById('player-configure-form-template')
        .content.cloneNode(true)
    ).find('.config-tabs');

    $('#configure-slot').append(tabs);

    tabs
      .tabs({
        active: +this.activeConfigTabIndex,
        activate: (_, ui) => {
          this.activeConfigTabIndex = ui.newTab.index();
        },
      })
      .attr('role', 'tablist')
      .attr('aria-label', 'slot config tabs');

    // Get tab references
    const loadoutsTab = tabs.find('#tabs-loadouts');
    const customTabForm = tabs.find('.custom-tab-form');

    this.initializeLoadoutsTab(loadoutsTab);
    this.initializeCustomTabFormControls(customTabForm, slot);
    this.bindCustomTabFormEvents(customTabForm, slot);
  }

  initializeLoadoutsTab(container) {
    const loadoutsList = container.find('.loadouts-list');
    const searchBar = container.find('.loadouts-search');

    const pillButtons = container.find('.pill-button');
    pillButtons.on('click', (e) => {
      const role = $(e.target).text().trim();
      this.updateLoadoutsDisplay(loadoutsList, { role });
    });

    let searchValue = '';
    let searchTimer;

    searchBar.on('input', (e) => {
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        searchValue = e.target.value;
        this.updateLoadoutsDisplay(loadoutsList, { name: searchValue });
      }, 500);
    });

    this.updateLoadoutsDisplay(loadoutsList);
  }

  initializeCustomTabFormControls(form, slot) {
    // Set name
    form.find('input[name="name"]').val(slot.loadout.name || '');

    // Set description
    form
      .find('textarea[name="description"]')
      .val(slot.loadout.description || '');

    // Initialize weapon types select
    const weaponTypesSelect = form.find('select[name="weapon-types[]"]');
    initializeSelect(weaponTypesSelect, '-- Choose a weapon --', (item) =>
      formatOption(item, 'weaponIcon', 'Weapon Types')
    );

    // Select current weapon types
    if (slot.loadout.weapon_types.length) {
      weaponTypesSelect
        .val(slot.loadout.weapon_types.map((wp) => wp.id))
        .trigger('change');
    } else weaponTypesSelect.val(null).trigger('change');

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
    if (slot.loadout.weapon_attr.length) {
      weaponAttributesSelect
        .val(slot.loadout.weapon_attr.map((wa) => wa.id))
        .trigger('change');
    } else weaponAttributesSelect.val(null).trigger('change');

    // Initialize roles select
    const rolesSelect = form.find('select[name="roles[]"]');
    initializeSelect(rolesSelect, '-- Choose a role --', (item) => item.text);

    // Select current roles
    if (slot.loadout.roles.length) {
      rolesSelect.val(slot.loadout.roles.map((r) => r.name)).trigger('change');
    } else rolesSelect.val(null).trigger('change');

    // Initialize monster part select
    const monsterPartSelect = form.find('select[name="monster-part-focus[]"]');
    if (this.selectedMonsters.length) {
      monsterPartSelect.prop('disabled', false);
      monsterPartSelect.html(
        this.selectedMonsters
          .map((m) => ({
            monster: m.name,
            parts: m.part_dmg_effectiveness.map((p) => ({
              name: p.name,
              icon: p.icon,
            })),
          }))
          .filter(
            ({ monster }, index, arr) =>
              arr.indexOf(arr.find((i) => i.monster === monster)) === index
          )
          .map(({ monster, parts }) => {
            let optGroupHTML = `<optgroup label="${monster}">`;
            optGroupHTML += parts
              // .sort((qr1, qr2) => qr1.rarity - qr2.rarity)
              .map(
                (p) =>
                  `<option data-icon="${
                    p.icon === 'INVALID' ? 'ITEM_0001' : p.icon
                  }" value="${monster}-${p.name}">
          ${p.name}
        </option>`
              )
              .join('');
            optGroupHTML += '</optgroup>';
            return optGroupHTML;
          })
          .join('')
      );
      initializeSelect(
        monsterPartSelect,
        '-- Choose a monster part--',
        (item) => formatOption(item, 'icon', 'Item Icons'),
        true
      );

      // Select monster parts
      if (slot.monsterPartFocus.length) {
        monsterPartSelect
          .val(slot.monsterPartFocus.map((r) => r.monster + '-' + r.name))
          .trigger('change');
      } else monsterPartSelect.val(null).trigger('change');
    } else {
      if (monsterPartSelect.data('select2'))
        monsterPartSelect.select2('destroy');
      monsterPartSelect.html('');
      monsterPartSelect.prop('disabled', true);
      monsterPartSelect.val(null).trigger('change');
    }

    // Set notes
    form.find('textarea[name="notes"]').val(slot.notes || '');

    // Add or update skill elements
    const $formSkillsList = form.find('.form-skills-list');
    $formSkillsList
      .off('click')
      .on('click', '.remove-skill-button', function (e) {
        const removeButton = $(this);
        let skillFormGroup = removeButton.closest('.skill-form-group');
        let skillSelect = skillFormGroup.find('select.skill-dropdown');
        skillSelect.select2('destroy'); // Destroy the Select2 instance
        skillSelect.html('');
        skillFormGroup.remove();
        form.trigger('change');
      });

    const skillFormGroupElements = $formSkillsList.find('.skill-form-group');

    skillFormGroupElements.each(function () {
      $(this).find('button.remove-skill-button').trigger('click');
    });

    if (slot.loadout.skills && slot.loadout.skills.length) {
      slot.loadout.skills.forEach((skill) => {
        this.addSkillFormGroup($formSkillsList, skill);
      });
    }

    // Add skill button
    form
      .find('.add-skill-button')
      .off('click')
      .on('click', () => {
        this.addSkillFormGroup($formSkillsList);
      });
  }

  bindCustomTabFormEvents(form) {
    let updateClearTimer;

    // Handle form changes
    form.off('change').on('change', (e) => {
      if (updateClearTimer) {
        clearTimeout(updateClearTimer);
      }
      updateClearTimer = setTimeout(() => {
        const formData = new FormData(form[0]);

        if (!this.selectedSlot) return;
        const updatedSlot = processFormData(formData, this.selectedSlot);

        // Update the slot in the array
        this.updateSlot(updatedSlot, this.getIndexOfSelectedSlot());
      }, 10);
    });
  }

  updateSkillFormGroup(skillFormGroup, skill) {
    const skillSelect = skillFormGroup.find('.skill-dropdown');
    const levelSelect = skillFormGroup.find('.skill-level');

    skillSelect
      .val(skill.id)
      .trigger('change') // Trigger change to update Select2's display
      .trigger({
        // Manually trigger select2:select to populate the level dropdown based on the pre-selected skill
        type: 'select2:select',
        params: {
          data: {
            id: skill.id,
            element: {
              dataset: {
                skillMaxLevel: skill.max_level,
              },
            },
          },
        },
      });
    levelSelect.val(+skill.min_level).trigger('change'); // Set the specific level for the existing skill
  }

  addSkillFormGroup(container, existingSkill = null) {
    const nextId = container.find('.skill-form-group').length + 1;
    const template = document.getElementById('skill-template');
    const templateContent = document.importNode(template.content, true);
    const skillFormGroup = $('<div>')
      .addClass('skill-form-group')
      .append(templateContent);

    const skillSelect = skillFormGroup.find('select[class="skill-dropdown"]');
    const levelSelect = skillFormGroup.find('select[class="skill-level"]');

    // Set name attributes for form submission
    skillFormGroup.attr('data-skill-index', nextId);
    // skillFormGroup.data('skill-index', nextId);
    skillSelect.attr('name', 'skill-select-' + nextId);
    levelSelect.attr('name', 'skill-level-' + nextId);

    container.append(skillFormGroup);
    // Initialize the skill select dropdown with Select2. This creates a new Select2 instance for each skill row.
    initializeSelect(skillSelect, '-- Choose a skill --', (item) =>
      formatOption(item, 'skillIcon', 'Skill Icons')
    );

    // Event listener for when a skill is selected in the dropdown
    skillSelect.on('select2:select', (e) => {
      const data = e.params.data;
      if (!data.id) return; // Ignore if no actual skill selected

      const skillMaxLevel = data.element.dataset.skillMaxLevel;
      levelSelect.empty();

      if (skillMaxLevel) {
        levelSelect.prop('disabled', false);
        // Populate level options from 1 to maxLevel
        [...new Array(+skillMaxLevel)].forEach((_, i) => {
          levelSelect.append(`<option value="${i + 1}">${i + 1}</option>`);
        });
        levelSelect.val(1).trigger('change');
      }
    });

    // // Event listener for when a skill is cleared (deselected)
    skillSelect.on('select2:clear', () => {
      levelSelect.empty();
      levelSelect.prop('disabled', true);
      container.closest('form').trigger('change'); // Trigger change on the main form to update loadout
    });

    // If an existing skill object is provided, pre-populate the dropdowns
    if (existingSkill) {
      this.updateSkillFormGroup(skillFormGroup, existingSkill);
    }
  }
  /**
   * @param {JQuery} slotContainer Element slot container.
   * @param {Slot} slotData
   */
  updateSlotDisplay(slotContainer, slotData) {
    // Basic slot info
    slotContainer
      .find('.slot-display-name')
      .text(slotData.displayName || 'Hunter Slot');
    slotContainer
      .find('.slot-type')
      .text(slotData.configurationType.name + ' Configuration')
      .attr('title', slotData.configurationType.description);

    // Show/hide owner badge
    const ownerBadge = slotContainer.find('.slot-owner');
    ownerBadge.css('display', slotData.isOwner ? 'inline-block' : 'none');

    // Loadout info
    slotContainer
      .find('.loadout-name')
      .text(slotData.loadout.name || 'Custom Loadout');
    slotContainer
      .find('.loadout-description')
      .text(slotData.loadout.description || 'Custom hunter configuration.');

    // Roles
    const rolesList = slotContainer.find('.roles-list');
    rolesList.empty();
    if (slotData.loadout.roles?.length) {
      slotData.loadout.roles.forEach((role) => {
        $('<li>')
          .addClass(`role-tag role-${role.name}`)
          .text(role.name)
          .appendTo(rolesList);
      });
    } else {
      rolesList.html('<li class="empty-message">Any role</li>');
    }

    // Weapons
    const weaponList = slotContainer.find('.weapon-list');
    weaponList.empty();
    if (slotData.loadout.weapon_types?.length) {
      slotData.loadout.weapon_types.forEach((weapon) => {
        const weaponType = getWeaponType(weapon.id);
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
    if (slotData.loadout.weapon_attr?.length) {
      slotData.loadout.weapon_attr.forEach((attr) => {
        const weaponAttr = getWeaponAttribute(attr.id);
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
    const $skillsList = slotContainer.find('.skills-list');

    $skillsList.empty();
    if (slotData.loadout.skills?.length) {
      slotData.loadout.skills.forEach((skillInfo) => {
        const skillItem = $('<li>')
          .addClass('skill-item')
          .tooltip({
            content: function () {
              return $(this).prop('title');
            },
          });
        skillItem.prop('title', formatSkillInfoTooltip(skillInfo));
        const iconSrc = skillInfo?.icon + '.png' || 'SKILL_0000.png';
        const maxLevel = skillInfo?.max_level || 7;

        const skillNameEl = $('<div>').addClass('skill-name')
          .html(`<img src="icons/Skill Icons/${iconSrc}" alt="${skillInfo.name}" class="skill-icon">
                  <span>${skillInfo.name}</span>`);

        const skillLevelEl = $('<div>').addClass('skill-level');
        for (let i = 0; i < maxLevel; i++) {
          $('<div>')
            .addClass(
              i < skillInfo.min_level
                ? 'level-circle'
                : 'level-circle level-empty'
            )
            .appendTo(skillLevelEl);
        }

        skillItem.append(skillNameEl, skillLevelEl).appendTo($skillsList);
      });
    } else {
      $skillsList.html(
        '<li class="empty-message">No specific skills required</li>'
      );
    }

    // Monster part focus
    const partFocusList = slotContainer.find('.part-focus-list');
    partFocusList.empty();
    if (slotData.monsterPartFocus?.length) {
      slotData.monsterPartFocus.forEach((part) => {
        $('<li>')
          .addClass('part-focus-tag')
          .append(
            `<img height="30" title="${part.monster}" alt="${
              part.monster
            }" src="icons/Large Monster Icons/${
              this.selectedMonsters.find((m) => m.name === part.monster).icon
            }.png"/>`,
            `[${part.name} ${chooseEmoteBasedOnPart(part.name)}]`
          )
          .appendTo(partFocusList);
      });
    } else {
      partFocusList.html(
        '<li class="empty-message">No specific part focus required</li>'
      );
    }

    // Notes
    slotContainer
      .find('.notes-content')
      .text(slotData.notes || 'No additional notes for this slot.');
  }

  updateLoadoutsDisplay(loadoutsContainer, filter = {}) {
    let loadoutsWithIndex = systemLoadoutsList.map((obj, i) => ({
      index: i,
      ...obj,
    }));

    loadoutsWithIndex = this.filterLoadouts(loadoutsWithIndex, filter);

    loadoutsContainer.empty();
    loadoutsWithIndex.forEach((loadout) =>
      loadoutsContainer.append(this.createLoadoutElement(loadout))
    );
  }

  filterLoadouts(loadouts, { name, role }) {
    // filter by loadout name
    if (name) {
      return loadouts.filter((l) =>
        l.name.toLowerCase().includes(name.toLowerCase())
      );
    } else if (role) {
      if (role === 'Any') return loadouts;
      return loadouts.filter((l) => l.roles.map((r) => r.name).includes(role));
    } else return loadouts;
  }

  /**
   * Create loadout element for selection
   * @param {Loadout} loadout
   * @returns JQuery element
   */
  createLoadoutElement(loadout) {
    const loadoutElement = $(
      document.getElementById('loadout-template').content
    )
      .clone()
      .find('.loadout-item')
      .attr('aria-label', 'Loadout: ' + loadout.name || 'Custom Loadout');

    const loadoutRolesItems = loadout.roles.map((r) =>
      $('<span>').addClass('role-tag').addClass(`role-${r.name}`).text(r.name)
    );

    loadoutElement.find('.loadout-title').append(loadout.name);

    loadoutElement.find('.loadout-roles').append(loadoutRolesItems);

    loadoutElement
      .find('.loadout-description')
      .text(loadout.description || 'No description available.');

    // Weapons
    const weaponList = loadoutElement.find('.weapon-list');
    weaponList.empty();

    if (loadout.weapon_types?.length) {
      loadout.weapon_types.forEach((weaponType) => {
        if (weaponType) {
          $('<li>')
            .addClass('weapon-tag')
            .html(
              `<img src="icons/Weapon Types/${weaponType.name.replaceAll(
                ' ',
                '_'
              )}.png" 
                alt="${weaponType.name}" class="weapon-icon">
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
      weaponList.html('<li class="empty-message">Any weapon</li>');
    }

    // Attributes
    const attributeList = loadoutElement.find('.attribute-list');
    attributeList.empty();

    if (loadout.weapon_attr?.length) {
      loadout.weapon_attr.forEach((weaponAttr) => {
        if (weaponAttr?.icon)
          $('<li>')
            .addClass('attribute-tag')
            .html(
              `<img src="icons/Status Icons/${weaponAttr.icon}.png" 
              alt="${weaponAttr.name}" class="attribute-icon">
          <span>${weaponAttr.name}</span>`
            )
            .appendTo(attributeList);
      });
    } else {
      attributeList.html('<li class="empty-message">Any</li>');
    }

    // Skills
    const $skillsList = loadoutElement.find('.skills-icons');
    $skillsList.empty();

    if (loadout.skills?.length) {
      loadout.skills.forEach((skillInfo) => {
        const skillItem = $('<li>')
          .addClass('skill-item')
          .tooltip({
            content: function () {
              return $(this).prop('title');
            },
          });

        if (skillInfo) {
          skillItem.prop('title', formatSkillInfoTooltip(skillInfo));

          const iconSrc = skillInfo?.icon + '.png' || 'SKILL_0000.png';

          // Add skill icon
          $('<img>')
            .addClass('skill-icon')
            .attr('src', `icons/Skill Icons/${iconSrc}`)
            .attr('alt', skillInfo.name)
            .appendTo(skillItem);

          // Add level indicator
          $('<span>')
            .addClass('skill-level')
            .text(skillInfo.min_level)
            .appendTo(skillItem);

          skillItem.appendTo($skillsList);
        }
      });
    } else {
      $skillsList.html('<li class="empty-message">No specific skills</li>');
    }

    loadoutElement.on('click', () => {
      if (
        JSON.stringify(this.selectedSlot.loadout) ===
        JSON.stringify(Loadout.fromDatabaseObject(loadout))
      )
        return;

      const clonedSlot = structuredClone(this.selectedSlot);
      clonedSlot.loadout = Loadout.fromDatabaseObject(loadout);
      clonedSlot.configurationType = SlotConfigType.PRESET;
      this.updateSlot(clonedSlot, this.getIndexOfSelectedSlot());
    });
    return loadoutElement;
  }
}

function initializeSelect(
  selectElement,
  placeholder,
  formatFunction,
  isMultipleSelect
) {
  // if already initialized skip to prevent memory leak
  if (selectElement.data('select2')) {
    return;
  }
  selectElement.select2({
    placeholder: placeholder,
    allowClear: true,
    templateResult: formatFunction,
    multiple: isMultipleSelect,
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

function formatSkillInfoTooltip(skill) {
  if (!skill) {
    console.error('No skill provided');
    return '';
  }
  return `<div class="tooltip skill-info-tooltip">
     <img src="icons/Skill Icons/${skill.icon}.png" alt="${
    skill.name
  }" height="50">
     <h3 style="margin:0;padding:0em;">${skill.name}</h3> 
     <span style="opacity:0.9; font-size:0.9rem;">${skill.category}</span>
     <ul style="padding-left:1em">
      ${skill.level_descriptions
        .map((d, i) =>
          skill.min_level
            ? i + 1 === skill?.min_level
              ? `<li><b>${d}</b></li>`
              : `<li style="opacity:0.5">${d}</li>`
            : `<li>${d}</li>`
        )
        .join('')}
     </ul>
     <p style="font-size: 0.9rem;"><i>${skill.description}</i></p>
  </div>`;
}

/**
 * Creates a new Slot by combining previous Slot and FormData for loadout.
 * @param {FormData} formData Custom Loadout config FormData.
 * @param {Slot} originalSlot Slot that will be updated from form data.
 * @returns {Slot}
 */
function processFormData(formData, originalSlot) {
  // Create a new slot object based on the original
  const newSlot = new Slot({
    id: originalSlot.id,
    displayName: originalSlot.displayName,
    isOwner: originalSlot.isOwner,
    configurationType: originalSlot.configurationType,
  });

  // Process form data entries
  for (const [key, value] of formData.entries()) {
    // Skip empty values
    if (!value) continue;
    // Process name and description
    if (key === 'name' && value) {
      newSlot.loadout.name = value;
    }
    if (key === 'description' && value) {
      newSlot.loadout.description = value;
    }

    // Process roles
    if (key === 'roles[]') {
      if (!newSlot.loadout.roles.map((r) => r.name).includes(value))
        newSlot.loadout.roles.push(
          findClassEnumStaticPropInstance(LoadoutRole, value)
        );
    }
    // Process weapon types
    else if (key === 'weapon-types[]') {
      if (!newSlot.loadout.weapon_types.map((wp) => wp.id).includes(value))
        newSlot.loadout.weapon_types.push(
          findClassEnumStaticPropInstance(WeaponType, value)
        );
    }
    // Process weapon attributes
    else if (key === 'weapon-attributes[]') {
      if (!newSlot.loadout.weapon_attr.map((wa) => wa.id).includes(value))
        newSlot.loadout.weapon_attr.push(
          findClassEnumStaticPropInstance(WeaponAttribute, value)
        );
    }
    // Process monster part focus
    else if (key === 'monster-part-focus[]') {
      if (
        !newSlot.monsterPartFocus
          .map((pf) => pf.name)
          .includes(value.split('-')[1])
      )
        newSlot.monsterPartFocus.push({
          name: value.split('-')[1],
          monster: value.split('-')[0],
        });
    }
    // Process notes
    else if (key === 'notes') {
      newSlot.notes = value;
    }
    // Process skills
    else if (key.startsWith('skill-select-')) {
      const skillIndex = key.split('-').pop();
      const levelKey = `skill-level-${skillIndex}`;
      const levelValue = formData.get(levelKey);

      if (value && levelValue) {
        // skill doesn't exist -> add it
        if (
          !newSlot.loadout.skills.find((s) => s.id === value) &&
          getSkillInfo(value)
        ) {
          const skill = getSkillInfo(value);
          newSlot.loadout.skills.push(
            new LoadoutSkill(
              skill.id,
              skill.name,
              skill.icon,
              skill.description,
              skill.category,
              parseInt(levelValue, 10),
              parseInt(getSkillInfo(value).max_level),
              skill.set_count,
              skill.level_descriptions
            )
          );
        }
        // update min level
        else if (getSkillInfo(value))
          newSlot.loadout.skills[
            newSlot.loadout.skills.indexOf(
              newSlot.loadout.skills.find((s) => s.id === value)
            )
          ].min_level = parseInt(levelValue, 10);
      }
    }
  }

  // Set configuration type based on selections
  if (
    originalSlot.configurationType.name !== SlotConfigType.CUSTOM.name &&
    (newSlot.loadout.roles.length > 0 ||
      newSlot.loadout.weapon_types.length > 0 ||
      newSlot.loadout.weapon_attr.length > 0 ||
      newSlot.loadout.skills.length > 0)
  ) {
    newSlot.configurationType = SlotConfigType.CUSTOM;
    if (!newSlot.loadout.name)
      newSlot.loadout.name = originalSlot.loadout.name || 'Custom Loadout';
    if (!newSlot.loadout.description)
      newSlot.loadout.description =
        originalSlot.loadout.description ||
        'This loadout has specific requirements for joining.';
  } else {
    newSlot.configurationType = SlotConfigType.FLEXIBLE;
    if (!newSlot.loadout.name) newSlot.loadout.name = 'Flexible Loadout';
    if (!newSlot.loadout.description)
      newSlot.loadout.description =
        'Any skills and equipment are permitted for this slot.';
  }

  return newSlot;
}

const getSkillInfo = (id) => skillsList.find((s) => s.id === id);
const getWeaponType = (id) => weaponTypesList.find((w) => w.id === id);
const getWeaponAttribute = (id) =>
  weaponAttributesList.find((w) => w.id === id);

// Initialize the component
export default PlayerComp;
