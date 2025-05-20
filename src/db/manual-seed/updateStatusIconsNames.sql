ALTER TABLE status_icons
ADD Column IF NOT EXISTS name varchar(255);
-- fire
UPDATE status_icons
SET name= 'Fire'
WHERE id= 'STATUS_0000';
-- water
UPDATE status_icons
SET name= 'Water'
WHERE id= 'STATUS_0001';
-- thunder
UPDATE status_icons
SET name= 'Thunder'
WHERE id= 'STATUS_0002';
-- ice 
UPDATE status_icons
SET name= 'Ice'
WHERE id= 'STATUS_0003';
-- dragon
UPDATE status_icons
SET name= 'Dragon'
WHERE id= 'STATUS_0004';
-- poison
UPDATE status_icons
SET name= 'Poison'
WHERE id= 'STATUS_0005';
-- frenzy
UPDATE status_icons
SET name= 'Frenzy'
WHERE id= 'STATUS_0006';
-- paralysis
UPDATE status_icons
SET name= 'Paralysis'
WHERE id= 'STATUS_0007';
-- stun
UPDATE status_icons
SET name= 'KO'
WHERE id= 'STATUS_0008';
-- sleep
UPDATE status_icons
SET name= 'Sleep'
WHERE id= 'STATUS_0009';
-- blast
UPDATE status_icons
SET name= 'Blast'
WHERE id= 'STATUS_0010';
-- bleed
UPDATE status_icons
SET name= 'Bleed'
WHERE id= 'STATUS_0011';
-- stamina
UPDATE status_icons
SET name= 'Stamina'
WHERE id= 'STATUS_0021';
