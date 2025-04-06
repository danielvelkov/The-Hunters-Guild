const getMonstersAndWeaknesses = `SELECT
  em_id,
  large_monster_icon_id,
  name,
  frenzied,
  tempered,
  arch_tempered,
  locale,
  CONCAT(
    weakness,
    COALESCE(
      ', ' || NULLIF(
        (SELECT STRING_AGG(upper(key), ', ')
         FROM (
           SELECT (jsonb_each_text).key AS key, (jsonb_each_text).value AS value
           FROM (
             SELECT jsonb_each_text(to_jsonb(bc2.*))
             FROM badcondition2 bc2
             WHERE bc2.name = m.name
           ) subquery
           WHERE (jsonb_each_text).value = '⭐⭐⭐'
         ) inner_query
        ),
        ''
      ),
      ''
    )
  ) AS all_weaknesses
FROM monsters m;`;
