-- monsters.sql
-- Get all monsters and their details like - item and status effectiveness; main weaknesses etc. 
WITH
    monsters AS (
        SELECT
            m.em_id,
            REPLACE (
                concat (
                    'E',
                    to_char (hex_to_decimal (boss_icon_type_raw) -1, '0099')
                ),
                ' ',
                ''
            ) AS large_monster_icon_id,
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
        FROM
            monsters m
            JOIN monster_ailment_resistances ON m.name = monster_ailment_resistances.monster
            OR m.name like monster_ailment_resistances.monster || CHR (10) || '%'
            JOIN enemydata e ON e.em_id = m.em_id
    )
SELECT DISTINCT
    em_id,
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
    concat (
        weakness,
        coalesce(
            '; ' || NULLIF(
                (
                    SELECT
                        string_agg (upper(KEY), ', ')
                    FROM
                        (
                            SELECT
                                (jsonb_each_text).key AS KEY,
                                (jsonb_each_text).value AS value
                            FROM
                                (
                                    SELECT
                                        jsonb_each_text (to_jsonb (mar.*))
                                    FROM
                                        monster_ailment_resistances mar
                                    WHERE
                                        monsters.name = mar.monster
                                ) AS sub
                            WHERE
                                (jsonb_each_text).key IN ('ko', 'blast', 'sleep', 'paralysis', 'poison')
                                AND (jsonb_each_text).value like '⭐⭐%'
                        ) AS sub
                ),
                ''
            ),
            ''
        )
    ) AS all_weaknesses
FROM
    monsters
WHERE
    CLASS = 'Large';