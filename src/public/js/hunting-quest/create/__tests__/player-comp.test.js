import path from 'path';
import ejs from 'ejs';
import { fireEvent, screen, waitFor, within } from '@testing-library/dom';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import GameData from '@models/GameData';
import { selectSelect2Option } from '@tests/helper';
import { QUEST_PLAYER_SLOTS_CHANGE } from 'js/common/events';

import createSelect2Mock from '@tests/__mocks__/select2mock';

// This tells Jest to use the mock from __mocks__/gamedata.js
jest.mock('@models/GameData');

const ejsViewPath = path.resolve(
  process.cwd(),
  'src/views/components/hunting-quest/player-comp.ejs'
);

const mockMonsters = GameData.monsters__weakness_and_icons_ListGet();
const mockWeapons = GameData.weapon_types_ListGet();
const mockAttributes = GameData.weapon_attributes_ListGet();
const mockSkills = GameData.skills_ListGet();
const mockLoadouts = GameData.system_loadouts_ListGet();

describe('player composition section', () => {
  let PlayerComp;
  let select2Mock;
  let user = userEvent.setup();
  const mockMediator = {
    trigger: jest.fn(),
    on: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetModules();

    const htmlString = await ejs.renderFile(ejsViewPath, {
      weaponAttributes: mockAttributes,
      weaponTypes: mockWeapons,
      skills: mockSkills,
      systemLoadouts: mockLoadouts,
    });

    document.body.innerHTML = htmlString;

    jest.doMock('js/hunting-quest/create', () => ({
      weaponAttributesList: mockAttributes,
      weaponTypesList: mockWeapons,
      skillsList: mockSkills,
      systemLoadoutsList: mockLoadouts,
    }));
    jest.doMock('js/common/mediator', () => mockMediator);

    jest.isolateModules(() => {
      ({
        default: PlayerComp,
      } = require('js/hunting-quest/create/player-comp'));
    });

    new PlayerComp();
    select2Mock = createSelect2Mock(mockMonsters);
  });

  afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
  });

  test('should show player slots group with a tablist of slots', async () => {
    const partyCompGroup = screen.getByRole('group', { name: /party comp/i });
    expect(
      within(partyCompGroup).getByRole('tablist', { name: /player slot list/i })
    ).toBeInTheDocument();
  });
  test('should have a tablist with two added slots set by default', async () => {
    const tablist = screen.getByRole('tablist', { name: /player slot list/i });
    expect(within(tablist).getAllByRole('tab')).toHaveLength(2);
  });

  test('should show add slot button', async () => {
    expect(
      screen.getByRole('button', { name: /add slot/i })
    ).toBeInTheDocument();
  });

  test('should add another slot on "add slot" button click', async () => {
    const tablist = screen.getByRole('tablist', { name: /player slot list/i });

    expect(within(tablist).getAllByRole('tab')).toHaveLength(2);

    const addSlotButton = within(tablist).getByRole('button', {
      name: /add slot/i,
    });

    fireEvent.click(addSlotButton);

    expect(
      within(
        screen.getByRole('tablist', { name: /player slot list/i })
      ).getAllByRole('tab')
    ).toHaveLength(3);
  });

  test('should remove "add slot" button on max allowed slots reached (4)', async () => {
    const addSlotButton = screen.getByRole('button', { name: /add slot/i });

    await user.click(addSlotButton); // 3
    await user.click(addSlotButton); // 4 (MAX REACHED)

    expect(addSlotButton).not.toBeInTheDocument();
  });

  test('should have remove button inside tab headings for slots other than the first', async () => {
    const tablist = screen.getByRole('tablist', { name: /player slot list/i });
    const tabHeadings = within(tablist).getAllByLabelText(/tab heading/i);

    expect(
      within(tabHeadings[0]).queryByRole('button')
    ).not.toBeInTheDocument();
    expect(within(tabHeadings[1]).queryByRole('button')).toBeInTheDocument();
  });

  test('should remove player slot on remove button click', async () => {
    const tablist = screen.getByRole('tablist', { name: /player slot list/i });
    const tabHeadings = within(tablist).getAllByLabelText(/tab heading/i);
    const removeButton = within(tabHeadings[1]).getByRole('button');

    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(within(tablist).getAllByRole('tab')).toHaveLength(1);
    });
  });

  test('should fire PLAYER_SLOT_CHANGE on add/remove slot', async () => {
    const createPageMediator = jest.requireMock('js/common/mediator');
    const spy = jest.spyOn(createPageMediator, 'trigger');

    const addSlotButton = screen.getByRole('button', { name: /add slot/i });

    await user.click(addSlotButton);

    expect(spy).toHaveBeenNthCalledWith(
      1,
      QUEST_PLAYER_SLOTS_CHANGE,
      expect.anything()
    );

    const tablist = screen.getByRole('tablist', { name: /player slot list/i });
    const tabHeadings = within(tablist).getAllByLabelText(/tab heading/i);
    const removeButton = within(tabHeadings[1]).getByRole('button');

    await user.click(removeButton);

    expect(spy).toHaveBeenNthCalledWith(
      2,
      QUEST_PLAYER_SLOTS_CHANGE,
      expect.anything()
    );
  });

  test('should display two slot config tabs', async () => {
    const tablist = screen.getByRole('tablist', { name: /slot config tabs/i });
    const tabLinks = within(tablist).getAllByRole('link');
    expect(tabLinks).toHaveLength(2);
    expect(tabLinks[0].textContent).toContain('Loadouts');
    expect(tabLinks[1].textContent).toContain('Custom');
  });

  test.skip('should display a form containing slot config data on tab "Custom" selection', async () => {
    const tablist = screen.getByRole('tablist', { name: /slot config tabs/i });
    const CustomTabLink = within(tablist).getByRole('link', {
      name: /custom/i,
    });
    expect(within(tablist).queryByRole('form')).not.toBeInTheDocument();

    await user.click(CustomTabLink);
    /**
     * NOTE
     *
     * This will not work. Idk why but jquery widgets methods do
     * not work in the jsdom. No aria, not additional functionality. Nada.
     * The classes and everything, its like nothing happened
     */
    // expect(within(tablist).getByRole('form')).toBeInTheDocument();
  });

  test.skip('should update current selected player slot details on "custom" tab form change', async () => {
    // TODO - mock the tabs element somehow
  });

  test('should show searchbox and loadout list containing system loadouts', async () => {
    const tablist = screen.getByRole('tablist', { name: /slot config tabs/i });
    const LoadoutsTabLink = within(tablist).getByRole('link', {
      name: /loadouts/i,
    });

    await user.click(LoadoutsTabLink);

    expect(
      within(tablist).getByRole('search', { name: /loadouts search/i })
    ).toBeInTheDocument();
    expect(
      within(tablist).getByLabelText(/loadouts list/i)
    ).toBeInTheDocument();
    expect(within(tablist).getAllByLabelText(/Loadout: /i)).toHaveLength(
      mockLoadouts.length
    );
  });
  describe('loadouts search should filter loadouts', () => {
    test('on loadout title specified', async () => {
      const tablist = screen.getByRole('tablist', {
        name: /slot config tabs/i,
      });

      const search = within(tablist).getByRole('search', {
        name: /loadouts search/i,
      });

      expect(within(tablist).getAllByLabelText(/Loadout: /i)).toHaveLength(
        mockLoadouts.length
      );
      await user.type(search, mockLoadouts[0].name);

      await waitFor(async () => {
        expect(within(tablist).getAllByLabelText(/Loadout: /i)).toHaveLength(
          (await mockLoadouts).filter((l) => l.name === mockLoadouts[0].name)
            .length
        );
      });
    });
  });
  test('should filter system loadouts on ROLE BUTTON select', async () => {
    const tablist = screen.getByRole('tablist', {
      name: /slot config tabs/i,
    });
    const TankRoleFilterButton = screen.getByLabelText(/filter.*Tank/i);
    const DPSRoleFilterButton = screen.getByLabelText(/filter.*DPS/i);
    const AnyRoleFilterButton = screen.getByLabelText(/filter.*Any/i);
    expect(within(tablist).getAllByLabelText(/Loadout: /i)).toHaveLength(
      mockLoadouts.length
    );

    // Tank Role
    await user.click(TankRoleFilterButton);
    await waitFor(async () => {
      expect(within(tablist).queryAllByLabelText(/Loadout: /i)).toHaveLength(
        (await mockLoadouts).filter((l) =>
          l.roles
            .map((r) => r.name)
            .includes(TankRoleFilterButton.textContent.trim())
        ).length
      );
    });

    // DPS Role
    await user.click(DPSRoleFilterButton);
    await waitFor(async () => {
      expect(within(tablist).getAllByLabelText(/Loadout: /i)).toHaveLength(
        (await mockLoadouts).filter((l) =>
          l.roles
            .map((r) => r.name)
            .includes(DPSRoleFilterButton.textContent.trim())
        ).length
      );
    });

    // Any Role
    await user.click(AnyRoleFilterButton);
    await waitFor(async () => {
      expect(within(tablist).getAllByLabelText(/Loadout: /i)).toHaveLength(
        (await mockLoadouts).length
      );
    });
  });

  test('should update the player slot info on custom loadout selected', async () => {
    const tabConfigList = screen.getByRole('tablist', {
      name: /slot config tabs/i,
    });
    const LoadoutsTabLink = within(tabConfigList).getByRole('link', {
      name: /loadouts/i,
    });

    await user.click(LoadoutsTabLink);

    const loadoutList = within(tabConfigList).getByLabelText(/loadouts list/i);
    const loadoutItems = within(loadoutList).getAllByLabelText(/Loadout:/);
    const loadout = loadoutItems[0];

    const loadoutTitle = within(loadout).getByRole('heading').innerHTML;

    await user.click(loadout);

    const tablist = screen.getByRole('tablist', { name: /player slot list/i });
    const tabs = within(tablist).getAllByRole('tab');

    await waitFor(() => {
      expect(within(tabs[0]).getByText(loadoutTitle)).toBeInTheDocument();
    });
  });

  test('should update the custom tab form to match on custom loadout selected', async () => {
    const tabConfigList = screen.getByRole('tablist', {
      name: /slot config tabs/i,
    });
    const loadoutList = within(tabConfigList).getByLabelText(/loadouts list/i);
    const loadoutItems = within(loadoutList).getAllByLabelText(/Loadout:/);
    const loadout = loadoutItems[0];

    const loadoutTitle = within(loadout).getByRole('heading').innerHTML;

    await user.click(loadout);

    const tablist = screen.getByRole('tablist', { name: /player slot list/i });
    const tabs = within(tablist).getAllByRole('tab');

    await waitFor(() => {
      expect(within(tabs[0]).getByText(loadoutTitle)).toBeInTheDocument();
    });

    const customTab = document.querySelector('#tabs-custom');

    const loadoutNameInput = within(customTab).getByLabelText(/name/i);

    expect(loadoutNameInput.value).toBe(loadoutTitle);
  });

  test('should update the player slot info on custom tab form change', async () => {
    const tabConfigList = screen.getByRole('tablist', {
      name: /slot config tabs/i,
    });
    const customTabLink = within(tabConfigList).getByRole('link', {
      name: /custom/i,
    });

    await user.click(customTabLink);

    const customTab = document.querySelector('#tabs-custom');

    const loadoutNameInput = within(customTab).getByLabelText(/name/i);

    const expectedName = 'Mock Loadout';
    await user.clear(loadoutNameInput);
    await user.type(loadoutNameInput, expectedName);
    await user.tab();

    await waitFor(() => {
      const tablist = screen.getByRole('tablist', {
        name: /player slot list/i,
      });
      const tabs = within(tablist).getAllByRole('tab');
      expect(within(tabs[0]).getByText(expectedName)).toBeInTheDocument();
    });
  });
});
