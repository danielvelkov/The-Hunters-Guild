import {
  getDmgColor,
  getQuestCategoryStyle,
  formatSkillInfoTooltip,
  chooseEmoteBasedOnPart,
} from '../../common/util.js';
import { guidGenerator } from 'js/common/util.js';
import HuntingQuest from 'entities/HuntingQuest';
import MonsterCrown from 'entities/game-data/MonsterCrown.js';
import MonsterVariant from 'entities/game-data/MonsterVariant.js';

import 'css/components/hunting-quest-component.css';
import 'css/components/hunter-slot.css';

export default class HuntingQuestComponent {
  /**
   * @param {HuntingQuest} quest - the Hunting Quest instance
   */
  constructor(quest, monstersDropsList = []) {
    this.quest = quest;
    this.monstersDropsList = monstersDropsList;
  }

  /**
   * Generate JQuery object based on the data
   * @returns {JQuery} - Resulting JQuery of the component
   */
  render() {
    const tabsComponent = $('<div>').addClass('tabs');

    // Check if high rank quest
    const isHighRankQuest =
      this.quest.star_rank === 'HIGH' || +this.quest.star_rank >= 4;

    const questDetailsTabId = guidGenerator();
    const monsterTabsIds = [
      ...this.quest.quest_monsters.map((_) => guidGenerator()),
    ];
    // Generate HTML for preview
    const HTMLstring = `
      <ul aria-label="quest tabs">
        <li aria-controls="tabs-quest-details-${questDetailsTabId}"><a href="#tabs-quest-details-${questDetailsTabId}">Quest Details</a></li>
        ${this.quest.quest_monsters
          .filter(
            (qm, i, arr) =>
              arr.findIndex(
                (x) =>
                  x.monster.name === qm.monster.name &&
                  (x.variant.name === qm.variant.name ||
                    qm.variant.name === MonsterVariant.FRENZIED.name)
              ) === i
          )
          .map(
            (qm, i) =>
              `<li aria-controls="tabs-monster-${
                monsterTabsIds[i]
              }"><a href="#tabs-monster-${monsterTabsIds[i]}">${
                qm.variant.name !== MonsterVariant.BASE.name
                  ? qm.variant.name + ' ' + qm.monster.name
                  : qm.monster.name
              }</a></li>`
          )
          .join('')}
      </ul>
      <div role="tabpanel" aria-label="quest details tab" id="tabs-quest-details-${questDetailsTabId}" class="freedom-unite-quest">
        ${this.generateQuestDetailsTab()}
      </div>
      ${this.quest.quest_monsters
        .filter(
          (qm, i, arr) =>
            arr.findIndex(
              (x) =>
                x.monster.name === qm.monster.name &&
                (x.variant.name === qm.variant.name ||
                  qm.variant.name === MonsterVariant.FRENZIED.name)
            ) === i
        )
        .map(
          (qm, i) => `
        <div role="tabpanel" aria-label="${
          qm.monster.name
        } tab" id="tabs-monster-${monsterTabsIds[i]}">
          ${this.generateMonsterTab(qm, isHighRankQuest)}
        </div>
      `
        )
        .join('')}
  `;

    // Update preview and initialize tabs
    tabsComponent.html(HTMLstring);
    tabsComponent.tabs();

    tabsComponent.tooltip({
      content: function () {
        return $(this).prop('title');
      },
      classes: {
        'ui-tooltip': 'tooltip',
      },
    });

    return tabsComponent;
  }

  generateQuestDetailsTab() {
    return `
    <table class="themetable" width="100%" align="center">
      <tbody>
        <tr>
          <th colspan="2" style="text-shadow:none;${getQuestCategoryStyle(
            this.quest.category.name
          )}">${this.quest.category.name}</th>
          <th colspan="3" align="right">${this.quest.star_rank}${
      this.quest.star_rank > 1
        ? [...new Array(+this.quest.star_rank)].map((_) => '⭐').join('')
        : '⭐'
    }</th>
        </tr>
        <tr>
          <th colspan="3" >
            <div class="flex-row" style="justify-content:center;">
            ${this.quest.quest_monsters
              .map(
                (qm) =>
                  `<div class="flex-col" style="position:relative;">
                ${
                  qm.crown.name !== MonsterCrown.BASE.name
                    ? `<img height='25' title="${qm.crown.name}" alt="${
                        qm.crown.name
                      }"
                src="/icons/${qm.crown.name.toLowerCase()}-crown.png"
                style="position:absolute; z-index: 1; top:0px; right:-10px;filter: drop-shadow(1px 1px 1px #222)
                drop-shadow(-1px -1px 1px #222) drop-shadow(-1px 1px 0px #222) drop-shadow(1px -1px 0px #222);">`
                    : ''
                }
                <div class="monster-image-container">
                <img height='100' title="${
                  qm.variant.name !== MonsterVariant.BASE.name
                    ? qm.variant.name + ' ' + qm.monster.name
                    : qm.monster.name
                }" alt="${
                    qm.variant.name !== MonsterVariant.BASE.name
                      ? qm.variant.name + ' ' + qm.monster.name
                      : qm.monster.name
                  }"
                  class="monster-image
                  ${
                    qm.variant.name === MonsterVariant.TEMPERED.name
                      ? 'tempered-outline'
                      : ''
                  }
                  ${
                    qm.variant.name === MonsterVariant.FRENZIED.name
                      ? 'frenzied-outline'
                      : ''
                  }"
                  src="/icons/Large Monster Icons/${qm.monster.icon}.png"/>
                  <span style="margin-top:-1em; font-size:0.65em;">${'✨'.repeat(
                    +qm.strength
                  )}</span>
                  </div>
                </div>`
              )
              .join('')}
            </div>
          </th>
        </tr>
        <tr>
          <th colspan="3" align="center"><h3 style="max-width:50ch; inline-size:50ch;overflow-wrap: break-word;">${
            this.quest.title
          }</h3></th>
        </tr>
        <tr>
          <th>Bonus Rewards:</th>
          <td colspan="3">
            <div class='flex-row' style="gap:0em; align-items:center;">
              ${this.generateBonusRewards(this.quest.quest_bonus_rewards)}
            </div>
          </td>
        </tr>
        <tr>
          <th width="10%"></th>
          <th width="20%">Quest Info:</th>
          <th width="70%" align="left">Recom. Skills:</th>
        </tr>
        <tr>
          <th>HR req:</th>
          <td>${this.quest.hr_requirement}+</td>
          <td rowspan="3">
            ${this.generateRecommendedSkills(
              this.quest.quest_monsters.map((qm) => qm.monster)
            )}
          </td>
        </tr>
        <tr>
          <th>Area:</th>
          <td>${this.quest.area}</td>
        </tr>
        <tr>
          <th>Crossplay:</th>
          <td>${
            this.quest.crossplay_enabled
              ? 'YES'
              : this.quest.gaming_platforms.length
              ? this.quest.gaming_platforms
                  .map((gp) => gp.name.toUpperCase())
                  .join(' ')
              : 'NO'
          } </td>
        </tr>
        <tr>
          <th>Time Limit:</th>
          <td>${this.quest.time_limit} mins</td>
        </tr>
        <tr>
          <th>Description:</th>
          <td colspan="3" style="max-width:30ch; inline-size:30ch;overflow-wrap: break-word;" >${
            this.quest.description ?? ''
          }</td>
        </tr>
          <!-- NEW PLAYER SLOTS SECTION -->
        <tr>
            <th colspan="3" align="center">Player Slots:</th>
        </tr>
          <tr>
                <td colspan="3" class="player-slots-section">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 8px;">
                    ${this.quest.player_slots
                      .map((slot) => this.generateSlotSection(slot))
                      .join('')}
                    </div>
                </td>
          </tr>
      </tbody>
    </table>
  `;
  }

  generateMonsterTab({ monster, variant }, isHighRankQuest) {
    return `
    <h2>${monster.name}</h2>
    <div style="display:flex;justify-content: space-between;flex-wrap: wrap;gap:1em;">
        ${this.generateDamageEffectivenessTable(monster)}
        ${this.generateStatusEffectivenessTable(monster)}
        ${this.generateItemEffectivenessTable(monster)}
    </div>

    <h3>Drop Rates ${isHighRankQuest ? '(High Rank)' : '(Low Rank)'}</h3>
    ${this.createMonsterDropsSection(
      monster.name,
      isHighRankQuest ? 'HIGH' : 'LOW',
      variant.name === MonsterVariant.TEMPERED.name
    )}
    <p><i>* Some tables are grayed about because the rewards will not be present.
      Add Bonus rewards from the 'Monster Material' or 'Rare Drops' groups in the Quest Details form.</i></p>
  `;
  }

  generateBonusRewards() {
    if (
      !this.quest.quest_bonus_rewards ||
      this.quest.quest_bonus_rewards.length === 0
    ) {
      return '';
    }

    return this.quest.quest_bonus_rewards
      .map((questBonusReward) => {
        const bonusItem = questBonusReward.item;
        if (!bonusItem) return '';

        const iconPath = `url('../icons/Item Icons/${
          bonusItem.icon === 'INVALID' ? 'ITEM_0001' : bonusItem.icon
        }.png')`;
        return `<div class="item-img-container bonus-item" title="${
          bonusItem.name
        }\nRarity: ${bonusItem.rarity}"
        data-item-id="${bonusItem.id}"
        style="--item-color: var(--${
          bonusItem.iconColor
        }); --item-icon:${iconPath}; ">
        <img height='30' src="/icons/Item Icons/${
          bonusItem.icon === 'INVALID' ? 'ITEM_0001' : bonusItem.icon
        }.png" alt="${bonusItem.name}" />
        ${
          (+bonusItem.rarity >= 6 && bonusItem.type === 'Rare Drop') ||
          (bonusItem.type === 'Food Ingredient' && +bonusItem.rarity >= 5)
            ? `<div class="sparkles">${[...Array(6)]
                .map((_) => `<div class="sparkle"></div>`)
                .join('')}</div>`
            : ''
        }
      </div>`;
      })
      .join('');
  }

  generateRecommendedSkills() {
    return this.quest.quest_monsters
      .map((qm) =>
        qm.monster.special_attacks.map((sa) => sa.skill_counters).flat()
      )
      .flat()
      .map((s) => {
        const skillDiv = $('<div>').addClass('flex-row');
        skillDiv.append(
          `<img src="/icons/Skill Icons/${s.icon}.png" height="23" alt="${s.name}_Skill_Icon"/> <span>${s.name}</span>`
        );
        return skillDiv.prop('outerHTML');
      })
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .join('');
  }

  generateDamageEffectivenessTable(monster) {
    return `
    <table style="width:fit-content;" class="dmg-effectiveness-table">
      <caption>Damage Effectiveness</caption>
      <tbody align="center">
        <tr>
          <th align="left">Part</th>
          <th><img height="20" src="/icons/slash.png" title="Slash" alt="Slash"></th>
          <th><img height="20" src="/icons/blow.png" title="Blow" alt="Blow"></th>
          <th><img height="20" src="/icons/shot.png" title="Shot" alt="Shot"></th>
          <th><img height="20" src="/icons/Status Icons/STATUS_0000.png" title="Fire" alt="Fire"></th>
          <th><img height="20" src="/icons/Status Icons/STATUS_0001.png" title="Water" alt="Water"></th>
          <th><img height="20" src="/icons/Status Icons/STATUS_0002.png" title="Thunder" alt="Thunder"></th>
          <th><img height="20" src="/icons/Status Icons/STATUS_0003.png" title="Ice" alt="Ice"></th>
          <th><img height="20" src="/icons/Status Icons/STATUS_0004.png" title="Dragon" alt="Dragon"></th>
          <th><img height="20" src="/icons/Status Icons/STATUS_0008.png" title="KO" alt="KO"></th>
          <th><img height="20" src="/icons/Status Icons/STATUS_0047.png" title="Flash" alt="Flash"></th>
        </tr>
        ${monster.part_dmg_effectiveness
          .sort((pde1, pde2) => {
            const dmgSum1 = Math.sumPrecise(
              pde1.damages.map((d) => Number(d.value))
            );
            const dmgSum2 = Math.sumPrecise(
              pde2.damages.map((d) => Number(d.value))
            );
            return dmgSum2 - dmgSum1;
          })
          .map((de) => {
            let tableRow = '<tr>';
            tableRow = tableRow.concat(
              `<td align="left"><img height="20" src="/icons/Item Icons/${de.icon}.png"/> <b>${de.name}</b></td>`
            );
            de.damages.forEach((d) => {
              let dmgColor = 'white';
              switch (d.type) {
                case 'fire':
                  dmgColor = 'red';
                  break;
                case 'water':
                  dmgColor = 'blue';
                  break;
                case 'thunder':
                  dmgColor = 'yellow';
                  break;
                case 'ice':
                  dmgColor = 'cyan';
                  break;
                case 'dragon':
                  dmgColor = 'purple';
                  break;
              }
              tableRow = tableRow.concat(
                `<td style="background-color: ${getDmgColor(
                  d.value,
                  dmgColor
                )};${
                  dmgColor !== 'white'
                    ? `
                           color: var(--secondary-color);
                `
                    : ''
                }
                ">${
                  (dmgColor !== 'white' && d.value >= 15) ||
                  (dmgColor === 'white' && d.value >= 45)
                    ? `<b>${d.value}</b>`
                    : d.value
                }</td>`
              );
            });
            tableRow = tableRow.concat('</tr>');
            return tableRow;
          })
          .join('')}
      </tbody>
    </table>
  `;
  }

  generateStatusEffectivenessTable(monster) {
    return `
    <table class="dmg-effectiveness-table">
      <caption>Status Effectiveness</caption>
      <thead>
        <tr>
          <th>Status</th>
          <th>Effectiveness</th>
        </tr>
      </thead>
      <tbody>
        ${monster.status_effectiveness
          .map((se) => {
            let tableRow = $('<tr>');
            tableRow.append(
              `<td align="left"><img height="20" src="/icons/Status Icons/${se.icon}.png"/> <b>${se.name}</b></td>`
            );
            tableRow.append(`<td>${se.stats.value}</td>`);
            return tableRow.prop('outerHTML');
          })
          .join('')}
      </tbody>
    </table>
  `;
  }

  generateItemEffectivenessTable(monster) {
    return `
    <table class="dmg-effectiveness-table">
      <caption>Item Effectiveness</caption>
      <thead>
        <tr>
          <th>Item</th>
          <th>Effectiveness</th>
        </tr>
      </thead>
      <tbody>
        ${monster.item_effectiveness
          .map((ie) => {
            let tableRow = $('<tr>');
            const iconPath = `url('../icons/Item Icons/${ie.icon}.png')`;
            tableRow.append(`<td align="left" >
            <div class="item-img-container"
                data-item-id="${ie.name}"
                style="--item-color: var(--${ie.iconColor}); --item-icon:${iconPath};">
                <img height="20" src="/icons/Item Icons/${ie.icon}.png"/>
            </div>
            <b>${ie.name}</b>
          </td>`);
            tableRow.append(`<td>${ie.stats.effectiveness}</td>`);
            return tableRow.prop('outerHTML');
          })
          .join('')}
      </tbody>
    </table>
  `;
  }

  createMonsterDropsSection(monster, rank, isTempered) {
    const dropsSection = $('<section>').addClass('drop-tables');
    const monsterDrops = this.groupMonsterDrops(monster);
    const bonusRewards = this.quest.quest_bonus_rewards.map(
      (bonusReward) => bonusReward.item
    );

    if (!monsterDrops[rank]) {
      dropsSection.append(
        `<p>No drop data is available for this monster at quest rank: <i>(${rank})</i></p>`
      );
      return dropsSection[0].outerHTML;
    }

    const similarSections = {
      carving: $('<div class="drop-section-group">'),
      quest: $('<div class="drop-section-group">'),
      bonus: $('<div class="drop-section-group">'),
    };

    Object.keys(monsterDrops[rank]).forEach((rewardType) => {
      const containsBreakablePartsCol = monsterDrops[rank][rewardType].some(
        (i) => i.brokenPart
      );
      const partsArr = monsterDrops[rank][rewardType];

      const dropTable = $('<table>');
      const tableHeader = $('<thead>');
      const tableBody = $('<tbody>');

      const titleRow = $('<tr>').append(
        `<th colspan="100%">${
          rewardType == 'Basic Rewards'
            ? `
          <div style="display:flex; gap:0.5em; align-items:center;justify-content:center;">
            <img height='23' src="/icons/Item Icons/ITEM_0000.png"/>
            ${rewardType}
          </div>`
            : rewardType == 'Valuable Rewards'
            ? `
          <div style="display:flex; gap:0.5em; align-items:center;justify-content:center;">
            <div class="item-img-container"
              data-icon-id="9999"
              style="--item-icon:url('../icons/Item Icons/ITEM_0000.png'); --item-color: var(--I_BROWN);">
              <img height='23' src="/icons/Item Icons/ITEM_0000.png" />
            </div>
            ${rewardType}
          </div>
       `
            : rewardType
        } </th>`
      );
      const colRow = $('<tr>').addClass('header-row');
      titleRow.attr('align', 'center');

      if (containsBreakablePartsCol) colRow.append('<th>Part</th>');

      colRow.append('<th width="80%" align="left">Item</th>');
      colRow.append('<th width="20%" align="right">Chance</th>');

      tableHeader.append(titleRow);
      tableHeader.append(colRow);

      partsArr.forEach((p) => {
        const dataRow = $('<tr>');
        if (p.brokenPart) {
          const brokenPartIconPath = `url('../icons/Item Icons/${p.brokenPartIcon}.png')`;
          dataRow.append(`
          <td>
            <div style="display:flex; gap:0.5em; align-items:center;">
              <div class="item-img-container"
                data-icon-id="${p.brokenPartIcon}"
                style="--item-icon:${brokenPartIconPath}">
                <img height='23' src="/icons/Item Icons/${p.brokenPartIcon}.png"/>
              </div>
              <b>${p.brokenPart}</b>
            </div>
          </td>
        `);
        } else if (containsBreakablePartsCol) {
          dataRow.append('<td>-</td>');
        }

        const itemIconPath = `url('../icons/Item Icons/${p.icon}.png')`;
        dataRow.append(`
        <td title="${'Rarity: ' + p.rarity + '<br/>' + p.description}">
          <div style="display:flex; gap:0.5em; align-items:center;">
            <div class="item-img-container"
              data-icon-id="${p.icon}"
              style="--item-icon:${itemIconPath}; --item-color: var(--${
          p.iconColor
        });">
              <img height='23' src="/icons/Item Icons/${p.icon}.png" />
            </div>
            ${p.name}<b>${+p.number !== 1 ? ` x${p.number}` : ''}</b>
          </div>
        </td>
        <td align="right">${Math.round(p.probability * 100)}%</td>
      `);
        tableBody.append(dataRow);
      });

      dropTable.append(tableHeader);
      dropTable.append(tableBody);

      const rewardConditions = {
        tempered: () => !isTempered,
        'basic rewards': () =>
          !bonusRewards.some((r) => r && r.name === 'Basic Material'),
        'valuable rewards': () =>
          !bonusRewards.some((r) => r && r.name === 'Valuable Material'),
        'rare rewards': () =>
          !bonusRewards.some(
            (r) => r && partsArr.find((pr) => pr.name === r.name)
          ),
      };

      Object.entries(rewardConditions).forEach(([key, condition]) => {
        if (rewardType.toLowerCase().includes(key) && condition()) {
          dropTable.addClass('excluded-drop');
        }
      });

      if (rewardType.toLowerCase().includes('carv'))
        similarSections.carving.append(dropTable);
      else if (
        rewardType.toLowerCase().includes('wound') ||
        rewardType.toLowerCase().includes('broken') ||
        rewardType.toLowerCase().includes('target rewards')
      )
        similarSections.quest.append(dropTable);
      else similarSections.bonus.append(dropTable);
    });

    Object.values(similarSections).forEach((s) => dropsSection.append(s));

    return dropsSection[0].outerHTML;
  }

  generateSlotSection(slot) {
    const playerSlot = $('<div>').addClass('player-slot');
    playerSlot.append(
      `
        <div class="slot-header">
            <span>${slot.displayName}</span>
            <div>
            ${slot.loadout.roles
              .map(
                (r) =>
                  `<span class="role-badge role-${r.name}">${r.name}</span>`
              )
              .join('')}
              </div>
        </div>
        <div class="slot-content">
              <span style="word-wrap: break-word;">${slot.loadout.name}</span>
            <div class="weapon-attr">
                <div style="display: flex; align-items: center; gap: 2px;">
                    ${
                      slot.loadout.weapon_types
                        .map(
                          (weaponType) =>
                            `<img src="/icons/Weapon Types/${weaponType.name.replaceAll(
                              ' ',
                              '_'
                            )}.png" alt="${weaponType.name}" title="${
                              weaponType.name
                            }" class="weapon-icon">`
                        )
                        .join('') || 'Any weapon'
                    }
                </div>
                <span>|</span>
                <div style="display: flex; align-items: center; gap: 2px;">
                    ${
                      slot.loadout.weapon_attr
                        .map(
                          (weaponAttr) =>
                            `<img src="/icons/Status Icons/${weaponAttr.icon}.png" alt="${weaponAttr.name}" title="${weaponAttr.name}" class="attr-icon">`
                        )
                        .join('') || 'Any Attribute'
                    }
                </div>
            </div>
        </div>
        <div class="skills-flex">
        </div>
        ${
          slot.focusedMonsterParts?.length
            ? `<div class="focused-parts-container"><hr style="width:100%"><span>Focused parts:</span><div class="flex-row" style="background-color: var(--secondary-color)">
            ${Object.values(
              Object.groupBy(slot.focusedMonsterParts, ({ monster }) => monster)
            )
              .map((partsArr) => {
                const monsterFocusSection = $('<div>')
                  .addClass('flex-col')
                  .css('align-items', 'center')
                  .css('width', '100%');
                monsterFocusSection.append(
                  `<span><u>${partsArr[0].monster}</u></span>`
                );
                partsArr.forEach((p) => {
                  monsterFocusSection.append(
                    `<span>[ ${p.name} ${chooseEmoteBasedOnPart(
                      p.name
                    )} ]</span>`
                  );
                });
                return monsterFocusSection[0].outerHTML;
              })
              .join('')}
          </div></div>`
            : ''
        }
        ${slot.notes ? `<p><i>${slot.notes}</i></p>` : ''}
        `
    );

    const skillsWithTooltips = slot.loadout.skills.map((s) => {
      const skillSlot = $('<div>').addClass('skill-slot');
      skillSlot.append(`
                    <img src="/icons/Skill Icons/${s.icon}.png" alt="${s.name}">
              `);
      skillSlot.prop('title', formatSkillInfoTooltip(s));
      $('<span>')
        .addClass('skill-min-level')
        .text(s.min_level)
        .appendTo(skillSlot);
      return skillSlot;
    });
    playerSlot.find('.skills-flex').append(...skillsWithTooltips);

    return playerSlot[0].outerHTML;
  }

  groupMonsterDrops(monster) {
    const monsterDrops = this.monstersDropsList.filter(
      (md) => md.source === monster
    );
    const monsterDropsGroup = Object.groupBy(monsterDrops, ({ rank }) => rank);

    Object.keys(monsterDropsGroup).forEach((k) => {
      const rewardGroups = Object.groupBy(
        monsterDropsGroup[k],
        ({ rewardType }) => rewardType
      );
      Object.keys(rewardGroups).forEach((rewardKey) => {
        rewardGroups[rewardKey] = rewardGroups[rewardKey].sort(
          (a, b) => b.probability - a.probability
        );
      });
      monsterDropsGroup[k] = rewardGroups;
    });

    return monsterDropsGroup;
  }
}
