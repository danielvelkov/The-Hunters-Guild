--Make sure no repeating monster parts are added
CREATE TRIGGER enforce_unique_monster_parts
BEFORE INSERT OR UPDATE ON player_slots
FOR EACH ROW
EXECUTE FUNCTION check_unique_monster_parts();