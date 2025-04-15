-- Create a function to calculate the centroid of a geometry
CREATE OR REPLACE FUNCTION st_centroid(geom geometry)
RETURNS TABLE (x double precision, y double precision)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ST_X(ST_Centroid(geom)) as x,
    ST_Y(ST_Centroid(geom)) as y;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION st_centroid(geometry) TO authenticated; 