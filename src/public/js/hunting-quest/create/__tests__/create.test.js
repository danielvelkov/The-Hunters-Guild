import { screen, within } from '@testing-library/dom';
import '@testing-library/jest-dom';
import path from 'path';
import ejs from 'ejs';

import userEvent from '@testing-library/user-event';

import GameData from '@models/GameData';
import createSelect2Mock from '@tests/__mocks__/select2mock';
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
      title: 'Create Quest Post',
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

    createSelect2Mock(mockMonsters);
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
      name: /large monster/i,
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
      name: /large monster/i,
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
      name: /large monster/i,
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

  test('should disable submit button if quest details are invalid', async () => {
    const addMonsterButton = screen.getByRole('button', {
      name: /add monster/i,
    });

    await user.click(addMonsterButton);
    const questDetails = screen.getByRole('group', { name: /quest details/i });
    const submitButton = within(questDetails).getByRole('button', {
      name: /post/i,
    });

    expect(submitButton).not.toHaveAttribute('disabled');
    const tablist = screen.getByRole('tablist', { name: /player slot list/i });
    const tabHeadings = within(tablist).getAllByLabelText(/tab heading/i);
    const removeButton = within(tabHeadings[1]).getByRole('button');

    // Remove player slot
    await user.click(removeButton);
    expect(within(tablist).getAllByRole('tab')).toHaveLength(1); // Below minimumm

    expect(submitButton).toHaveAttribute('disabled');
  });

  describe('should display validation errors', () => {
    const clone1 = structuredClone(mockMonsters[0]);
    clone1.locales = ['Narnia'];
    const clone2 = structuredClone(mockMonsters[1]);
    clone2.locales = ['Afghanistan'];
    const mockInvalidMonsters = [clone1, clone2];

    beforeEach(async () => {
      // Override the serverData
      globalThis.serverData.monstersList = mockInvalidMonsters;

      // Re-render the EJS template with invalid monsters
      const htmlString = await ejs.renderFile(ejsViewPath, {
        title: 'Create Quest Post',
        monsters: mockInvalidMonsters, // Use invalid monsters here
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

      createSelect2Mock();
    });
    test('for incompatible monsters for a quest', async () => {
      const addMonsterButton = screen.getByRole('button', {
        name: /add monster/i,
      });

      await user.click(addMonsterButton);
      await user.click(addMonsterButton);

      const monsterSelects = screen.getAllByRole('combobox', {
        name: /large monster/i,
      });

      expect(screen.queryByLabelText(/quest errors/i)).not.toBeInTheDocument();

      selectSelect2Option(monsterSelects[0], mockInvalidMonsters[0].id);
      selectSelect2Option(monsterSelects[1], mockInvalidMonsters[1].id);

      const errors = screen.getByLabelText(/quest errors/i);
      expect(
        within(errors).getByText(
          /selected monsters do not exist in a common locale/i
        )
      ).toBeInTheDocument();
    });
  });
});
