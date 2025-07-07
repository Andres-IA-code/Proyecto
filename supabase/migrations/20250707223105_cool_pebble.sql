/*
  # Fix Cotizaciones table relationships and policies

  1. Foreign Keys
    - Ensure proper foreign key relationships exist
    - Add constraints for data integrity

  2. Security
    - Update RLS policies for proper access control
    - Allow users to see quotes for their shipments
    - Allow operators to see quotes they created

  3. Indexes
    - Add performance indexes for common queries
*/

-- Ensure foreign key constraints exist
DO $$
BEGIN
  -- Foreign key for id_Operador -> Usuarios
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'Cotizaciones_id_Operador_fkey' 
    AND table_name = 'Cotizaciones'
  ) THEN
    ALTER TABLE "Cotizaciones" 
    ADD CONSTRAINT "Cotizaciones_id_Operador_fkey" 
    FOREIGN KEY ("id_Operador") 
    REFERENCES "Usuarios"("id_Usuario") 
    ON UPDATE CASCADE 
    ON DELETE SET NULL;
  END IF;

  -- Foreign key for id_Envio -> General
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'Cotizaciones_id_Envio_fkey' 
    AND table_name = 'Cotizaciones'
  ) THEN
    ALTER TABLE "Cotizaciones" 
    ADD CONSTRAINT "Cotizaciones_id_Envio_fkey" 
    FOREIGN KEY ("id_Envio") 
    REFERENCES "General"("id_Envio") 
    ON UPDATE CASCADE 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS "idx_cotizaciones_id_usuario" ON "Cotizaciones"("id_Usuario");
CREATE INDEX IF NOT EXISTS "idx_cotizaciones_id_operador" ON "Cotizaciones"("id_Operador");
CREATE INDEX IF NOT EXISTS "idx_cotizaciones_id_envio" ON "Cotizaciones"("id_Envio");
CREATE INDEX IF NOT EXISTS "idx_cotizaciones_fecha" ON "Cotizaciones"("Fecha");

-- Enable RLS
ALTER TABLE "Cotizaciones" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can manage own quotes" ON "Cotizaciones";
DROP POLICY IF EXISTS "Users can view quotes for their shipments" ON "Cotizaciones";
DROP POLICY IF EXISTS "Service role full access cotizaciones" ON "Cotizaciones";

-- Policy for users to manage quotes they created (as operators)
CREATE POLICY "Users can manage own quotes"
  ON "Cotizaciones"
  FOR ALL
  TO authenticated
  USING (
    "id_Usuario" IN (
      SELECT "id_Usuario" FROM "Usuarios" WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    "id_Usuario" IN (
      SELECT "id_Usuario" FROM "Usuarios" WHERE auth_user_id = auth.uid()
    )
  );

-- Policy for users to view quotes for their shipments (as dadores)
CREATE POLICY "Users can view quotes for their shipments"
  ON "Cotizaciones"
  FOR SELECT
  TO authenticated
  USING (
    -- User can see quotes for shipments they own
    "id_Usuario" IN (
      SELECT "id_Usuario" FROM "Usuarios" WHERE auth_user_id = auth.uid()
    )
    OR
    -- User can see quotes they created as operators
    "id_Operador" IN (
      SELECT "id_Usuario" FROM "Usuarios" WHERE auth_user_id = auth.uid()
    )
  );

-- Service role policy for administrative access
CREATE POLICY "Service role full access cotizaciones"
  ON "Cotizaciones"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);