import { screen, waitFor, within } from '@testing-library/dom';
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
import QuestBonusReward from 'entities/QuestBonusRewards';
import Item from 'entities/game-data/Item';

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
      ({
        default: HuntingQuestComponent,
      } = require('js/hunting-quest/components/HuntingQuestComponent'));
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

  test.skip('should not display inactive tab contents', async () => {
    const component = new HuntingQuestComponent(mockHuntingQuest);
    $(document.body).append(component.render());

    // Check active panel
    const activePanel = screen.getByRole('tabpanel', {
      name: /quest details tab/i,
    });

    expect(activePanel).toBeInTheDocument();

    /**
     * NOTE
     *
     * This will not work. Idk why but jquery widgets methods do
     * not work in the jsdom. No aria, not additional functionality. Nada.
     * The classes and everything, its like nothing happened
     */
    // expect(activePanel.getAttribute('aria-hidden')).toBe('false');

    // // Check inactive panels
    // const inactivePanels = screen
    //   .getAllByRole('tabpanel', { hidden: true })
    //   .filter((panel) => panel !== activePanel);

    // inactivePanels.forEach((panel) => {
    //   expect(panel.getAttribute('aria-hidden')).toBe('true');
    //   expect(panel).toHaveClass('ui-tabs-hide');
    // });
  });

  test('should display quest details tab contents in a table by default', async () => {
    const component = new HuntingQuestComponent(mockHuntingQuest);
    $(document.body).append(component.render());

    const activePanel = screen.getByRole('tabpanel', {
      name: /quest details tab/i,
    });
    const questDetailsTable = within(activePanel).getByRole('table');

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

  test('should display auto generated title if no title value passed', async () => {
    mockHuntingQuest.title = '';
    const component = new HuntingQuestComponent(mockHuntingQuest);
    $(document.body).append(component.render());

    const activePanel = screen.getByRole('tabpanel', {
      name: /quest details tab/i,
    });
    const questDetailsTable = within(activePanel).getByRole('table');

    // Quest title row
    expect(
      within(questDetailsTable).getByRole('heading', {
        name:
          mockHuntingQuest.type.name +
          ' the ' +
          mockHuntingQuest.quest_monsters[0].monster.name,
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

    const activePanel = screen.getByRole('tabpanel', {
      name: /quest details tab/i,
    });
    const questDetailsTable = within(activePanel).getByRole('table');

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

      const activePanel = screen.getByRole('tabpanel', {
        name: /quest details tab/i,
      });
      const questDetailsTable = within(activePanel).getByRole('table');

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

  test('should display recommended skills based on selected monsters attacks', () => {
    const component = new HuntingQuestComponent(mockHuntingQuest);
    $(document.body).append(component.render());

    const activePanel = screen.getByRole('tabpanel', {
      name: /quest details tab/i,
    });
    const questDetailsTable = within(activePanel).getByRole('table');

    // Skills Column Header
    expect(
      within(questDetailsTable).getByRole('columnheader', {
        name: /recom.*skills/i,
      })
    ).toBeInTheDocument();

    const regex = new RegExp(
      `${mockHuntingQuest.quest_monsters
        .map((qm) =>
          qm.monster.special_attacks.map((sa) => sa.skill_counters).flat()
        )
        .flat()
        .map((skill) => `(${skill.name})|`)
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .join('')}`,
      'i'
    );
    within(questDetailsTable)
      .getAllByAltText(regex)
      .forEach((e) => expect(e).toBeInTheDocument());
  });

  test('should display selected bonus quest rewards', () => {
    mockHuntingQuest.quest_bonus_rewards = [
      new QuestBonusReward(Item.fromDatabaseObject(mockQuestRewards[0]), 1),
    ];
    const component = new HuntingQuestComponent(mockHuntingQuest);
    $(document.body).append(component.render());

    const activePanel = screen.getByRole('tabpanel', {
      name: /quest details tab/i,
    });
    const questDetailsTable = within(activePanel).getByRole('table');

    // Skills Column Header
    expect(
      within(questDetailsTable).getByRole('columnheader', {
        name: /bonus.*rewards/i,
      })
    ).toBeInTheDocument();

    expect(
      within(questDetailsTable).getByAltText(mockQuestRewards[0].name)
    ).toBeInTheDocument();
    expect(
      within(questDetailsTable).queryByAltText(mockQuestRewards[1].name)
    ).not.toBeInTheDocument();
  });

  test('should have tabs based on selected monsters', async () => {
    mockHuntingQuest.addMonster(
      new QuestMonster(
        Monster.fromDatabaseObject(mockMonsters[1]),
        MonsterVariant.BASE,
        MonsterCrown.BASE,
        1
      )
    );
    const component = new HuntingQuestComponent(mockHuntingQuest);
    $(document.body).append(component.render());

    const tablist = screen.getByRole('tablist');

    expect(tablist).toBeInTheDocument();
    expect(
      within(tablist).getByRole('link', {
        name: mockMonsters[0].name,
      })
    ).toBeInTheDocument();
    expect(
      within(tablist).getByRole('link', {
        name: mockMonsters[1].name,
      })
    ).toBeInTheDocument();
    expect(
      within(tablist).queryByRole('link', {
        name: mockMonsters[2].name,
      })
    ).not.toBeInTheDocument();
  });

  test('should contain tabpanel with details about the selected monster', async () => {
    const component = new HuntingQuestComponent(mockHuntingQuest);
    $(document.body).append(component.render());

    const regex = new RegExp(mockHuntingQuest.quest_monsters[0].monster.name);
    const monsterPanel = screen.getByRole('tabpanel', {
      name: regex,
    });

    // Damage Effectiveness table
    expect(
      within(monsterPanel).getByRole('table', {
        name: /damage eff/i,
      })
    ).toBeInTheDocument();

    // Status effectiveness table
    expect(
      within(monsterPanel).getByRole('table', {
        name: /status eff/i,
      })
    ).toBeInTheDocument();

    // Item effectiveness table
    expect(
      within(monsterPanel).getByRole('table', {
        name: /item eff/i,
      })
    ).toBeInTheDocument();
  });
});
