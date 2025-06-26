ALTER TABLE weapon_types
ADD PRIMARY KEY (index);

ALTER TABLE weapon_attributes
ADD PRIMARY KEY (index);

ALTER TABLE monsters
ADD PRIMARY KEY (em_id);

-- Remove empty skills
DELETE FROM skills
WHERE id = '00000000';

ALTER TABLE skills
ADD PRIMARY KEY (id);

ALTER TABLE items
ADD PRIMARY KEY (id);