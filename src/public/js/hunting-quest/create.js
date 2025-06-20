import createPageMediator from 'js/common/mediator';
import {
  MONSTER_SELECT_FORMS_CHANGE,
  QUEST_DETAILS_FORM_CHANGE,
  SELECTED_MONSTERS_CHANGE,
  QUEST_PLAYER_SLOTS_CHANGE,
  QUEST_PREVIEW_CHANGE,
  QUEST_FORM_SUBMIT,
} from 'js/common/events.js';
import PlayerComp from './create/player-comp.js';
import './create/monster-select-forms.js';
import './create/quest-details-form.js';

import 'css/pages/hunting-quest/create.css';

import Monster from 'entities/game-data/Monster.js';
import Item from 'entities/game-data/Item.js';
import MonsterDrop from 'entities/game-data/MonsterDrop.js';
import Skill from 'entities/game-data/Skill.js';
import WeaponType from 'entities/game-data/WeaponType.js';
import WeaponAttribute from 'entities/game-data/WeaponAttribute.js';
import { Loadout } from 'entities/Loadout.js';
import HuntingQuestFormModel from './create/HuntingQuestFormModel.js';
import QuestMonster from 'entities/QuestMonster.js';
import QuestBonusReward from 'entities/QuestBonusRewards.js';
import HuntingQuestComponent from './components/HuntingQuestComponent';
import MonsterCrown from 'entities/game-data/MonsterCrown.js';
import MonsterVariant from 'entities/game-data/MonsterVariant.js';

import HuntingQuestBuilder from './create/HuntingQuestBuilder.js';
import { snakeCaseToTitleCase } from 'js/common/util.js';
/**
 * @type {{
 *   monstersList: Array<Monster>,
 *   bonusQuestRewardsList: Array<Item>,
 *   monstersDropsList: Array<MonsterDrop>,
 *   skillsList: Array<Skill>,
 *   weaponTypesList: Array<WeaponType>,
 *   weaponAttributesList: Array<WeaponAttribute>,
 *   systemLoadoutsList: Array<Loadout>
 * }}
 */
export const {
  monstersList,
  bonusQuestRewardsList,
  monstersDropsList,
  skillsList,
  weaponTypesList,
  weaponAttributesList,
  systemLoadoutsList,
} = globalThis.serverData;

const questBuilder = new HuntingQuestBuilder();
const playerComp = new PlayerComp();

questBuilder.setPlayerSlots(playerComp.playerSlots);

createPageMediator.on(MONSTER_SELECT_FORMS_CHANGE, (monsterSelectForms) => {
  const monstersForms = Array.from(monsterSelectForms);
  const selectedMonsters = [];

  for (const form of monstersForms) {
    const formData = new FormData(form[0]);
    const monsterId = formData.get('monster');
    const selectedMonster = monstersList.find((m) => m.id === monsterId);
    if (selectedMonster) selectedMonsters.push(selectedMonster);
  }

  createPageMediator.trigger(SELECTED_MONSTERS_CHANGE, selectedMonsters);

  const questMonsters = buildQuestMonstersFromForms(
    monstersForms,
    selectedMonsters
  );
  questBuilder.setQuestMonsters(questMonsters);
});

createPageMediator.on(QUEST_DETAILS_FORM_CHANGE, (questDetailsForm) => {
  const questDetailsFormData = new FormData(questDetailsForm);

  const questDetails = extractQuestDetailsFromForm(questDetailsFormData);
  questBuilder.setQuestDetails(questDetails);

  const bonusRewards = extractBonusRewardsFromForm(questDetailsFormData);
  questBuilder.setBonusRewards(bonusRewards);
});

createPageMediator.on(QUEST_PLAYER_SLOTS_CHANGE, (playerSlots) => {
  questBuilder.setPlayerSlots(playerSlots);
});

createPageMediator.on(QUEST_PREVIEW_CHANGE, (quest) => {
  updateQuestPreview(quest);
});

createPageMediator.on(QUEST_FORM_SUBMIT, () => {
  const huntingQuest = questBuilder.buildHuntingQuest();
  if (huntingQuest && huntingQuest.isValid()) {
    fetch('/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(huntingQuest),
    }).then(async (response) => {
      const contentType = response.headers.get('content-type');
      if (
        !response.ok &&
        contentType &&
        contentType.includes('application/json')
      ) {
        // Handle server-side validation errors
        const errors = {};
        const data = await response.json();

        data?.errors.forEach((e) => (errors[e.path] = e.msg));

        if (errors) displayValidationErrors(errors);
      } else if (response.redirected) window.location.href = response.url;
    });
  }
});

/**
 * Build quest monsters from monster select forms
 */
function buildQuestMonstersFromForms(monsterSelectForms, selectedMonsters) {
  const questMonsters = [];

  monsterSelectForms.forEach((form, index) => {
    const formData = new FormData(form[0]);
    if (formData.get('monster') && selectedMonsters[index]) {
      questMonsters.push(
        new QuestMonster(
          Monster.fromDatabaseObject(selectedMonsters[index]),
          getMonsterVariant(formData),
          MonsterCrown[formData.get('monster-crown')?.toUpperCase()] ||
            MonsterCrown.NONE,
          +formData.get('monster-strength') || 1
        )
      );
    }
  });

  return questMonsters;
}

function getMonsterVariant(formData) {
  if (formData.get('tempered')) return MonsterVariant.TEMPERED;
  if (formData.get('frenzied')) return MonsterVariant.FRENZIED;
  if (formData.get('arch-tempered')) return MonsterVariant.ARCH_TEMPERED;
  return '';
}

function extractQuestDetailsFromForm(questDetailsFormData) {
  const details = {};

  for (const [key, value] of questDetailsFormData.entries()) {
    if (!key.includes('bonus-rewards')) {
      if (details[key]) {
        // Handle multiple values for same key
        if (!Array.isArray(details[key])) {
          details[key] = [details[key]];
        }
        details[key].push(value);
      } else {
        details[key] = value;
      }
    }
  }
  return details;
}

function extractBonusRewardsFromForm(formData) {
  const bonusRewardsIds = formData.get('bonus-rewards-enabled')
    ? formData.getAll('bonus-rewards[]')
    : [];

  return bonusRewardsIds.map(
    (id) =>
      new QuestBonusReward(
        Item.fromDatabaseObject(bonusQuestRewardsList.find((i) => i.id === id)),
        1
      )
  );
}

/**
 * Update the quest preview display
 * @param {HuntingQuestFormModel} huntingQuest
 */
function updateQuestPreview(huntingQuest) {
  // Have to detach for tests to work
  $('#quest-preview').find('.tabs')?.detach();
  $('#quest-preview').empty();

  if (huntingQuest && huntingQuest.isValidForPreview()) {
    const component = new HuntingQuestComponent(
      huntingQuest,
      monstersDropsList
    );
    $('#quest-preview').append(component.render());
  }

  // Display validation errors if any
  if (huntingQuest && !huntingQuest.isValid()) {
    displayValidationErrors(huntingQuest.getValidationErrors());
  }
}

/**
 * Display validation errors
 */
function displayValidationErrors(errors) {
  let errorsSection = $('.errors-list');
  if (!errorsSection.length)
    errorsSection = $('<section>')
      .addClass('errors-list')
      .attr('aria-label', 'quest errors')
      .appendTo($('#quest-preview'));
  errorsSection.empty();
  const errorHeading = $('<h3>').text(
    '⚠ Please correct the following validation errors for the post:'
  );
  const errorsList = $('<ul>');

  errorsList.append(
    Object.entries(errors).map(([key, value]) =>
      $('<li>').html(`<b>${snakeCaseToTitleCase(key)}</b> - ${value}`)
    )
  );

  errorsSection.append(errorHeading, errorsList);
}
