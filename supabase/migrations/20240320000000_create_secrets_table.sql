-- Create secrets table
CREATE TABLE IF NOT EXISTS secrets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at
CREATE TRIGGER update_secrets_updated_at
  BEFORE UPDATE ON secrets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated users to read secrets
CREATE POLICY "Allow authenticated users to read secrets"
  ON secrets FOR SELECT
  TO authenticated
  USING (true);

-- Only allow service role to insert/update/delete secrets
CREATE POLICY "Allow service role to manage secrets"
  ON secrets FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true); 