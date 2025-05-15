SELECT
    id,
    category,
    name,
    icon_id,
    CASE
    WHEN max_level != '' THEN max_level 
    WHEN category = 'MEAL' and max_level = '' THEN '1'
    WHEN category = 'GROUP' THEN '1'
    WHEN category = 'SERIES' THEN '2'
    ELSE max_level
END as max_level,
    set_count,
    description,
    description_1,
    description_2,
    description_3,
    description_4,
    description_5,
    description_6,
    description_7
FROM
    skills where name != '' AND icon_id != '' AND icon_id != 'INVALID';