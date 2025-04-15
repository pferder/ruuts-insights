-- Insert Mapbox token
-- Note: Replace 'YOUR_MAPBOX_TOKEN' with the actual token
INSERT INTO secrets (key, value)
VALUES ('mapbox_token', 'YOUR_MAPBOX_TOKEN')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value; 