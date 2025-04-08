const {
  getMonstersInfo__AllWeaknesses,
  getStatusIcons__NamesAndIconId,
  getMonsterSpecialAttacks__NamesAndDescription,
} = require('../db/queries');
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
      groupWeaknesses(row.all_weaknesses, monstersWeaknessAndIconMap)
    );
    monsters.push(monster);
  });
  return monsters;
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
