-- parts_dmg_eff.sql
-- Selects all dmg effectiveness for all monsters' parts. Higher is better.
SELECT DISTINCT
    monster_parts.index as id,
    m.monster_id,
    m.monster,
    name as parts_type,
    monster_parts.icon_type as icon,
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
from
    monster_parts_array
    join monster_meat_array m on m.instance_guid = monster_parts_array.meat_guid_normal
    join monster_parts on parts_type_raw = monster_parts.fixed_id
where
    icon_type != ''
order by
    m.monster;