import {
  monstersForms,
  selectedMonsters,
  bonusQuestRewardsList,
} from '../create.js';

// Display Platform options depending on whether 'Cross-play' disabled
$('#cross-play-enabled').on('click', function () {
  if (!$(this).is(':checked')) {
    $('#platform-options').show();
    $('#platform-options * input').each((_, inputElem) =>
      $(inputElem).prop('disabled', false)
    );
  } else {
    $('#platform-options').hide();
    $('#platform-options * input').each((_, inputElem) =>
      $(inputElem).prop('disabled', true)
    );
  }
});

// Display Bonus Rewards depending on whether 'Bonus Rewards' enabled
$('#bonus-rewards-enabled').on('click', function () {
  if (!$(this).is(':checked')) {
    $('#bonus-rewards').next().hide();
    $('#bonus-rewards').prop('disabled', true);
  } else {
    $('#bonus-rewards').next().show();
    $('#bonus-rewards').prop('disabled', false);
  }
});

// Quest category change handler
$('#quest-category').on('change', (e) => {
  const category = e.target.value;
  monstersForms.forEach((mf) => {
    const monsterCrownSelect = mf.find('.monster-crown');
    const label = mf.find('.monster-crown-label');

    if (category === 'Saved Investigation' || category === 'Field Survey') {
      label.show();
      monsterCrownSelect.show();
      monsterCrownSelect.prop('disabled', false);
    } else {
      label.hide();
      monsterCrownSelect.hide();
      monsterCrownSelect.prop('disabled', true);
    }
  });
});

// Handler for when selected monsters change
export function selectedMonstersChangeHandler() {
  updateLocaleOptions();
  updateBonusRewards();
  $('#quest-category').trigger('change');
}

function updateLocaleOptions() {
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
    if (monsterLocales.length === 0)
      monsterLocales = ['-- No Common Locale --'];
  }

  $('#locale').html(
    monsterLocales.map(
      (l, index) =>
        `<option ${index === 0 ? 'selected' : ''} value="${l}">${l}</option>`
    )
  );
}

function updateBonusRewards() {
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
  $('#bonus-rewards').html(
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
  $('#bonus-rewards').select2({
    dropdownAutoWidth: true,
    multiple: true,
    placeholder: '-- Select Bonus Rewards --',
    templateResult: formatBonusRewardOption,
  });
}

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
