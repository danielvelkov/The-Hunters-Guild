import createPageMediator from 'js/common/mediator';
import {
  MONSTER_SELECT_FORMS_CHANGE,
  SELECTED_MONSTERS_CHANGE,
} from 'js/common/events.js';
import './create/player-comp.js';
import './create/preview.js';
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
