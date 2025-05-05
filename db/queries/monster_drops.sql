-- monster_drops.sql 
-- Get all monster drops and rewards.

-- # Bonus rewards for specific Monster

-- The 'target rewards' type in 'monster drops' table for high rank are the bonus rewards, which can be - basic, valuable and rare (100% like the rathian ruby for example)

-- So for rathian - 500 dataid high rank bonus 'target rewards' are 3

-- 1. Basic rewards- Rathian scale+
-- 2. Valuable rewards - Rathian Webbing
-- 3. Rare (100% bonus rewards) - Rathian Ruby

-- 501 is the next row of rewards following the mentioned above principle by row index order.

-- # Part breaking rewards for specific monster

-- In "monster drops.csv" you can see which part index you must break to get specific rewards.

-- It is not 100% complete.
-- I had to edit the sheet 'monster parts' and 'monster parts break array' for
-- it to have all the values. Also Some monsters are completely off (Like Gore Magala). Hope it gets fixed.

-- Rewards in 'monster drops.csv' that are type 'Broken Part Rewards' have a part index field.
-- That part index is actually the index in the 'Monster Parts Break Array' of that group of parts for a monster.
-- Example:

-- Quematrice has a broken part index 2 for the crest.
-- In the Monster Parts Break Array the HEAD part is at index 2 of that monster's group of rows

WITH
    numbered_parts AS (
        SELECT
            op.*,
            mp.name AS part_name,
            mp.icon_type AS part_icon_type,
            mp.description
        FROM
            (
                SELECT
                    *,
                    ROW_NUMBER() OVER () AS original_order
                FROM
                    monster_parts_break_array
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
                PARTITION BY
                    monster
                ORDER BY
                    original_order,
                    parts_type
            ) - 1 AS part_index
        FROM
            numbered_parts
    ),
    drops_with_order AS (
        SELECT
            *,
            ROW_NUMBER() OVER () AS drops_original_order
        FROM
            monster_drops
    ),
    ordered_rewards AS (
        SELECT
            *,
            ROW_NUMBER() OVER () AS id
        FROM
            monster_drops
        WHERE
            rank = 'HIGH'
            AND reward_type = 'Target Rewards'
    ),
    ranked_rewards AS (
        SELECT
            *,
            ROW_NUMBER() OVER (
                PARTITION BY
                    monster,
                    data_id
                ORDER BY
                    id
            ) AS row_num
        FROM
            ordered_rewards
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
        FROM
            ranked_rewards
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
    CASE
        WHEN p.description != '' THEN 'TRUE'
    END AS carvable_severed_part
FROM
    drops_with_order d
    JOIN items i ON i.name = d.item
    LEFT JOIN indexed_parts p ON p.part_index = CAST(d.parts_index AS bigint)
    AND p.monster_id = d.monster_id
    LEFT JOIN drops_with_category dwtc ON dwtc.monster = d.monster
    AND dwtc.probability = d.probability
    AND dwtc.reward_type = d.reward_type
    AND dwtc.number = d.number
    AND dwtc.data_id = d.data_id
    AND dwtc.item = d.item
Order By
    d.drops_original_order;