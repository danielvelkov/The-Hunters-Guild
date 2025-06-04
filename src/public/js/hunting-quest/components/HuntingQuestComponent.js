import { bonusQuestRewardsList, monstersDropsList } from '../create.js';
import { getDmgColor, getQuestCategoryStyle } from '../../common/common.js';
import { guidGenerator } from 'js/common/common.js';
import HuntingQuest from 'entities/HuntingQuest';
import MonsterCrown from 'entities/game-data/MonsterCrown.js';
import MonsterVariant from 'entities/game-data/MonsterVariant.js';

class HuntingQuestComponent {
  /**
   * @param {HuntingQuest} quest - the Hunting Quest instance
   */
  constructor(quest) {
    this.quest = quest;
  }

  /**
   * Generate JQuery object based on the data
   * @returns {JQuery} - Resulting JQuery of the component
   */
  render() {
    const container = $('<div>');

    // Check if high rank quest
    const isHighRankQuest =
      this.quest.star_rank === 'HIGH' || +this.quest.star_rank >= 4;

    const questDetailsTabId = guidGenerator();
    const monsterTabsIds = [
      ...this.quest.quest_monsters.map((_) => guidGenerator()),
    ];
    // Generate HTML for preview
    const HTMLstring = `
    <div class="tabs" >
      <ul aria-label="quest tabs">
        <li aria-controls="tabs-quest-details-${questDetailsTabId}"><a href="#tabs-quest-details-${questDetailsTabId}">Quest Details</a></li>
        ${this.quest.quest_monsters
          .map((qm) => qm.monster)
          .map(
            (m, i) =>
              `<li aria-controls="tabs-monster-${monsterTabsIds[i]}"><a href="#tabs-monster-${monsterTabsIds[i]}">${m.name}</a></li>`
          )
          .join('')}
      </ul>
      <div role="tabpanel" id="tabs-quest-details-${questDetailsTabId}">
        ${this.generateQuestDetailsTab()}
      </div>
      ${this.quest.quest_monsters
        .map((qm) => qm.m)
        .map(
          (m, i) => `
        <div role="tabpanel" id="tabs-monster-${monsterTabsIds[i]}">
          ${this.generateMonsterTab(m, isHighRankQuest)}
        </div>
      `
        )
        .join('')}
    </div>
  `;

    // Update preview and initialize tabs
    container.html(HTMLstring);
    container.find('.tabs').tabs();
    return container;
  }

  generateQuestDetailsTab() {
    return `
    <table class="themetable" width="100%" align="center">
      <tbody>
        <tr>
          <th colspan="2" style="${getQuestCategoryStyle(
            this.quest.category.name
          )}">${this.quest.category.name}</th>
          <th colspan="3" align="right">${this.quest.star_rank}${
      this.quest.star_rank > 1
        ? [...new Array(+this.quest.star_rank)].map((_) => '⭐').join('')
        : '⭐'
    }</th>
        </tr>
        <tr>
          <th rowspan="2">Monsters:</th>
          <th colspan="3" >
            <div class="flex-row" style="justify-content:center;">
            ${this.quest.quest_monsters
              .map(
                (qm, index) =>
                  `<div class="flex-col" style="position:relative;">
                ${
                  qm.crown.name !== MonsterCrown.BASE.name
                    ? `<img height='25' title="${qm.crown.name}" alt="${
                        qm.crown.name
                      }"
                src="icons/${qm.crown.name.toLowerCase()}-crown.png"
                style="position:absolute; z-index: 1; top:0px; right:-10px;filter: drop-shadow(1px 1px 1px #222)
                drop-shadow(-1px -1px 1px #222) drop-shadow(-1px 1px 0px #222) drop-shadow(1px -1px 0px #222);">`
                    : ''
                }

                <img height='75' title="${
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
                  src="icons/Large Monster Icons/${qm.monster.icon}.png"/>
                  <span style="margin-top:-1em; font-size:0.65em;">${'✨'.repeat(
                    +qm.strength
                  )}</span>
                </div>`
              )
              .join('')}
            </div>
          </th>
        </tr>
        <tr>
          <th colspan="3"><h3>${this.quest.title}</h3></th>
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
          <th>Time Limit:</th>
          <td>${this.quest.time_limit} mins</td>
        </tr>
        <tr>
          <th>Description:</th>
          <td colspan="3"></td>
        </tr>
        <tr>
          <th>Notes:</th>
          <td colspan="3"></td>
        </tr>
      </tbody>
    </table>
  `;
  }

  generateMonsterTab() {
    //TODO
    return '';
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
        <img height='30' src="icons/Item Icons/${
          bonusItem.icon === 'INVALID' ? 'ITEM_0001' : bonusItem.icon
        }.png" alt="${bonusItem.name}" />
        ${
          (+bonusItem.rarity >= 6 && bonusItem.type === 'Rare Drop') ||
          (bonusItem.type === 'Food Ingredient' && +bonusItem.rarity >= 5)
            ? `<div class="sparkles">${[...Array(6)]
                .map((m) => `<div class="sparkle"></div>`)
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
          `<img src="icons/Skill Icons/${s.icon}.png" height="23" alt="${s.name}_Skill_Icon"/> <span>${s.name}</span>`
        );
        return skillDiv.prop('outerHTML');
      })
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .join('');
  }
}

module.exports = HuntingQuestComponent;
