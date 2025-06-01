import path from 'path';
import ejs from 'ejs';
import { screen, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import mediator from 'js/common/mediator';

import GameData from '@models/GameData';
import { select2Clear, selectSelect2Option } from '@tests/helper';
import { MONSTER_SELECT_FORMS_CHANGE } from 'js/common/events';

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

  test('should show quest category selection', async () => {
    mediator.trigger(MONSTER_SELECT_FORMS_CHANGE, new Set([mockMonsters[0]]));
    expect(
      screen.getByRole('combobox', { name: /category/i })
    ).toBeInTheDocument();
  });
});
