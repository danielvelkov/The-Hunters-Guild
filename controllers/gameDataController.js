const {
  getMonstersInfo__AllWeaknesses,
  getStatusIcons__NamesAndIconId,
  getMonsterSpecialAttacks__NamesAndDescription,
  getMonstersPartsDamageEffectiveness__NamesAndIconId,
  getBonusQuestRewardsList,
} = require('../db/queries');
const Item = require('../models/Item');
const Monster = require('../models/Monster');

/**
 * Retrieves a list containing base details for each monster with
 * the monsters weaknesses and icons for the monster
 * and each status/element it is weak to
 * @returns {Monster[]}
 */
const monsters__weakness_and_icons_ListGet = async () => {
  const monstersRows = await getMonstersInfo__AllWeaknesses();

  const monstersSpecialAttacksRows =
    await getMonsterSpecialAttacks__NamesAndDescription();
  const monstersSpecialAttacksAndDescriptionsMap = {};

  for (let row of monstersSpecialAttacksRows)
    monstersSpecialAttacksAndDescriptionsMap[row.name] = row.description;

  const statusIconsRows = await getStatusIcons__NamesAndIconId();
  const monstersWeaknessAndIconMap = {};

  for (let row of statusIconsRows)
    if (row.name) monstersWeaknessAndIconMap[row.name.toUpperCase()] = row.id;

  const monstersPartDmgEffectivenessRows =
    await getMonstersPartsDamageEffectiveness__NamesAndIconId();

  const monsters = [];
  if (monstersRows.length === 0) return monsters;

  monstersRows.forEach((row) => {
    const monster = new Monster(
      row.em_id,
      row.name,
      row.large_monster_icon_id,
      row.frenzied == 'true',
      row.tempered == 'true',
      row.arch_tempered == 'true',
      row.locale.split(', '),
      +row.base_health,
      row.special_attacks
        ? row.special_attacks.split(', ').map((sa) => ({
            name: sa,
            description: monstersSpecialAttacksAndDescriptionsMap[sa],
          }))
        : [],
      groupWeaknesses(row.all_weaknesses, monstersWeaknessAndIconMap),
      getPartDamageEffectivenessForMonster(
        row.em_id,
        monstersPartDmgEffectivenessRows
      )
    );
    monsters.push(monster);
  });
  return monsters;
};

const bonus_quest_rewards__ListGet = async () => {
  const bonusRewards = [];
  const itemRows = await getBonusQuestRewardsList();
  itemRows.forEach((i) =>
    bonusRewards.push(
      new Item(
        i.id,
        i.name,
        i.icon,
        i.icon_colour,
        i.description,
        i.type,
        i.rarity,
        i.dropped_by
      )
    )
  );

  return bonusRewards;
};

/**
 * Gets the rows of drop data related to a certain monster
 * @param {string} monster Monster name
 */
const monster__drops_TablesGet = async (monster) => {
  // TODO
};

module.exports = {
  monsters__weakness_and_icons_ListGet,
  bonus_quest_rewards__ListGet,
};

function groupWeaknesses(weaknesses, weaknessesIconsMap) {
  if (!weaknesses.includes(';'))
    return {
      elements: weaknesses
        ? weaknesses
            .split(', ')
            .map((w) => ({ name: w, icon: weaknessesIconsMap[w] }))
        : [],
      ailments: [],
    };
  else
    return {
      elements: weaknesses.split('; ')[0]
        ? weaknesses
            .split('; ')[0]
            .split(', ')
            .map((w) => ({ name: w, icon: weaknessesIconsMap[w] }))
        : [],
      ailments: weaknesses.split('; ')[1]
        ? weaknesses
            .split('; ')[1]
            .split(', ')
            .map((w) => ({ name: w, icon: weaknessesIconsMap[w] }))
        : [],
    };
}

function getPartDamageEffectivenessForMonster(
  monsterId,
  partDamageEffectivenessRows
) {
  const monsterPartDamagesRows = partDamageEffectivenessRows.filter(
    (r) => r.monster_id === monsterId
  );
  const result = [];
  monsterPartDamagesRows.forEach((row) => {
    const part = {};
    part.name = row.parts_type;
    part.icon = row.icon;
    const damagesArr = [];
    const keys = Object.keys(row);
    const startIndex = keys.indexOf('slash');
    const endIndex = keys.indexOf('flash');

    keys.slice(startIndex, endIndex + 1).reduce((acc, key) => {
      const damage = {};
      damage.type = key;
      damage.value = row[key];
      acc.push(damage);
      return acc;
    }, damagesArr);

    part.damages = damagesArr;
    result.push(part);
  });
  return result;
}
