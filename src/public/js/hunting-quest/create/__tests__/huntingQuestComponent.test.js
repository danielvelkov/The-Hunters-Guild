import { screen, within } from '@testing-library/dom';
import '@testing-library/jest-dom';

import GameData from '@models/GameData';
import HuntingQuest from 'entities/HuntingQuest';
import QuestCategory from 'entities/game-data/QuestCategory';
import QuestType from 'entities/game-data/QuestType';
import QuestMonster from 'entities/QuestMonster';
import MonsterVariant from 'entities/game-data/MonsterVariant';
import MonsterCrown from 'entities/game-data/MonsterCrown';
import Slot from 'entities/Slot';
import Monster from 'entities/game-data/Monster';

// This tells Jest to use the mock from __mocks__/gamedata.js
jest.mock('@models/GameData');

const mockMonsters = GameData.monsters__weakness_and_icons_ListGet();
const mockQuestRewards = GameData.bonus_quest_rewards__ListGet();
const mockDrops = GameData.monsters_drops__ListGet();

describe('Hunting Quest Component', () => {
  let HuntingQuestComponent;
  let mockHuntingQuest;

  beforeEach(async () => {
    jest.resetModules();

    jest.doMock('js/hunting-quest/create', () => ({
      bonusQuestRewardsList: mockQuestRewards,
      monstersDropsList: mockDrops,
    }));

    jest.isolateModules(() => {
      HuntingQuestComponent = require('js/hunting-quest/components/HuntingQuestComponent');
    });

    // reset hunting quest mock
    mockHuntingQuest = new HuntingQuest({
      title: 'Mock',
      description: 'Mock description',
      category: QuestCategory.ASSIGNMENT,
      star_rank: '5',
      area: 'Windward Plains',
      type: QuestType.SLAY,
      hr_requirement: 21,
      time_limit: 35,
      crossplay_enabled: true,
    });
    mockHuntingQuest.addMonster(
      new QuestMonster(
        Monster.fromDatabaseObject(mockMonsters[0]),
        MonsterVariant.BASE,
        MonsterCrown.BASE,
        3
      )
    );
  });

  // Cleanup
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('should render quest details tab in a tablist', () => {
    const component = new HuntingQuestComponent(mockHuntingQuest);
    $(document.body).append(component.render());

    const tablist = screen.getByRole('tablist');

    expect(tablist).toBeInTheDocument();
    expect(
      within(tablist).getByRole('link', { name: /quest details/i })
    ).toBeInTheDocument();
  });

  test('should display quest details tab contents in a table', () => {
    const component = new HuntingQuestComponent(mockHuntingQuest);
    $(document.body).append(component.render());

    const questDetailsTable = screen.getByRole('table');

    // Quest title row
    expect(
      within(questDetailsTable).getByRole('heading', {
        name: mockHuntingQuest.title,
      })
    ).toBeInTheDocument();

    // Monster image
    expect(
      within(questDetailsTable).getByAltText(
        mockHuntingQuest.quest_monsters[0].monster.name
      )
    ).toBeInTheDocument();

    // Quest info column in table
    expect(
      within(questDetailsTable).getByRole('columnheader', {
        name: /quest info/i,
      })
    ).toBeInTheDocument();
  });

  test('should show monster crown icons if quest monster crowns are present', () => {
    mockHuntingQuest.removeMonster(0);
    mockHuntingQuest.addMonster(
      new QuestMonster(
        Monster.fromDatabaseObject(mockMonsters[0]),
        MonsterVariant.BASE,
        MonsterCrown.GOLD,
        3
      )
    );
    mockHuntingQuest.addMonster(
      new QuestMonster(
        Monster.fromDatabaseObject(mockMonsters[1]),
        MonsterVariant.BASE,
        MonsterCrown.SILVER,
        3
      )
    );
    let component = new HuntingQuestComponent(mockHuntingQuest);
    $(document.body).append(component.render());

    const questDetailsTable = screen.getByRole('table');

    // Crown images
    expect(
      within(questDetailsTable).getByAltText(MonsterCrown.GOLD)
    ).toBeInTheDocument();
    expect(
      within(questDetailsTable).getByAltText(MonsterCrown.SILVER)
    ).toBeInTheDocument();
  });

  test.each([...Object.values(MonsterVariant)])(
    'should modify monster image for the user to recognize monster variation ($name)',
    (variant) => {
      mockHuntingQuest.removeMonster(0);
      mockHuntingQuest.addMonster(
        new QuestMonster(
          Monster.fromDatabaseObject(mockMonsters[0]),
          variant,
          MonsterCrown.BASE,
          3
        )
      );
      let component = new HuntingQuestComponent(mockHuntingQuest);
      $(document.body).append(component.render());

      const questDetailsTable = screen.getByRole('table');

      // No change for BASE variant
      if (variant.name === MonsterVariant.BASE.name) {
        expect(
          within(questDetailsTable).queryByAltText(
            mockHuntingQuest.quest_monsters[0].monster.name
          )
        ).toBeInTheDocument();
        return;
      }
      // Default Monster image (NOT PRESENT)
      expect(
        within(questDetailsTable).queryByAltText(
          mockHuntingQuest.quest_monsters[0].monster.name
        )
      ).not.toBeInTheDocument();

      // Variation Monster Image (PRESENT)
      const regex = new RegExp(
        `${mockHuntingQuest.quest_monsters[0].variant.name}\\s*${mockHuntingQuest.quest_monsters[0].monster.name}`,
        'i'
      );
      expect(
        within(questDetailsTable).queryByAltText(regex)
      ).toBeInTheDocument();
    }
  );
});
