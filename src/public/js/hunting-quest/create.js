import { selectedMonstersChangeHandler } from './create/quest-details.js';
import './create/player-comp.js';
import './create/preview.js';
import Mediator from 'js/common/mediator';
import './create/monster-select-forms.js';
import { MONSTER_SELECT_FORMS_CHANGE } from 'js/common/events.js';

import 'css/pages/hunting-quest/create.css';

export const {
  monstersList,
  bonusQuestRewardsList,
  monstersDropsList,
  skillsList,
  weaponTypesList,
  weaponAttributesList,
  systemLoadoutsList,
} = globalThis.serverData;

export const createPageMediator = new Mediator();

createPageMediator.on(MONSTER_SELECT_FORMS_CHANGE, (monsterSelectForms) => {
  monstersForms = [...monsterSelectForms];
  selectedMonsters = [];
  for (const form of monsterSelectForms) {
    const formData = new FormData(form[0]);
    const monsterId = formData.get('monster');
    const selectedMonster = monstersList.find((m) => m.id === monsterId);
    if (selectedMonster) selectedMonsters.push(selectedMonster);
  }
  if (selectedMonsters.length) $('#quest-post-form').show();
  else $('#quest-post-form').hide();
  selectedMonstersChangeHandler();
});

export let monstersForms = [];
export let selectedMonsters = [];

// Form submission handler
$('#quest-post-form').on('submit', (e) => {
  e.preventDefault();
  selectedMonsters.forEach((m, index) => {
    console.log('Selected Monster data:');
    console.log(m);
    console.log('Monster Details Form data:');
    console.log(new FormData(monstersForms[index][0]));
  });
  console.log('Quest Details form data:');
  console.log(new FormData(e.target));
  // TODO - create hunting quest post in db
});

// Update preview when any form changes
$('#quest-post-form').on('change', () =>
  $('#quest-preview').trigger('preview:update')
);
