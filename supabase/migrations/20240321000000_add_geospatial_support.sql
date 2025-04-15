-- Crear tipo para almacenar geometrías
CREATE EXTENSION IF NOT EXISTS postgis;

-- Crear tabla para almacenar archivos geoespaciales
CREATE TABLE IF NOT EXISTS farm_geospatial (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  geometry GEOMETRY NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear índice espacial para mejorar el rendimiento de las consultas geoespaciales
CREATE INDEX IF NOT EXISTS farm_geospatial_geometry_idx ON farm_geospatial USING GIST (geometry);

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_farm_geospatial_updated_at
  BEFORE UPDATE ON farm_geospatial
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE farm_geospatial ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Allow authenticated users to view farm geospatial data"
  ON farm_geospatial FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert farm geospatial data"
  ON farm_geospatial FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their farm geospatial data"
  ON farm_geospatial FOR UPDATE
  TO authenticated
  USING (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()))
  WITH CHECK (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid()));

CREATE POLICY "Allow authenticated users to delete their farm geospatial data"
  ON farm_geospatial FOR DELETE
  TO authenticated
  USING (farm_id IN (SELECT id FROM farms WHERE user_id = auth.uid())); 