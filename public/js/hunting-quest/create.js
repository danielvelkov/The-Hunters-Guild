import { createObservableArray } from '../common.js';
import { selectedMonstersChangeHandler } from './quest-details.js';
import { createMonsterDataForm } from './monster-form.js';

export function initiateCreatePageServerVariables(
  monsters,
  bonusQuestRewards,
  monstersDrops,
  skills,
) {
  monstersList = monsters;
  bonusQuestRewardsList = bonusQuestRewards;
  monstersDropsList = monstersDrops;
}

// Global variables for the create page
export let monstersList = [];
export let bonusQuestRewardsList = [];
export let monstersDropsList = [];
export let skillsList = [];
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
    .trigger({
      type: 'select2:select',
      params: {
        data: {
          id: 'EM0001_00_0',
        },
      },
    });
}, 100);
