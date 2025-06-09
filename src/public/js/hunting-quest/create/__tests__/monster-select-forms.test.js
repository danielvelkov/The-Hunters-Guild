import path from 'path';
import ejs from 'ejs';
import { screen, within } from '@testing-library/dom';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import GameData from '@models/GameData';
import { selectSelect2Option } from '@tests/helper';
import { MONSTER_SELECT_FORMS_CHANGE } from 'js/common/events';

import createSelect2Mock from '@tests/__mocks__/select2mock';

// This tells Jest to use the mock from __mocks__/gamedata.js
jest.mock('@models/GameData');

const ejsViewPath = path.resolve(
  process.cwd(),
  'src/views/components/hunting-quest/monster-select-forms.ejs'
);

const mockMonsters = GameData.monsters__weakness_and_icons_ListGet();

describe('monster select forms section', () => {
  let select2Mock;
  let user = userEvent.setup();
  const mockMediator = {
    trigger: jest.fn(),
    on: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetModules();
    const htmlString = await ejs.renderFile(ejsViewPath, {
      monsters: mockMonsters,
    });

    document.body.innerHTML = htmlString;

    jest.doMock('js/hunting-quest/create', () => ({
      monstersList: mockMonsters,
    }));
    jest.doMock('js/common/mediator', () => mockMediator);

    select2Mock = createSelect2Mock(mockMonsters);

    jest.isolateModules(() => {
      require('js/hunting-quest/create/monster-select-forms');
    });
  });

  afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
  });

  test('should show monster select form on add monster button click', async () => {
    const addMonsterButton = screen.getByRole('button', {
      name: /add monster/i,
    });
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
    await user.click(addMonsterButton);
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  test('should select first monster in list as default on add monster button click', async () => {
    const addMonsterButton = screen.getByRole('button', {
      name: /add monster/i,
    });
    await user.click(addMonsterButton);
    expect(
      screen.getByRole('option', {
        selected: true,
        name: new RegExp(mockMonsters[0].name),
      })
    ).toBeInTheDocument();
  });

  test('should show monster variations checkboxes, strength and crown select on add monster button click', async () => {
    const addMonsterButton = screen.getByRole('button', {
      name: /add monster/i,
    });
    await user.click(addMonsterButton);
    const monsterSelectForm = screen.getByRole('form');
    expect(within(monsterSelectForm).getByRole('checkbox')).toBeInTheDocument();
    expect(
      within(monsterSelectForm).getByRole('combobox', { name: /crown/i })
    ).toBeInTheDocument();
    expect(
      within(monsterSelectForm).getByRole('combobox', { name: /strength/i })
    ).toBeInTheDocument();
  });
  test('shows a MAX of 2 monster select forms', async () => {
    const addMonsterButton = screen.getByRole('button', {
      name: /add monster/i,
    });
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
    await user.click(addMonsterButton);
    await user.click(addMonsterButton);
    await user.click(addMonsterButton);
    expect(screen.getAllByRole('form').length).toBe(2);
  });

  test.each(
    mockMonsters.map((m, i) => ({ index: i, name: m.name })).slice(0, 3)
  )(
    'should show right monster variants on monster select for $name',
    async ({ index, name }) => {
      const addMonsterButton = screen.getByRole('button', {
        name: /add monster/i,
      });
      await user.click(addMonsterButton);

      const select = screen.getByRole('combobox', { name: /large monster/i });

      selectSelect2Option(select, mockMonsters[index].id);

      expect(
        screen.getByRole('option', { name: mockMonsters[index].name }).selected
      ).toBe(true);

      expect(
        screen.getByRole('combobox', { name: /monster crown/i })
      ).toBeInTheDocument();

      if (mockMonsters[index].tempered)
        expect(screen.getByLabelText(/monster-tempered/i)).toBeInTheDocument();
      else
        expect(
          screen.queryByLabelText(/monster-tempered/i).parentElement
        ).toHaveStyle('display: none');

      if (mockMonsters[index].arch_tempered)
        expect(screen.getByLabelText(/arch-tempered/i)).toBeInTheDocument();
      else
        expect(
          screen.queryByLabelText(/arch-tempered/i).parentElement
        ).toHaveStyle('display: none');

      if (mockMonsters[index].frenzied)
        expect(screen.getByLabelText(/frenzied/i)).toBeInTheDocument();
      else
        expect(screen.queryByLabelText(/frenzied/i).parentElement).toHaveStyle(
          'display: none'
        );
    }
  );

  test('should disable other monster variants on variant selection', async () => {
    const addMonsterButton = screen.getByRole('button', {
      name: /add monster/i,
    });
    await user.click(addMonsterButton);

    const select = screen.getByRole('combobox', { name: /large monster/i });

    selectSelect2Option(select, mockMonsters[1].id);

    const monsterVariantCheckbox = screen.getAllByRole('checkbox');
    await user.click(monsterVariantCheckbox[0]);
    monsterVariantCheckbox
      .slice(1, -1)
      .forEach((checkbox) => expect(checkbox).toBeDisabled());
  });

  test('should remove monster form on remove button click', async () => {
    const addMonsterButton = screen.getByRole('button', {
      name: /add monster/i,
    });
    await user.click(addMonsterButton);

    const select = screen.getByRole('combobox', { name: /large monster/i });

    selectSelect2Option(select, mockMonsters[0].id);

    const removeButton = screen.getByRole('button', { name: /remove/i });

    await user.click(removeButton);

    expect(select).not.toBeInTheDocument();
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });

  test('should trigger event monsterSelectFormsChange on monster select', async () => {
    const createPageMediator = jest.requireMock('js/common/mediator');
    const spy = jest.spyOn(createPageMediator, 'trigger');

    const addMonsterButton = screen.getByRole('button', {
      name: /add monster/i,
    });
    await user.click(addMonsterButton);

    const select = screen.getByRole('combobox', { name: /large monster/i });
    selectSelect2Option(select, mockMonsters[0].id);

    expect(spy).toHaveBeenCalledWith(
      MONSTER_SELECT_FORMS_CHANGE,
      expect.anything()
    );
  });
});
