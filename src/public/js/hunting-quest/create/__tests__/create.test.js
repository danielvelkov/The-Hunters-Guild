import { screen, within } from '@testing-library/dom';
import '@testing-library/jest-dom';
import path from 'path';
import ejs from 'ejs';

import userEvent from '@testing-library/user-event';

import GameData from '@models/GameData';
import { selectSelect2Option } from '@tests/helper';

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
  test('loads with monster select forms on "add monster" button click', async () => {
    const addMonsterButton = screen.getByRole('button', {
      name: /add monster/i,
    });

    await user.click(addMonsterButton);
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  test('clicking on the "add monster" button selects a monster by default and shows quest preview', async () => {
    const addMonsterButton = screen.getByRole('button', {
      name: /add monster/i,
    });

    expect(
      screen.queryByRole('tabpanel', { name: /quest details/i })
    ).not.toBeInTheDocument();
    await user.click(addMonsterButton);
    expect(
      screen.getByRole('tabpanel', { name: /quest details/i })
    ).toBeInTheDocument();
  });

  test('selecting a monster updates quest preview to match the new monster', async () => {
    const addMonsterButton = screen.getByRole('button', {
      name: /add monster/i,
    });

    await user.click(addMonsterButton);
    const activePanel = screen.getByRole('tabpanel', {
      name: /quest details/i,
    });

    expect(
      within(activePanel).getByRole('heading', {
        level: 3,
        name: new RegExp(mockMonsters[0].name, 'i'),
      })
    );

    const monsterSelect = screen.getByRole('combobox', {
      name: /monster/i,
    });

    selectSelect2Option(monsterSelect, mockMonsters[1].id);

    expect(
      within(activePanel).findByRole('heading', {
        level: 3,
        name: new RegExp(mockMonsters[1].name, 'i'),
      })
    );
  });
  test('selecting a quest monster displays quest details form', async () => {
    const addMonsterButton = screen.getByRole('button', {
      name: /add monster/i,
    });

    await user.click(addMonsterButton);
    const monsterSelect = screen.getByRole('combobox', {
      name: /monster/i,
    });
    selectSelect2Option(monsterSelect, mockMonsters[1].id);
    expect(
      screen.getByRole('group', { name: /quest details/i })
    ).toBeInTheDocument();
  });

  test('removing all selected monsters hides preview and quest details', async () => {
    const addMonsterButton = screen.getByRole('button', {
      name: /add monster/i,
    });

    await user.click(addMonsterButton);
    const monsterSelect = screen.getByRole('combobox', {
      name: /monster/i,
    });
    selectSelect2Option(monsterSelect, mockMonsters[1].id);

    expect(
      screen.getByRole('group', { name: /quest details/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('tabpanel', {
        name: /quest details/i,
      })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /remove/i }));
    expect(
      screen.queryByRole('group', { name: /quest details/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('tabpanel', {
        name: /quest details/i,
      })
    ).not.toBeInTheDocument();
  });
});
