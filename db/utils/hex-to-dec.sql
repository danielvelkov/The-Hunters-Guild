CREATE OR REPLACE FUNCTION hex_to_decimal(hex_string TEXT)
RETURNS INT AS $$
BEGIN
    RETURN CAST(('x' || hex_string)::bit(32) AS INT);
END;
$$ LANGUAGE plpgsql;