const pool = require('./pool');

async function getMonstersInfo__AllWeaknesses() {
  const { rows } = await pool.query(getMonsters__AllWeaknesses);
  return rows;
}

async function getStatusIcons__NamesAndIconId() {
  const { rows } = await pool.query(`SELECT id, name from status_icons;`);
  return rows;
}

async function getMonsterSpecialAttacks__NamesAndDescription() {
  const { rows } = await pool.query(
    `SELECT name, description from monster_special_attacks;`
  );
  return rows;
}

async function getMonstersPartsDamageEffectiveness__NamesAndIconId() {
  const { rows } = await pool.query(getMonstersParts__DamageEffectiveness);
  return rows;
}

async function getBonusQuestRewardsList() {
  const { rows } = await pool.query(getBonusRewards__NamesAndIconId);
  return rows;
}

const getMonsters__AllWeaknesses = `SELECT
  em_id,
  large_monster_icon_id,
  name,
  frenzied,
  tempered,
  arch_tempered,
  locale,
  base_health,
  special_attacks,
  CONCAT(
    weakness,
    COALESCE(
      '; ' || NULLIF(
        (SELECT STRING_AGG(upper(key), ', ')
         FROM (
           SELECT (jsonb_each_text).key AS key, (jsonb_each_text).value AS value
           FROM (
             SELECT jsonb_each_text(to_jsonb(bc2.*))
             FROM badcondition2 bc2
             WHERE bc2.name = m.name
           ) subquery
           WHERE (jsonb_each_text).value Like '⭐⭐%'
         ) inner_query
        ),
        ''
      ),
      ''
    )
  ) AS all_weaknesses
FROM monsters m where m.class = 'Large';`;

const getMonsters__OnlyElementalWeaknesses = `SELECT
  em_id,
  large_monster_icon_id,
  name,
  frenzied,
  tempered,
  arch_tempered,
  locale,
  base_health,
  special_attacks,
  weakness,
FROM monsters;
`;

const getMonstersParts__DamageEffectiveness = `SELECT DISTINCT
  m.monster_id,
  m.monster,
  parts_type,
  icontype AS icon,
  slash,
  blow,
  shot,
  fire,
  water,
  thunder,
  ice,
  dragon,
  stun,
  flash
FROM monster_parts_array
INNER JOIN monster_meat_array AS m ON meat_guid_normal = instance_guid
LEFT JOIN monster_parts ON parts_type = empartstype
WHERE parts_type != 'HIDE'
  AND parts_type != '#N/A';`;

const getBonusRewards__NamesAndIconId = `SELECT DISTINCT
  id,
  name,
  description,
  rarity,
  icon_type AS icon,
  icon_colour,
  rank_1,
  dropped_by,
CASE
  WHEN  add_icon_type = 'INGREDIENTS' THEN 'Food Ingredient'
  WHEN dropped_by != '' THEN 'Rare Drop'
  WHEN add_icon_type = 'FOR_ATTACK' THEN 'Sword Decoration'
  WHEN add_icon_type = 'FOR_DEFENSE' THEN 'Armor Decoration'
  WHEN type = 'GEM' AND add_icon_type = 'INVALID' THEN 'Artisan Part'
  ELSE 'Monster Material'
END as type
FROM items
LEFT JOIN
  (SELECT item,
          string_agg(monster, ',') AS dropped_by
   FROM monster_drops
   WHERE probability != ''
     AND CAST(probability AS float) = 1
     AND rank = 'HIGH'
     AND reward_type = 'Target Rewards'
   GROUP BY item) AS rare_items ON rare_items.item = name
WHERE ((TYPE = 'GEM' OR add_icon_type = 'INGREDIENTS')
       OR (TYPE = 'MATERIAL' AND dropped_by != ''))
       OR (NAME = 'Basic Material' OR NAME = 'Valuable Material')
  AND NOT (type = 'GEM' AND name ILIKE 'Old%');`;

module.exports = {
  getMonstersInfo__AllWeaknesses,
  getStatusIcons__NamesAndIconId,
  getMonsterSpecialAttacks__NamesAndDescription,
  getMonstersPartsDamageEffectiveness__NamesAndIconId,
  getBonusQuestRewardsList,
};
