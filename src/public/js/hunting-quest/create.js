import createPageMediator from 'js/common/mediator';
import {
  MONSTER_SELECT_FORMS_CHANGE,
  QUEST_DETAILS_FORM_CHANGE,
  SELECTED_MONSTERS_CHANGE,
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

createPageMediator.on(MONSTER_SELECT_FORMS_CHANGE, (monsterSelectForms) => {
  monstersForms = [...monsterSelectForms];
  selectedMonsters = [];
  for (const form of monsterSelectForms) {
    const formData = new FormData(form[0]);
    const monsterId = formData.get('monster');
    const selectedMonster = monstersList.find((m) => m.id === monsterId);
    if (selectedMonster) selectedMonsters.push(selectedMonster);
  }
  createPageMediator.trigger(SELECTED_MONSTERS_CHANGE, selectedMonsters);
});

let monstersForms = [];
let selectedMonsters = [];

const playerComp = new PlayerComp();

// Form submission handler
$('#quest-details-form').on('submit', (e) => {
  e.preventDefault();
  // TODO - create hunting quest post in db
});

createPageMediator.on(QUEST_DETAILS_FORM_CHANGE, (questDetailsForm) => {
  const questMonsters = [];
  monstersForms.forEach((monstersForm, index) => {
    const monsterFormData = new FormData(monstersForm[0]);
    if (monsterFormData.get('monster'))
      questMonsters.push(
        new QuestMonster(
          Monster.fromDatabaseObject(selectedMonsters[index]),
          monsterFormData.get('tempered')
            ? MonsterVariant.TEMPERED
            : monsterFormData.get('frenzied')
            ? MonsterVariant.FRENZIED
            : monsterFormData.get('arch-tempered')
            ? MonsterVariant.ARCH_TEMPERED
            : '',
          MonsterCrown[monsterFormData.get('monster-crown').toUpperCase()],
          +monsterFormData.get('monster-strength')
        )
      );
  });

  const questDetailsFormData = new FormData(questDetailsForm);

  const bonusRewardsIds = questDetailsFormData.get('bonus-rewards-enabled')
    ? questDetailsFormData.getAll('bonus-rewards[]')
    : [];
  const questBonusRewards = bonusRewardsIds.map(
    (id) =>
      new QuestBonusReward(
        Item.fromDatabaseObject(bonusQuestRewardsList.find((i) => i.id === id)),
        1
      )
  );

  const huntingQuest = HuntingQuestFormModel.fromFormData(
    questDetailsFormData,
    questMonsters,
    playerComp.playerSlots,
    questBonusRewards
  );

  let tabs = $('#quest-preview').find('.tabs').detach();
  tabs = null;

  $('#quest-preview').empty();
  if (huntingQuest.isValidForPreview()) {
    const component = new HuntingQuestComponent(huntingQuest);
    $('#quest-preview').append(component.render());
  }
});
