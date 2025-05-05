-- spec_att_counters.sql
-- Get all unique monster attacks and their skill counters
WITH
    monster_attacks AS (
        SELECT
            split_part (name, CHR (10), 1) AS monster_name,
            UNNEST (regexp_split_to_array (special_attacks, ', ')) AS attack
        FROM
            monsters
    )
SELECT distinct
    attack,
    msa.description,
    skills.id as skill_id,
    category,
    skills.name AS skill,
    icon_id as icon,
    max_level,
    skills.description as skill_description,
    description_1,
    description_2,
    description_3,
    description_4,
    description_5,
    description_6,
    description_7
FROM
    monster_attacks
    JOIN monster_special_attacks msa on msa.name = attack
    JOIN skills ON attack != ''
    AND (skills.name ilike '%' || attack || ' Resistance%')
    OR (
        attack ilike '%blight%'
        AND skills.name like '%Blight Resistance%'
    )
    OR (
        attack ilike '%roar%'
        and skills.name = 'Earplugs'
    )
    OR (
        attack ilike '%wind%'
        and skills.name = 'Windproof'
    )
    OR (
        attack ilike '%tremor%'
        and skills.name = 'Tremor Resistance'
    )
    OR (
        attack ilike '%defense down%'
        and skills.name = 'Iron Skin'
    )
    OR (
        attack ilike '%flash%'
        and skills.name = 'Stun Resistance'
    )
    OR (
        attack ilike '%frenzy%'
        and skills.name = 'Antivirus'
    )
    OR (
        attack ilike '%blight%'
        AND skills.name ilike LEFT (attack, POSITION('blight' IN attack) - 1) || '%Resistance'
    )
    OR (
        attack ilike '%webbed%'
        AND skills.name = 'Bind Resistance'
    );