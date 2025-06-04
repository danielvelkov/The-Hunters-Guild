import { screen } from '@testing-library/dom';
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
  let mockHuntingQuest = new HuntingQuest({
    title: 'Mock',
    description: 'Mock description',
    category: QuestCategory.ASSIGNMENT,
    star_rank: '5',
    area: 'Windward Plains',
    type: QuestType.SLAY,
    hr_requirement: 21,
    time_limit: 35,
    crossplay_enabled: true,
    quest_monsters: [
      new QuestMonster(
        Monster.fromDatabaseObject(mockMonsters[0]),
        MonsterVariant.BASE,
        MonsterCrown.BASE,
        3
      ),
    ],
    player_slots: [new Slot({})],
  });

  beforeEach(async () => {
    jest.resetModules();

    jest.doMock('js/hunting-quest/create', () => ({
      bonusQuestRewardsList: mockQuestRewards,
      monstersDropsList: mockDrops,
    }));

    jest.isolateModules(() => {
      HuntingQuestComponent = require('js/hunting-quest/components/HuntingQuestComponent');
    });
  });

  // Cleanup
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('should render quest title', () => {
    const component = new HuntingQuestComponent(mockHuntingQuest);
    $(document.body).append(component.render());

    expect(
      screen.getByRole('heading', { name: mockHuntingQuest.title })
    ).toBeInTheDocument();
  });

  test('should render different quest detail sections in a tablist', () => {
    const component = new HuntingQuestComponent(mockHuntingQuest);
    $(document.body).append(component.render());

    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  test('should display image of monster which will be hunted', () => {
    const component = new HuntingQuestComponent(mockHuntingQuest);
    $(document.body).append(component.render());

    expect(
      screen.getByAltText(mockHuntingQuest.quest_monsters[0].monster.name)
    ).toBeInTheDocument();
  });
});
