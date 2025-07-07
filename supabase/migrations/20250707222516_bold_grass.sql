/*
  # Fix Cotizaciones table relationships and data structure

  1. Security
    - Ensure proper foreign key relationships exist
    - Add missing constraints if needed
    - Update RLS policies for proper data access

  2. Changes
    - Verify and fix foreign key constraint for id_Operador
    - Ensure id_Envio foreign key exists
    - Add proper indexes for performance
*/

-- Ensure foreign key constraint exists for id_Operador
DO $$
BEGIN
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
END $$;

-- Ensure foreign key constraint exists for id_Envio
DO $$
BEGIN
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_cotizaciones_id_usuario" ON "Cotizaciones"("id_Usuario");
CREATE INDEX IF NOT EXISTS "idx_cotizaciones_id_operador" ON "Cotizaciones"("id_Operador");
CREATE INDEX IF NOT EXISTS "idx_cotizaciones_id_envio" ON "Cotizaciones"("id_Envio");
CREATE INDEX IF NOT EXISTS "idx_cotizaciones_fecha" ON "Cotizaciones"("Fecha");

-- Update RLS policies to ensure proper access
DROP POLICY IF EXISTS "Users can view quotes for their shipments" ON "Cotizaciones";
CREATE POLICY "Users can view quotes for their shipments"
  ON "Cotizaciones"
  FOR SELECT
  TO authenticated
  USING (
    "id_Usuario" IN (
      SELECT "id_Usuario" FROM "Usuarios" WHERE auth_user_id = auth.uid()
    )
    OR
    "id_Operador" IN (
      SELECT "id_Usuario" FROM "Usuarios" WHERE auth_user_id = auth.uid()
    )
  );

-- Ensure service role can access all data
DROP POLICY IF EXISTS "Service role full access cotizaciones" ON "Cotizaciones";
CREATE POLICY "Service role full access cotizaciones"
  ON "Cotizaciones"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);