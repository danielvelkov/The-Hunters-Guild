import path from 'path';
import ejs from 'ejs';
import { screen, within } from '@testing-library/dom';
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
});
