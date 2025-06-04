import { bonusQuestRewardsList, monstersDropsList } from '../create.js';
import { guidGenerator } from 'js/common/common.js';
import HuntingQuest from 'entities/HuntingQuest';

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
    <div class="tabs">
      <ul>
        <li><a href="#tabs-quest-details-${questDetailsTabId}">Quest Details</a></li>
        ${this.quest.quest_monsters
          .map((qm) => qm.monster)
          .map(
            (m, i) =>
              `<li><a href="#tabs-monster-${monsterTabsIds[i]}">${m.name}</a></li>`
          )
          .join('')}
      </ul>
      <div id="tabs-quest-details-${questDetailsTabId}">
        ${this.generateQuestDetailsTab()}
      </div>
      ${this.quest.quest_monsters
        .map((qm) => qm.m)
        .map(
          (m, i) => `
        <div id="tabs-monster-${monsterTabsIds[i]}">
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
    //TODO
  }

  generateMonsterTab() {
    //TODO
  }
}

module.exports = HuntingQuestComponent;
