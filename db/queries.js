const pool = require('./pool');

async function getMonstersInfo__AllWeaknesses() {
  const { rows } = await pool.query(getMonsters__AllWeaknesses);
  return rows;
}

async function getStatusIcons__NamesAndIconId() {
  const { rows } = await pool.query(`SELECT id, name from status_icons;`);
  return rows;
}

async function getMonsterSpecialAttacks__NamesAndCounterSkills() {
  const { rows } = await pool.query(getMonsterSpecialAttacksAndCounterSkills);
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

async function getMonsterDropsList() {
  const { rows } = await pool.query(getMonsterDrops__NamesAndIconId);
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
          weakness,
          exhaust,
          blast,
          poison,
          sleep,
          paralysis,
          ko,
          sonic,
          flash,
          capture,
          shock_trap,
          pitfall_trap,
          ivy_trap,
          lure_pod
   FROM monsters m
   JOIN monster_ailment_resistances ON m.name = monster_ailment_resistances.monster
   OR m.name like monster_ailment_resistances.monster || CHR(10) || '%'
   JOIN enemydata e ON e.em_id = m.em_id)
SELECT DISTINCT em_id,
                monsters.name,
                large_monster_icon_id,
                frenzied,
                tempered,
                arch_tempered,
                locale,
                base_health,
                special_attacks,
                exhaust,
                blast,
                poison,
                sleep,
                paralysis,
                ko,
                sonic,
                flash,
                capture,
                shock_trap,
                pitfall_trap,
                ivy_trap,
                lure_pod,
                concat(weakness, coalesce('; ' || NULLIF(
                                                           (SELECT string_agg(upper(KEY), ', ')
                                                            FROM
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

// TODO: this query works great, but for some of the monsters the broken parts table is incorrect or follows some other logic
// that I haven't figured out yet. (see Ebony Odogaron). Also For Mizutsune the parts to break straight up don't appear.
// Zoh shia broken parts is also wrong and some are even missing.
const getMonsterDrops__NamesAndIconId = `WITH 
numbered_parts AS (
    SELECT 
        op.*,
        mp.name AS part_name,
        mp.icon_type AS part_icon_type,
        mp.description
    FROM (
        SELECT *, ROW_NUMBER() OVER () AS original_order
        FROM monster_parts_break_array
    ) AS op
    JOIN monster_parts mp ON op.parts_type LIKE '%' || mp.fixed_id || '%'
),

indexed_parts AS (
    SELECT 
        monster_id,
        monster,
        target_category,
        part_name,
        part_icon_type,
        parts_type,
        description,
        DENSE_RANK() OVER (
            PARTITION BY monster
            ORDER BY original_order, parts_type
        ) - 1 AS part_index
    FROM numbered_parts
),

drops_with_order AS (
    SELECT 
        *,
        ROW_NUMBER() OVER () AS drops_original_order
    FROM monster_drops
),

ordered_rewards AS (
    SELECT 
        *, 
        ROW_NUMBER() OVER () AS id
    FROM monster_drops
    WHERE rank = 'HIGH' AND reward_type = 'Target Rewards'
),

ranked_rewards AS (
    SELECT 
        *,
        ROW_NUMBER() OVER (
            PARTITION BY monster, data_id 
            ORDER BY id
        ) AS row_num
    FROM ordered_rewards
),

drops_with_category AS (
    SELECT 
        monster, 
        reward_type, 
        data_id, 
        item,
        number, 
        probability,
        CASE 
            WHEN row_num = 1 THEN 'Target Rewards'
            WHEN row_num = 2 THEN 'Basic Rewards'
            WHEN row_num = 3 THEN 'Valuable Rewards'
            WHEN row_num = 4 THEN 'Guaranteed Rare Rewards'
            ELSE 'Additional Rewards'
        END AS reward_category
    FROM ranked_rewards
)

SELECT DISTINCT 
    i.id,
    d.drops_original_order,
    d.monster,
    d.reward_type,
    d.data_id,
    dwtc.reward_category,
    d.rank,
    d.item,
    i.description,
    i.rarity,
    i.icon_type as icon,
    i.icon_colour,
    p.part_name AS broken_part,
    p.part_icon_type AS broken_part_icon,
    d.number,
    d.probability,
    CASE WHEN p.description != '' THEN 'TRUE' END AS carvable_severed_part
FROM 
    drops_with_order d
    JOIN items i ON i.name = d.item
    LEFT JOIN indexed_parts p ON 
        p.part_index = CAST(d.parts_index AS bigint) AND 
        p.monster_id = d.monster_id
    LEFT JOIN drops_with_category dwtc ON 
        dwtc.monster = d.monster AND 
        dwtc.probability = d.probability AND 
        dwtc.reward_type = d.reward_type AND
        dwtc.number = d.number AND
        dwtc.data_id = d.data_id AND
        dwtc.item = d.item
Order By d.drops_original_order;`;

const getMonsterSpecialAttacksAndCounterSkills = ` WITH monster_attacks AS
  (SELECT split_part(name, CHR(10), 1) AS monster_name,
          UNNEST (regexp_split_to_array(special_attacks, ', ')) AS attack
   FROM monsters)
SELECT distinct attack, msa.description, skills.id as skill_id, category,
       skills.name AS skill,
       icon_id as icon,max_level, skills.description as skill_description,
        description_1, description_2, description_3, description_4, description_5, description_6, description_7
FROM monster_attacks JOIN monster_special_attacks msa on msa.name = attack
JOIN skills ON attack != ''
AND (skills.name ilike '%' || attack || ' Resistance%') OR
(attack ilike '%blight%' AND skills.name like '%Blight Resistance%') OR
(attack ilike '%roar%' and skills.name = 'Earplugs') OR
(attack ilike '%wind%' and skills.name = 'Windproof')  OR
(attack ilike '%tremor%' and skills.name = 'Tremor Resistance') OR
(attack ilike '%defense down%' and skills.name = 'Iron Skin') OR
(attack ilike '%flash%' and skills.name = 'Stun Resistance') OR
(attack ilike '%frenzy%' and skills.name = 'Antivirus') OR
(attack ilike '%blight%' AND skills.name ilike LEFT(attack, POSITION('blight' IN attack) - 1) || '%Resistance') OR 
(attack ilike '%webbed%' AND skills.name = 'Bind Resistance')  ;`;

module.exports = {
  getMonstersInfo__AllWeaknesses,
  getStatusIcons__NamesAndIconId,
  getMonstersPartsDamageEffectiveness__NamesAndIconId,
  getBonusQuestRewardsList,
  getMonsterDropsList,
  getMonsterSpecialAttacks__NamesAndCounterSkills,
};
