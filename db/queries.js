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

module.exports = {
  getMonstersInfo__AllWeaknesses,
  getStatusIcons__NamesAndIconId,
  getMonsterSpecialAttacks__NamesAndDescription,
};
