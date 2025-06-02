import path from 'path';
import ejs from 'ejs';
import { screen, within } from '@testing-library/dom';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import mediator from 'js/common/mediator';

import GameData from '@models/GameData';
import { SELECTED_MONSTERS_CHANGE } from 'js/common/events';

// This tells Jest to use the mock from __mocks__/gamedata.js
jest.mock('@models/GameData');

const ejsViewPath = path.resolve(
  process.cwd(),
  'src/views/components/hunting-quest/quest-details-form.ejs'
);

const mockMonsters = GameData.monsters__weakness_and_icons_ListGet();
const mockQuestRewards = GameData.bonus_quest_rewards__ListGet();

describe('quest details form module', () => {
  let user = userEvent.setup();

  beforeEach(async () => {
    jest.resetModules();
    const htmlString = await ejs.renderFile(ejsViewPath);

    document.body.innerHTML = htmlString;

    jest.doMock('js/hunting-quest/create', () => ({
      selectedMonsters: [],
      bonusQuestRewardsList: mockQuestRewards,
    }));
    jest.doMock('js/common/mediator', () => mediator);

    jest.isolateModules(() => {
      require('js/hunting-quest/create/quest-details-form');
    });
  });

  afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
  });

  test('should show quest details selection on monster select', async () => {
    mediator.trigger(SELECTED_MONSTERS_CHANGE, [mockMonsters[0]]);
    expect(
      screen.getByRole('group', { name: /quest details/i })
    ).toBeInTheDocument();
  });

  test('should hide quest details selection on no monster selected ', async () => {
    mediator.trigger(SELECTED_MONSTERS_CHANGE, []);
    expect(
      screen.queryByRole('group', { name: /quest details/i })
    ).not.toBeInTheDocument();
  });

  test('should display only the common locales of selected monsters in the area select', async () => {
    mediator.trigger(SELECTED_MONSTERS_CHANGE, [
      mockMonsters[0],
      mockMonsters[1],
    ]);
    const localeSelect = screen.getByRole('combobox', { name: /area/i });
    const optionElements = within(localeSelect).getAllByRole('option');

    const commonLocales = mockMonsters[0].locales.concat(
      mockMonsters[1].locales
    );

    const options = optionElements.map((option) => option.textContent);
    const expected = Object.entries(
      commonLocales.reduce((prev, curr) => {
        prev[curr] = (prev[curr] || 0) + 1;
        return prev;
      }, {})
    )
      .filter((arr) => arr[1] > 1)
      .map((arr) => arr[0]);

    expect(options).toEqual(expected);
  });

  test('should display "-- No Common Locale --" in area selection when monsters do not have a common locale', async () => {
    const clone1 = structuredClone(mockMonsters[0]);
    clone1.locales = ['Narnia'];
    const clone2 = structuredClone(mockMonsters[1]);
    clone2.locales = ['Afghanistan'];
    mediator.trigger(SELECTED_MONSTERS_CHANGE, [clone1, clone2]);
    const localeSelect = screen.getByRole('combobox', { name: /area/i });
    const optionElements = within(localeSelect).getAllByRole('option');

    expect(optionElements).toHaveLength(1);

    expect(optionElements[0].textContent).toEqual('-- No Common Locale --');
  });

  test('should add monster rare drops to "Rare Drops" options group in bonus rewards select', async () => {
    const selectedMonsters = [mockMonsters[0], mockMonsters[1]];
    mediator.trigger(SELECTED_MONSTERS_CHANGE, selectedMonsters);
    const select = await screen.findByRole('listbox', {
      // multiple selection is a listbox
      name: /bonus/i,
    });
    const optionsGroup = within(select).getByRole('group', {
      name: /rare drops/i,
    });
    const options = within(optionsGroup).getAllByRole('option', { name: /.+/ }); // get options with values

    const expected = mockQuestRewards
      .filter(
        (r) =>
          r.type === 'Rare Drop' &&
          mockMonsters.some((m) => r.source.includes(m.name))
      )
      .map((r) => r.name);

    const unexpected = mockQuestRewards
      .filter(
        (r) =>
          r.type === 'Rare Drop' &&
          mockMonsters.some((m) => !r.source.includes(m.name))
      )
      .map((r) => r.name);

    expect(options.map((o) => o.textContent)).toEqual(
      expect.arrayContaining(expected.map((e) => expect.stringContaining(e)))
    );
    expect(options.map((o) => o.textContent)).not.toEqual(
      expect.arrayContaining(unexpected.map((e) => expect.stringContaining(e)))
    );
  });
});
