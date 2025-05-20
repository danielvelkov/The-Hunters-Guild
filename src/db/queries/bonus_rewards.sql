-- bonus-rewards.sql
-- Get all bonus quest rewards that appear in Field/Saved Investigations
SELECT DISTINCT
  id,
  name,
  description,
  rarity,
  icon_type AS icon,
  icon_colour,
  get_rank_1,
  dropped_by,
  CASE
    WHEN add_icon_type = 'INGREDIENTS' THEN 'Food Ingredient'
    WHEN dropped_by != '' THEN 'Rare Drop'
    WHEN add_icon_type = 'FOR_ATTACK' THEN 'Sword Decoration'
    WHEN add_icon_type = 'FOR_DEFENSE' THEN 'Armor Decoration'
    WHEN type = 'GEM'
    AND add_icon_type = 'INVALID' THEN 'Artisan Part'
    ELSE 'Monster Material'
  END as type
FROM
  items
  LEFT JOIN (
    SELECT
      item,
      string_agg (monster, ',') AS dropped_by
    FROM
      monster_drops
    WHERE
      probability != ''
      AND CAST(probability AS float) = 1
      AND rank = 'HIGH'
      AND reward_type = 'Target Rewards'
    GROUP BY
      item
  ) AS rare_items ON rare_items.item = name
WHERE
  (
    (
      TYPE = 'GEM'
      AND name not ilike 'old%'
      OR add_icon_type = 'INGREDIENTS'
      and cast(rarity as int) > 4
    )
    OR (
      TYPE = 'MATERIAL'
      AND dropped_by != ''
    )
  )
  OR (
    NAME = 'Basic Material'
    OR NAME = 'Valuable Material'
  );