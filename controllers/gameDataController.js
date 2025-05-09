const {
  getMonstersInfo__AllWeaknesses,
  getStatusIcons__NamesAndIconId,
  getMonsterSpecialAttacks__NamesAndCounterSkills,
  getMonstersPartsDamageEffectiveness__NamesAndIconId,
  getBonusQuestRewardsList,
  getMonsterDropsList,
  getWeaponTypes,
  getWeaponAttributes,
  getSkills,
} = require('../db/queries');
const Item = require('../models/Item');
const Monster = require('../models/Monster');
const MonsterDrop = require('../models/MonsterDrop');
const Skill = require('../models/Skill');
const WeaponAttribute = require('../models/WeaponAttribute');
const WeaponType = require('../models/WeaponType');

/**
 * Retrieves a list containing base details for each monster with
 * the monsters weaknesses and icons for the monster
 * and each status/element it is weak to
 * @returns {Monster[]}
 */
const monsters__weakness_and_icons_ListGet = async () => {
  const monstersRows = await getMonstersInfo__AllWeaknesses();

  const monstersSpecialAttacksRows =
    await getMonsterSpecialAttacks__NamesAndCounterSkills();
  const monstersSpecialAttacksAndCountersList = mapAttacksToAttacksAndCounters(
    Object.groupBy(monstersSpecialAttacksRows, ({ attack }) => attack)
  );

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
            description: monstersSpecialAttacksAndCountersList.find(
              (a) => a.attackName === sa
            )?.attackDescription,
            skill_counters: monstersSpecialAttacksAndCountersList.find(
              (a) => a.attackName === sa
            )?.skill_counters,
          }))
        : [],
      groupWeaknesses(row.all_weaknesses, monstersWeaknessAndIconMap),
      getPartDamageEffectivenessForMonster(
        row.em_id,
        monstersPartDmgEffectivenessRows
      ),
      groupStatusEffectiveness(row, monstersWeaknessAndIconMap),
      groupItemEffectiveness(row),
      row.capture
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

const monsters_drops__ListGet = async () => {
  const monstersDrops = [];
  const dropsRows = await getMonsterDropsList();
  dropsRows.forEach((i) =>
    monstersDrops.push(
      new MonsterDrop(
        i.id,
        i.item,
        i.icon,
        i.icon_colour ?? 'I_WHITE',
        i.description,
        'Material',
        i.rarity,
        i.monster,
        i.reward_category ?? i.reward_type,
        i.rank,
        i.broken_part,
        i.broken_part_icon,
        i.number,
        i.probability,
        i.carvable_severed_part
      )
    )
  );
  return monstersDrops;
};

const weapon_types_ListGet = async () => {
  const weaponTypes = [];
  const typesRows = await getWeaponTypes();
  typesRows.forEach((i) => weaponTypes.push(new WeaponType(i.id, i.name)));
  return weaponTypes;
};

const weapon_attributes_ListGet = async () => {
  const weaponAttributes = [];
  const typesRows = await getWeaponAttributes();
  typesRows.forEach((i) =>
    weaponAttributes.push(new WeaponAttribute(i.id, i.name, i.icon))
  );
  return weaponAttributes;
};

const skills_ListGet = async () => {
  const skills = [];
  const skillsRows = await getSkills();
  skillsRows.forEach((i) =>
    skills.push(
      new Skill(
        i.id,
        i.name,
        i.icon_id,
        i.description,
        i.category,
        i.max_level,
        i.set_count,
        getSkillsDescriptionsArr(i)
      )
    )
  );
  return skills;
};

module.exports = {
  monsters__weakness_and_icons_ListGet,
  bonus_quest_rewards__ListGet,
  monsters_drops__ListGet,
  weapon_types_ListGet,
  weapon_attributes_ListGet,
  skills_ListGet,
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

function groupStatusEffectiveness(row, weaknessesIconsMap) {
  // Define status effects configuration
  const statusEffects = [
    { name: 'Poison', rowKey: 'poison', iconKey: 'POISON' },
    { name: 'Paralysis', rowKey: 'paralysis', iconKey: 'PARALYSIS' },
    { name: 'Sleep', rowKey: 'sleep', iconKey: 'SLEEP' },
    { name: 'Blast', rowKey: 'blast', iconKey: 'BLAST' },
    { name: 'KO', rowKey: 'ko', iconKey: 'KO' },
    { name: 'Exhaust', rowKey: 'exhaust', iconKey: 'STAMINA' },
  ];

  // Map the configuration to the desired output format
  return statusEffects.map((effect) => ({
    name: effect.name,
    icon: weaknessesIconsMap[effect.iconKey] ?? '',
    stats: {
      value: row[effect.rowKey],
    },
  }));
}

function groupItemEffectiveness(row) {
  // Define item effects configuration
  const itemEffects = [
    {
      name: 'Sonic Pod',
      rowKey: 'sonic',
      icon: 'ITEM_0061',
      iconColor: 'I_GRAY',
    },
    {
      name: 'Flash Pod',
      rowKey: 'flash',
      icon: 'ITEM_0061',
      iconColor: 'I_LEMON',
    },
    {
      name: 'Luring Pod',
      rowKey: 'lure_pod',
      icon: 'ITEM_0061',
      iconColor: 'I_ROSE',
    },
    {
      name: 'Shock Trap',
      rowKey: 'shock_trap',
      icon: 'ITEM_0018',
      iconColor: 'I_LEMON',
    },
    {
      name: 'Pitfall Trap',
      rowKey: 'pitfall_trap',
      icon: 'ITEM_0018',
      iconColor: 'I_GREEN',
    },
    {
      name: 'Vine Trap',
      rowKey: 'ivy_trap',
      icon: 'ITEM_0018',
      iconColor: 'I_MOS',
    },
  ];

  // Map the configuration to the desired output format
  return itemEffects.map((effect) => ({
    name: effect.name,
    icon: effect.icon,
    iconColor: effect.iconColor,
    stats: {
      effectiveness: row[effect.rowKey],
    },
  }));
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

/**
 * Maps the attack data into a simplified format
 */
function mapAttacksToAttacksAndCounters(attacksData) {
  const result = [];

  // Iterate through each attack type in the data
  for (const attackName in attacksData) {
    const attackEntries = attacksData[attackName];

    // Create the attack object with empty skill_counters array
    const attackObject = {
      attackName: attackName,
      attackDescription: attackEntries[0].description, // Use description from the first entry
      skill_counters: [],
    };

    // Process each skill counter for this attack
    attackEntries.forEach((entry) => {
      // Create level descriptions array from non-empty descriptions
      const levelDescriptions = [];
      for (let i = 1; i <= parseInt(entry.max_level); i++) {
        const descKey = `description_${i}`;
        if (entry[descKey]) {
          levelDescriptions.push(entry[descKey]);
        }
      }

      // Add the skill counter to the attack object
      attackObject.skill_counters.push(
        new Skill(
          entry.skill_id,
          entry.skill,
          entry.icon,
          entry.skill_description,
          entry.category,
          +entry.max_level,
          levelDescriptions
        )
      );
    });

    result.push(attackObject);
  }
  return result;
}

function getSkillsDescriptionsArr(row) {
  const skillDescriptions = [];
  for (let i = 1; i < 8; i++)
    if (row[`description_${i}`] != '')
      skillDescriptions.push(row[`description_${i}`]);
  return skillDescriptions;
}
