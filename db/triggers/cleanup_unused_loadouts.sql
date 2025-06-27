CREATE OR REPLACE FUNCTION cleanup_unused_loadouts()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete loadouts that are no longer referenced by any player_slot
    DELETE FROM loadouts 
    WHERE id = OLD.loadout_id 
    AND NOT EXISTS (
        SELECT 1 FROM player_slots 
        WHERE loadout_id = OLD.loadout_id
    );
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;