import {
  monstersForms,
  selectedMonsters,
  bonusQuestRewardsList,
  monstersDropsList,
} from './create.js';
import { getDmgColor, getQuestCategoryStyle } from '../common.js';

/**
 * Quest Preview Functionality
 * Handles rendering and updating the quest preview based on form inputs
 */

// Initialize preview update handler
$('#quest-preview').on('preview:update', updatePreview);

function updatePreview() {
  console.log('update preview');

  const questDetails = new FormData($('#quest-post-form')[0]);
  const monsterFormDataList = monstersForms
    .map((mf) => new FormData(mf[0]))
    .filter((fd) => fd.get('monster') != '');
  const selectedMonsterDetailsList = selectedMonsters.filter((m) => m);
  const bonusRewardsIds =
    $('#bonus-rewards-enabled').is(':checked') && $('#bonus-rewards').val()
      ? $('#bonus-rewards').val()
      : [];

  // Validate before proceeding
  if (
    monsterFormDataList.length === 0 ||
    monsterFormDataList.length !== selectedMonsterDetailsList.length
  ) {
    $('#quest-preview').html('');
    return;
  }

  // Generate quest title
  const questTitle = generateQuestTitle(
    questDetails,
    monsterFormDataList,
    selectedMonsterDetailsList
  );

  // Check if high rank quest
  const isHighRankQuest =
    questDetails.get('quest-star-rank') === 'HIGH' ||
    +questDetails.get('quest-star-rank') >= 4;

  // Generate HTML for preview
  const previewHTML = `
    <div id="tabs">
      <ul>
        <li><a href="#tabs-quest-details">Quest Details</a></li>
        ${selectedMonsterDetailsList
          .map((m, i) => `<li><a href="#tabs-monster-${i}">${m.name}</a></li>`)
          .join('')}
      </ul>
      <div id="tabs-quest-details">
        ${generateQuestDetailsTab(
          questDetails,
          questTitle,
          selectedMonsterDetailsList,
          monsterFormDataList,
          bonusRewardsIds
        )}
      </div>
      ${selectedMonsterDetailsList
        .map(
          (m, i) => `
        <div id="tabs-monster-${i}">
          ${generateMonsterTab(
            m,
            isHighRankQuest,
            monsterFormDataList[i],
            bonusRewardsIds
          )}
        </div>
      `
        )
        .join('')}
    </div>
  `;

  // Update preview and initialize tabs
  $('#quest-preview').html(previewHTML);
  $('#tabs').tabs();
}

function generateQuestTitle(
  questDetails,
  monsterFormDataList,
  selectedMonsterDetailsList
) {
  let questTitle = `${questDetails.get('quest-type')} `;

  if (selectedMonsterDetailsList.length === 1) {
    const monsterName = formatMonsterName(
      monsterFormDataList[0],
      selectedMonsterDetailsList[0]
    );
    questTitle = questTitle + 'the ' + monsterName;
  } else {
    const monsterNames = monsterFormDataList.map((md, index) => {
      return formatMonsterName(md, selectedMonsterDetailsList[index]);
    });

    if (monsterNames.every((mn) => mn === monsterNames[0])) {
      questTitle = questTitle + monsterNames.length + ' ' + monsterNames[0];
    } else {
      questTitle = questTitle + monsterNames.join(' & ');
    }
  }

  return questTitle;
}

function formatMonsterName(monsterFormData, monster) {
  return `${monsterFormData.get('tempered') === 'on' ? 'Tempered ' : ''}${
    monsterFormData.get('frenzied') === 'on' ? 'Frenzied ' : ''
  }${monsterFormData.get('arch-tempered') === 'on' ? 'Arch-Tempered ' : ''}${
    monster.name
  }`.trim();
}

function generateQuestDetailsTab(
  questDetails,
  questTitle,
  selectedMonsterDetailsList,
  monsterFormDataList,
  bonusRewardsIds
) {
  return `
    <table class="themetable" width="100%" align="center">
      <tbody>
        <tr>
          <th colspan="2" style="${getQuestCategoryStyle(
            questDetails.get('quest-category')
          )}">${questDetails.get('quest-category')}</th>
          <th colspan="3" align="right">${questDetails.get('quest-star-rank')}${
    questDetails.get('quest-star-rank') > 1
      ? [...new Array(+questDetails.get('quest-star-rank'))]
          .map((star) => '⭐')
          .join('')
      : '⭐'
  }</th>
        </tr>
        <tr>
          <th rowspan="2">Monsters:</th>
          <th colspan="3" >
            <div class="flex-row" style="justify-content:center;">
            ${selectedMonsterDetailsList
              .map(
                (m, index) =>
                  `<div class="flex-col" style="position:relative;">
                ${
                  monsterFormDataList[index].has('monster-crown') &&
                  monsterFormDataList[index].get('monster-crown') !== 'Base'
                    ? `<img height='25' title="${monsterFormDataList[index].get(
                        'monster-crown'
                      )}"
                src="icons/${monsterFormDataList[index]
                  .get('monster-crown')
                  .toLowerCase()}-crown.png"
                style="position:absolute; z-index: 1; top:0px; right:-10px;filter: drop-shadow(1px 1px 1px #222)
                drop-shadow(-1px -1px 1px #222) drop-shadow(-1px 1px 0px #222) drop-shadow(1px -1px 0px #222);">`
                    : ''
                }

                <img height='75' title="${m.name}"
                  class="monster-image
                  ${
                    monsterFormDataList[index].get('tempered') === 'on'
                      ? 'tempered-outline'
                      : ''
                  }
                  ${
                    monsterFormDataList[index].get('frenzied') === 'on'
                      ? 'frenzied-outline'
                      : ''
                  }"
                  src="icons/Large Monster Icons/${m.icon}.png"/>
                  <span style="margin-top:-1em; font-size:0.65em;">${'✨'.repeat(
                    +monsterFormDataList[index].get('monster-strength')
                  )}</span>
                </div>`
              )
              .join('')}
            </div>
          </th>
        </tr>
        <tr>
          <th colspan="3">${questTitle}</th>
        </tr>
        <tr>
          <th>Bonus Rewards:</th>
          <td colspan="3">
            <div class='flex-row' style="gap:0em; align-items:center;">
              ${generateBonusRewards(bonusRewardsIds)}
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
          <td>${questDetails.get('hunter-rank-requirement')}+</td>
          <td rowspan="3">
            ${generateRecommendedSkills(selectedMonsterDetailsList)}
          </td>
        </tr>
        <tr>
          <th>Area:</th>
          <td>${questDetails.get('locale')}</td>
        </tr>
        <tr>
          <th>Time Limit:</th>
          <td>${questDetails.get('time-limit')} mins</td>
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

function generateBonusRewards(bonusRewardsIds) {
  if (!bonusRewardsIds || bonusRewardsIds.length === 0) {
    return '';
  }

  return bonusRewardsIds
    .map((id) => {
      const bonusItem = bonusQuestRewardsList.find((qr) => qr.id === id);
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
        }.png" />
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

function generateRecommendedSkills(selectedMonsterDetailsList) {
  return selectedMonsterDetailsList
    .map((m) => m.special_attacks.map((sa) => sa.skill_counters).flat())
    .flat()
    .map((s) => {
      const skillDiv = $('<div>').addClass('flex-row');
      skillDiv.append(
        `<img src="icons/Skill Icons/${s.icon}.png" height="23" alt="Skill_Icon"/> <span>${s.name}</span>`
      );
      return skillDiv.prop('outerHTML');
    })
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join('');
}

function generateMonsterTab(
  monster,
  isHighRankQuest,
  monsterFormData,
  bonusRewardsIds
) {
  return `
    <h2>${monster.name}</h2>
    <div style="display:flex;justify-content: space-between;flex-wrap: wrap;">
      <div>
        <h3>Damage Effectiveness</h3>
        ${generateDamageEffectivenessTable(monster)}
      </div>
      <div>
        <h3>Status Effectiveness</h3>
        ${generateStatusEffectivenessTable(monster)}
      </div>
      <div>
        <h3>Item Effectiveness</h3>
        ${generateItemEffectivenessTable(monster)}
      </div>
    </div>

    <h3>Drop Rates ${isHighRankQuest ? '(High Rank)' : '(Low Rank)'}</h3>
    ${createMonsterDropsSection(
      monster.name,
      isHighRankQuest ? 'HIGH' : 'LOW',
      monsterFormData.get('tempered') === 'on',
      bonusRewardsIds
    )}
    <p><i>* Some tables are grayed about because the rewards will not be present.
      Add Bonus rewards from the 'Monster Material' or 'Rare Drops' groups in the Quest Details form.</i></p>
  `;
}

function generateDamageEffectivenessTable(monster) {
  return `
    <table style="width:fit-content;" class="dmg-effectiveness-table">
      <tbody align="center">
        <tr>
          <th align="left">Part</th>
          <th><img height="20" src="icons/slash.png" alt="Slash"></th>
          <th><img height="20" src="icons/blow.png" alt="Blow"></th>
          <th><img height="20" src="icons/shot.png" alt="Shot"></th>
          <th><img height="20" src="icons/Status Icons/STATUS_0000.png" title="Fire" alt="Fire"></th>
          <th><img height="20" src="icons/Status Icons/STATUS_0001.png" title="Water" alt="Water"></th>
          <th><img height="20" src="icons/Status Icons/STATUS_0002.png" title="Thunder" alt="Thunder"></th>
          <th><img height="20" src="icons/Status Icons/STATUS_0003.png" title="Ice" alt="Ice"></th>
          <th><img height="20" src="icons/Status Icons/STATUS_0004.png" title="Dragon" alt="Dragon"></th>
          <th><img height="20" src="icons/Status Icons/STATUS_0008.png" title="KO" alt="KO"></th>
          <th><img height="20" src="icons/Status Icons/STATUS_0047.png" title="Flash" alt="Flash"></th>
        </tr>
        ${monster.part_dmg_effectiveness
          .map((de) => {
            let tableRow = '<tr>';
            tableRow = tableRow.concat(
              `<td align="left"><img height="20" src="icons/Item Icons/${de.icon}.png"/> <b>${de.name}</b></td>`
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

function generateStatusEffectivenessTable(monster) {
  return `
    <table class="dmg-effectiveness-table">
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
              `<td align="left"><img height="20" src="icons/Status Icons/${se.icon}.png"/> <b>${se.name}</b></td>`
            );
            tableRow.append(`<td>${se.stats.value}</td>`);
            return tableRow.prop('outerHTML');
          })
          .join('')}
      </tbody>
    </table>
  `;
}

function generateItemEffectivenessTable(monster) {
  return `
    <table class="dmg-effectiveness-table">
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
                <img height="20" src="icons/Item Icons/${ie.icon}.png"/>
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

function createMonsterDropsSection(monster, rank, isTempered, bonusRewardsIds) {
  const dropsSection = $('<section>').addClass('drop-tables');
  const monsterDrops = groupMonsterDrops(monster);
  const bonusRewards = bonusRewardsIds.map((id) =>
    bonusQuestRewardsList.find((qr) => qr.id === id)
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

    const titleRow = $('<tr>').append(`<th colspan="100%">${rewardType}</th>`);
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
                <img height='23' src="icons/Item Icons/${p.brokenPartIcon}.png"/>
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
        <td title="${'Rarity: ' + p.rarity + '\n' + p.description}">
          <div style="display:flex; gap:0.5em; align-items:center;">
            <div class="item-img-container"
              data-icon-id="${p.icon}"
              style="--item-icon:${itemIconPath}; --item-color: var(--${
        p.iconColor
      });">
              <img height='23' src="icons/Item Icons/${p.icon}.png" />
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

function groupMonsterDrops(monster) {
  const monsterDrops = monstersDropsList.filter((md) => md.source === monster);
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
