import {
  CROWN_SELECT_VISIBILITY_CHANGE,
  QUEST_DETAILS_FORM_CHANGE,
  SELECTED_MONSTERS_CHANGE,
} from 'js/common/events.js';
import { bonusQuestRewardsList } from '../create.js';
import createPageMediator from 'js/common/mediator';

const QuestDetailsForm = (() => {
  // Cache DOM elements
  const $form = $('#quest-details-form');
  const $crossPlayEnabled = $('#cross-play-enabled');
  const $platformOptions = $('#platform-options');
  const $bonusRewardsEnabled = $('#bonus-rewards-enabled');
  const $bonusRewards = $('#bonus-rewards');
  const $questCategory = $('#quest-category');
  const $locale = $('#locale');

  // Bind Events
  $crossPlayEnabled.on('click', handleCrossPlayCheckboxChange);
  $bonusRewardsEnabled.on('click', handleBonusRewardsCheckboxChange);
  $questCategory.on('change', handleQuestCategoryChange);

  // Subscribe to mediator events
  createPageMediator.on(SELECTED_MONSTERS_CHANGE, handleSelectedMonstersChange);

  $form.on('change', () => {
    createPageMediator.trigger(QUEST_DETAILS_FORM_CHANGE, $form[0]);
  });

  function handleCrossPlayCheckboxChange() {
    if (!$crossPlayEnabled.is(':checked')) {
      $platformOptions.show();
      $platformOptions.find('input').each((_, inputElem) => {
        $(inputElem).prop('disabled', false);
      });
    } else {
      $platformOptions.hide();
      $platformOptions.find('input').each((_, inputElem) => {
        $(inputElem).prop('disabled', true);
      });
    }
  }

  function handleBonusRewardsCheckboxChange() {
    if (!$bonusRewardsEnabled.is(':checked')) {
      $bonusRewards.next().hide();
      $bonusRewards.prop('disabled', true);
    } else {
      $bonusRewards.next().show();
      $bonusRewards.prop('disabled', false);
    }
  }

  function handleQuestCategoryChange(e) {
    const category = e.target.value;
    createPageMediator.trigger(
      CROWN_SELECT_VISIBILITY_CHANGE,
      category === 'Saved Investigation' || category === 'Field Survey'
    );
  }

  function handleSelectedMonstersChange(selectedMonsters) {
    if (selectedMonsters.length) {
      $form.show();
    } else {
      $form.hide();
    }

    selectedMonstersChangeHandler(selectedMonsters);
  }

  function selectedMonstersChangeHandler(selectedMonsters) {
    updateLocaleOptions(selectedMonsters);
    updateBonusRewards(selectedMonsters);
    $questCategory.trigger('change');
  }

  function updateLocaleOptions(selectedMonsters) {
    let monsterLocales = [];

    selectedMonsters.forEach((m) => {
      if (m) monsterLocales = monsterLocales.concat(m.locales);
    });

    // If two monsters are selected, show only common locales
    if (selectedMonsters.filter((m) => m).length === 2) {
      const localeCounts = {};
      monsterLocales.forEach((str) => {
        localeCounts[str] = (localeCounts[str] || 0) + 1;
      });

      // Filter strings that appear more than once
      monsterLocales = Object.keys(localeCounts).filter(
        (str) => localeCounts[str] > 1
      );
      if (monsterLocales.length === 0) {
        monsterLocales = ['-- No Common Locale --'];
      }
    }

    $locale.html(
      monsterLocales.map(
        (l, index) =>
          `<option ${index === 0 ? 'selected' : ''} value="${l}">${l}</option>`
      )
    );
  }

  function updateBonusRewards(selectedMonsters) {
    const questRewardsGroupsMap = {};

    bonusQuestRewardsList.forEach((qr) => {
      // Skip if monster is not in source
      if (
        qr.source &&
        selectedMonsters.every((m) => !qr.source.split(',').includes(m?.name))
      ) {
        return;
      }

      if (!questRewardsGroupsMap.hasOwnProperty(qr.type)) {
        questRewardsGroupsMap[qr.type] = [];
      }
      questRewardsGroupsMap[qr.type].push(qr);
    });

    // Build HTML for bonus rewards select
    $bonusRewards.html(
      Object.entries(questRewardsGroupsMap)
        .reverse()
        .map(([k, v]) => {
          let optGroupHTML = `<optgroup label="${k + 's'}"><option></option>`;
          optGroupHTML += v
            .sort((qr1, qr2) => qr1.rarity - qr2.rarity)
            .map(
              (qr) =>
                `<option data-icon="${
                  qr.icon === 'INVALID' ? 'ITEM_0001' : qr.icon
                }" data-color="${qr.iconColor}" value="${qr.id}">
          ${qr.name}
        </option>`
            )
            .join('');
          optGroupHTML += '</optgroup>';
          return optGroupHTML;
        })
        .join('')
    );

    // Initialize Select2 for bonus rewards
    $bonusRewards.select2({
      dropdownAutoWidth: true,
      multiple: true,
      placeholder: '-- Select Bonus Rewards --',
      templateResult: formatBonusRewardOption,
    });
  }

  // Public API
  return {
    selectedMonstersChangeHandler,
  };
})();

function formatBonusRewardOption(item) {
  if (item.element && item.text && item.id) {
    const iconPath = `url('../icons/Item Icons/${item.element?.dataset.icon}.png')`;
    return $(`
        <span class='bonus-select-name' style="display:flex; gap:0.5em; align-items:center;">
          <div class="item-img-container"
            data-icon-id="${item.id}"
            style="--item-color: var(--${item.element?.dataset.color}); --item-icon:${iconPath}">
            <img height='23' src="icons/Item Icons/${item.element?.dataset.icon}.png"/>
          </div>
          <b>${item.text}</b>
        </span>
      `);
  } else if (item.text) {
    return item.text;
  }
}

export default QuestDetailsForm;
