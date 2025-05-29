import { screen } from '@testing-library/dom';
import '@testing-library/jest-dom';
import path from 'path';
import ejs from 'ejs';

import userEvent from '@testing-library/user-event';

import GameData from '@models/GameData';

// This tells Jest to use the mock from __mocks__/gamedata.js
jest.mock('@models/GameData');

const ejsViewPath = path.resolve(
  process.cwd(),
  'src/views/pages/hunting-quest/create.ejs'
);

const mockMonsters = GameData.monsters__weakness_and_icons_ListGet();
const mockWeapons = GameData.weapon_types_ListGet();
const mockAttributes = GameData.weapon_attributes_ListGet();
const mockSkills = GameData.skills_ListGet();
const mockQuestRewards = GameData.bonus_quest_rewards__ListGet();
const mockDrops = GameData.monsters_drops__ListGet();
const mockLoadouts = GameData.system_loadouts_ListGet();

describe('create page', () => {
  const user = userEvent.setup();
  beforeEach(async () => {
    jest.resetModules();

    // Set up globalThis.serverData for scripts
    globalThis.serverData = {
      monstersList: mockMonsters,
      bonusQuestRewardsList: mockQuestRewards,
      monstersDropsList: mockDrops,
      skillsList: mockSkills,
      weaponTypesList: mockWeapons,
      weaponAttributesList: mockAttributes,
      systemLoadoutsList: mockLoadouts,
    };

    const htmlString = await ejs.renderFile(ejsViewPath, {
      title: 'Mock',
      monsters: mockMonsters,
      weaponAttributes: mockAttributes,
      weaponTypes: mockWeapons,
      skills: mockSkills,
      bonusQuestRewards: mockQuestRewards,
      monstersDrops: mockDrops,
      systemLoadouts: mockLoadouts,
    });

    document.body.innerHTML = htmlString;

    jest.isolateModules(() => {
      require('js/hunting-quest/create');
    });
  });
  test('loads with monster select forms', async () => {
    const addMonsterButton = screen.getByRole('button', {
      name: /add monster/i,
    });

    await user.click(addMonsterButton);
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  test('selecting a monster updates quest preview', async () => {
    // TBD
  });
  test('selecting a monster displays quest details form', () => {
    // TBD
  });
});
