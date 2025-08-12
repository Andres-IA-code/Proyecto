/*
  # Create Viajes table for trip counters

  1. New Tables
    - `Viajes`
      - `id_Viaje` (integer, primary key)
      - `id_Usuario` (integer, foreign key to Usuarios)
      - `Viaje_Programado` (integer, default 0)
      - `Viaje_Curso` (integer, default 0) 
      - `Viaje_Completados` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `Viajes` table
    - Add policy for users to manage their own trip counters
*/

CREATE TABLE IF NOT EXISTS "Viajes" (
  id_Viaje SERIAL PRIMARY KEY,
  id_Usuario INTEGER NOT NULL,
  Viaje_Programado INTEGER DEFAULT 0,
  Viaje_Curso INTEGER DEFAULT 0,
  Viaje_Completados INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_viajes_usuario FOREIGN KEY (id_Usuario) REFERENCES "Usuarios"(id_Usuario) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE "Viajes" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own trip counters"
  ON "Viajes"
  FOR ALL
  TO authenticated
  USING (id_Usuario IN (
    SELECT id_Usuario 
    FROM "Usuarios" 
    WHERE auth_user_id = auth.uid()
  ))
  WITH CHECK (id_Usuario IN (
    SELECT id_Usuario 
    FROM "Usuarios" 
    WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Service role full access viajes"
  ON "Viajes"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_viajes_id_usuario ON "Viajes"(id_Usuario);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_viajes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_viajes_updated_at
  BEFORE UPDATE ON "Viajes"
  FOR EACH ROW
  EXECUTE FUNCTION update_viajes_updated_at();