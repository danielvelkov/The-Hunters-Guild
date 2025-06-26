CREATE OR REPLACE FUNCTION check_unique_monster_parts()
RETURNS trigger AS $$
-- Declare variables like in a code block
DECLARE
  part monster_part_focus;
  seen_parts TEXT[] := ARRAY[]::TEXT[];
  key TEXT;
BEGIN -- Executable part 
  FOREACH part IN ARRAY NEW.focused_monster_parts LOOP
    key := part.id || '|' || part.name || '|' || part.monster;
    IF key = ANY(seen_parts) THEN
      RAISE EXCEPTION 'Duplicate monster part: %', key;
    END IF;
    seen_parts := array_append(seen_parts, key); -- Append as its unique
  END LOOP;
  RETURN NEW;
END; 
$$ LANGUAGE plpgsql;