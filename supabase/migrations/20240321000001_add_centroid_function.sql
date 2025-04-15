-- Crear función para calcular el centroide
CREATE OR REPLACE FUNCTION st_centroid(geom GEOMETRY)
RETURNS TABLE (
  x DOUBLE PRECISION,
  y DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ST_X(ST_Centroid(geom))::DOUBLE PRECISION,
    ST_Y(ST_Centroid(geom))::DOUBLE PRECISION;
END;
$$ LANGUAGE plpgsql; 