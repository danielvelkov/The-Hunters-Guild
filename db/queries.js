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

const getMonsters__AllWeaknesses = `WITH monsters AS
  (SELECT m.em_id,
          REPLACE(concat('E', to_char(hex_to_decimal(boss_icon_type_raw)-1, '0099')), ' ', '') AS large_monster_icon_id,
          e.name,
          frenzied,
          tempered,
          arch_tempered,
          locale,
          CLASS,
          base_health,
          special_attacks,
          weakness
   FROM monsters m
   JOIN enemydata e ON e.em_id = m.em_id)
SELECT DISTINCT em_id, monsters.name,
                large_monster_icon_id,
                frenzied,
                tempered,
                arch_tempered,
                locale,
                base_health,
                special_attacks,
                concat(weakness, coalesce('; ' || NULLIF(
                                                           (SELECT string_agg(upper(KEY), ', ') from
                                                              (SELECT (jsonb_each_text).key AS KEY, (jsonb_each_text).value AS value
                                                               FROM
                                                                 (SELECT jsonb_each_text(to_jsonb(mar.*))
                                                                  FROM monster_ailment_resistances mar
                                                                  WHERE monsters.name = mar.monster) AS sub
                                                               WHERE (jsonb_each_text).key IN ('ko', 'blast', 'sleep', 'paralysis', 'poison')
                                                                 AND (jsonb_each_text).value like '⭐⭐%') AS sub), ''), '')) AS all_weaknesses
FROM monsters
WHERE CLASS = 'Large';`;

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
  name as parts_type, monster_parts.icon_type as icon,
  slash,
  blow,
  shot,
  fire,
  water,
  thunder,
  ice,
  dragon,
  stun,
  flash from monster_parts_array join monster_meat_array m on m.instance_guid = monster_parts_array.meat_guid_normal join monster_parts on parts_type_raw = monster_parts.fixed_id where icon_type != '' order
 by m.monster;`;

const getBonusRewards__NamesAndIconId = `SELECT DISTINCT
  id,
  name,
  description,
  rarity,
  icon_type AS icon,
  icon_colour,
  get_rank_1,
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
WHERE ((TYPE = 'GEM' AND name not ilike 'old%' OR add_icon_type = 'INGREDIENTS' and cast(rarity as int) > 4 )
       OR (TYPE = 'MATERIAL' AND dropped_by != ''))
       OR (NAME = 'Basic Material' OR NAME = 'Valuable Material');`;

const getMonstersItemRewards = `WITH numbered_rows AS
  (SELECT *,
          ROW_NUMBER() OVER () AS original_order
   FROM monster_parts_break_array),
drops_numbered_rows as
(SELECT *,
          ROW_NUMBER() OVER () AS drops_original_order
   FROM monster_drops)
SELECT DISTINCT drops_original_order, drops_numbered_rows.monster,
                reward_type,
                data_id,
                rank,
                item,
                parts_type, number, probability,
                                    target_category
FROM drops_numbered_rows
LEFT JOIN
  (SELECT monster_id,
          monster,
          target_category,
          parts_type,
          DENSE_RANK() OVER (PARTITION BY monster
                             ORDER BY original_order, parts_type) - 1 AS part_index
   FROM numbered_rows) AS mp ON mp.part_index = Cast(drops_numbered_rows.parts_index AS bigint)
AND mp.monster_id = drops_numbered_rows.monster_id order by drops_original_order;`;

module.exports = {
  getMonstersInfo__AllWeaknesses,
  getStatusIcons__NamesAndIconId,
  getMonsterSpecialAttacks__NamesAndDescription,
  getMonstersPartsDamageEffectiveness__NamesAndIconId,
  getBonusQuestRewardsList,
};
