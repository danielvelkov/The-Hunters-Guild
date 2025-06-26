-- ENUMS ( won't change ever )
CREATE TYPE star_rank_enum AS ENUM ('LOW', 'HIGH', '1', '2', '3', '4', '5', '6', '7', '8', '9');

CREATE TYPE locale_enum AS ENUM (
  'Iceshard Cliffs',
  'Ruins of Wyveria',
  'Wounded Hollow',
  'Rimechain Peak',
  'Dragontorch Shrine',
  'Training Area',
  'Scarlet Forest',
  'Oilwell Basin',
  'Windward Plains',
  'Cavern Tunnel'
);

CREATE TYPE slot_config_type_enum AS ENUM ('Flexible', 'Custom', 'Preset');

-- FOR HUNTING QUEST TABLE

CREATE TABLE quest_categories (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

INSERT INTO quest_categories VALUES 
    (1, 'Assignment'),
    (2, 'Optional'),
    (3, 'Event'),
    (4, 'Field Survey'),
    (5, 'Saved Investigation'),
    (6, 'Arena Quest'),
    (7, 'Challenge Quest'),
    (8, 'Free Challenge Quest');

CREATE TABLE quest_types (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

INSERT INTO quest_types VALUES
    (1, 'Hunt'),
    (2, 'Slay'),
    (3, 'Capture'),
    (4, 'Repel'),
    (5, 'Other');

CREATE TABLE monster_variants (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

INSERT INTO monster_variants VALUES
    (1, 'Base'),
    (2, 'Frenzied'),
    (3, 'Tempered'),
    (4, 'Arch Tempered');

CREATE TABLE gaming_platforms (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

INSERT INTO gaming_platforms VALUES
    (1, 'PC'),
    (2, 'Xbox'),
    (3, 'PlayStation');

CREATE TABLE monster_crowns (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

INSERT INTO monster_crowns VALUES
    (1, 'Base'),
    (2, 'Mini'),
    (3, 'Silver'),
    (4, 'Gold');

-- MAIN HUNTING QUESTS TABLE

CREATE TABLE hunting_quests (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title VARCHAR(100),
    description VARCHAR(100),
    category_id INTEGER NOT NULL REFERENCES quest_categories(id),
    type_id INTEGER NOT NULL REFERENCES quest_types(id),
    star_rank star_rank_enum NOT NULL,
    area locale_enum NOT NULL,
    hr_requirement INTEGER,
    time_limit INTEGER,
    crossplay_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HUNTING QUEST JOIN TABLES

CREATE TABLE quest_monsters (
    quest_id INTEGER NOT NULL REFERENCES hunting_quests(id),
    monster_id text NOT NULL REFERENCES monsters(em_id), --PK MUST BE MANUALLY SET
    variant_id INTEGER NOT NULL REFERENCES monster_variants(id),
    crown_id INTEGER NOT NULL REFERENCES monster_crowns(id),
    strength INTEGER
);


CREATE TABLE quest_bonus_rewards (
    quest_id INTEGER NOT NULL REFERENCES hunting_quests(id),
    item_id text NOT NULL REFERENCES items(id), --PK MUST BE MANUALLY SET
    quantity INTEGER,
    UNIQUE(quest_id, item_id)
);

CREATE TABLE quest_crossplay_platforms (
    quest_id INTEGER NOT NULL REFERENCES hunting_quests(id),
    gaming_platform_id INTEGER NOT NULL REFERENCES gaming_platforms(id),
    UNIQUE(quest_id, gaming_platform_id)
);

CREATE TYPE monster_part_focus AS (
    id integer,
    name text,
    monster text
);

CREATE TABLE loadouts (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(100)
);

CREATE TABLE player_slots (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    quest_id INTEGER NOT NULL REFERENCES hunting_quests(id),
    slot_index INTEGER NOT NULL,
    loadout_id INTEGER NOT NULL REFERENCES loadouts(id),
    slot_config_type slot_config_type_enum NOT NULL,
    display_name VARCHAR(50) NOT NULL,
    is_owner BOOLEAN DEFAULT false,
    notes VARCHAR(100),
    can_edit BOOLEAN DEFAULT true,
    focused_monster_parts monster_part_focus[]
);

