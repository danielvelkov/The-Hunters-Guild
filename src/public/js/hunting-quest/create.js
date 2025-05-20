import { createMonsterDataForm } from './create/monster-form.js';
import { selectedMonstersChangeHandler } from './create/quest-details.js';
import { createObservableArray } from '../common/common.js';
import './create/player-comp.js';
import './create/preview.js';

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
// Global variables for the create page
// export let monstersList = [];
// export let bonusQuestRewardsList = [];
// export let monstersDropsList = [];
// export let skillsList = [];
// export let weaponTypesList = [];
// export let weaponAttributesList = [];
// export let systemLoadoutsList = [];
export const monstersForms = [];
export const selectedMonsters = createObservableArray(
  [],
  selectedMonstersChangeHandler
);

// Add monster button handler
$('#add-monster-button').click((e) => {
  if (monstersForms.length === 2) return;
  $('#monster-forms').append(() => createMonsterDataForm());
});

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

// Add a monster form when the page loads
$('#add-monster-button').trigger('click');

// Initialize the first monster for debugging
// Can be removed in production
setTimeout(() => {
  $('#monster-select-0')
    .val('EM0001_00_0')
    .trigger('change')
    .trigger({
      type: 'select2:select',
      params: {
        data: {
          id: 'EM0001_00_0',
        },
      },
    });
}, 100);
