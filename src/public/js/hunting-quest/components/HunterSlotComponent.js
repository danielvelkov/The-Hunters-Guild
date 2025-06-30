import Slot from 'entities/Slot';
import { chooseEmoteBasedOnPart, formatSkillInfoTooltip } from 'js/common/util';
import 'css/components/hunter-slot.css';
import hunterSlotTemplate from 'views/templates/hunter-slot.html';

export default class HunterSlotComponent {
  /**
   * @param {Slot} slot The player slot details object
   */
  constructor(slot) {
    this.slot = slot;
    this.cacheDOM();
  }
  cacheDOM() {
    this.$container = $(hunterSlotTemplate);
  }

  render() {
    // Basic slot info
    this.$container
      .find('.slot-display-name')
      .text(this.slot.displayName || 'Hunter Slot');
    this.$container
      .find('.slot-type')
      .text(this.slot.configurationType.name + ' Configuration')
      .attr('title', this.slot.configurationType.description);

    // Show/hide owner badge
    const ownerBadge = this.$container.find('.slot-owner');
    ownerBadge.css('display', this.slot.isOwner ? 'inline-block' : 'none');

    // Loadout info
    this.$container
      .find('.loadout-name')
      .text(this.slot.loadout.name || 'Custom Loadout');
    this.$container
      .find('.loadout-description')
      .text(this.slot.loadout.description || 'Custom hunter configuration.');

    // Roles
    const rolesList = this.$container.find('.roles-list');
    rolesList.empty();
    if (this.slot.loadout.roles?.length) {
      this.slot.loadout.roles.forEach((role) => {
        $('<li>')
          .addClass(`role-tag role-${role.name}`)
          .text(role.name)
          .appendTo(rolesList);
      });
    } else {
      rolesList.html('<li class="empty-message">Any role</li>');
    }

    // Weapons
    const weaponList = this.$container.find('.weapon-list');
    weaponList.empty();
    if (this.slot.loadout.weapon_types?.length) {
      this.slot.loadout.weapon_types.forEach((weaponType) => {
        $('<li>')
          .addClass('weapon-tag')
          .html(
            `<img src="/icons/Weapon Types/${weaponType.name.replaceAll(
              ' ',
              '_'
            )}.webp" alt="${weaponType.name}" class="weapon-icon">
                  <span>${weaponType.name}</span>`
          )
          .appendTo(weaponList);
      });
    } else {
      weaponList.html('<li class="empty-message">Any weapon type</li>');
    }

    // Attributes
    const attributeList = this.$container.find('.attribute-list');
    attributeList.empty();
    if (this.slot.loadout.weapon_attr?.length) {
      this.slot.loadout.weapon_attr.forEach((weaponAttr) => {
        $('<li>')
          .addClass('attribute-tag')
          .html(
            `<img src="/icons/Status Icons/${weaponAttr.icon}.webp" alt="${weaponAttr.name}" class="attribute-icon">
                  <span>${weaponAttr.name}</span>`
          )
          .appendTo(attributeList);
      });
    } else {
      attributeList.html('<li class="empty-message">Any element/status</li>');
    }

    // Skills
    const $skillsList = this.$container.find('.skills-list');

    $skillsList.empty();
    if (this.slot.loadout.skills?.length) {
      this.slot.loadout.skills.forEach((skillInfo) => {
        const skillItem = $('<li>')
          .addClass('skill-item')
          .tooltip({
            content: function () {
              return $(this).prop('title');
            },
          });
        skillItem.prop('title', formatSkillInfoTooltip(skillInfo));
        const iconSrc = skillInfo?.icon + '.webp' || 'SKILL_0000.webp';
        const maxLevel = skillInfo?.max_level || 7;

        const skillNameEl = $('<div>').addClass('skill-name')
          .html(`<img src="/icons/Skill Icons/${iconSrc}" alt="${skillInfo.name}" class="skill-icon">
                  <span>${skillInfo.name}</span>`);

        const skillLevelEl = $('<div>').addClass('skill-level-list');
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
    const partFocusList = this.$container.find('.part-focus-list');
    partFocusList.empty();
    if (this.slot.focusedMonsterParts?.length) {
      this.slot.focusedMonsterParts.forEach((part) => {
        $('<li>')
          .addClass('part-focus-tag')
          .append(
            `${part.monster} - [${part.name} ${chooseEmoteBasedOnPart(
              part.name
            )}]`
          )
          .appendTo(partFocusList);
      });
    } else {
      partFocusList.html(
        '<li class="empty-message">No specific part focus required</li>'
      );
    }

    // Notes
    this.$container
      .find('.notes-content')
      .text(this.slot.notes || 'No additional notes for this slot.');

    return this.$container[0].outerHTML;
  }
}
