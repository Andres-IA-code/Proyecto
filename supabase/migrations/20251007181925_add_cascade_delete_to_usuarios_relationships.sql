/*
  # Add CASCADE DELETE to Usuarios relationships
  
  This migration ensures that when a user account is deleted from the Usuarios table,
  all related data in other tables is automatically deleted as well.
  
  1. Changes to Foreign Key Constraints
    - Updates all foreign key constraints pointing to Usuarios.id_Usuario
    - Changes from NO ACTION to CASCADE DELETE
    - Affects tables: Cotizaciones, Flota, General, Scoring, Viajes
  
  2. Security
    - Maintains existing RLS policies
    - No changes to data access control
    
  3. Important Notes
    - This ensures complete cleanup when a user deletes their account
    - All quotes, shipments, fleet, scoring, and trip data will be deleted
    - This action is irreversible
*/

-- Drop existing foreign key constraints and recreate with CASCADE DELETE

-- Cotizaciones table
DO $$ 
BEGIN
  -- Drop constraint if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'Cotizaciones_id_Usuario_fkey' 
    AND table_name = 'Cotizaciones'
  ) THEN
    ALTER TABLE "Cotizaciones" DROP CONSTRAINT "Cotizaciones_id_Usuario_fkey";
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'Cotizaciones_id_Operador_fkey' 
    AND table_name = 'Cotizaciones'
  ) THEN
    ALTER TABLE "Cotizaciones" DROP CONSTRAINT "Cotizaciones_id_Operador_fkey";
  END IF;
END $$;

-- Add new constraint with CASCADE
ALTER TABLE "Cotizaciones"
  ADD CONSTRAINT "Cotizaciones_id_Usuario_fkey"
  FOREIGN KEY ("id_Usuario")
  REFERENCES "Usuarios"("id_Usuario")
  ON DELETE CASCADE;

ALTER TABLE "Cotizaciones"
  ADD CONSTRAINT "Cotizaciones_id_Operador_fkey"
  FOREIGN KEY ("id_Operador")
  REFERENCES "Usuarios"("id_Usuario")
  ON DELETE CASCADE;

-- Flota table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'Flota_id_Usuario_fkey' 
    AND table_name = 'Flota'
  ) THEN
    ALTER TABLE "Flota" DROP CONSTRAINT "Flota_id_Usuario_fkey";
  END IF;
END $$;

ALTER TABLE "Flota"
  ADD CONSTRAINT "Flota_id_Usuario_fkey"
  FOREIGN KEY ("id_Usuario")
  REFERENCES "Usuarios"("id_Usuario")
  ON DELETE CASCADE;

-- General table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'General_id_Usuario_fkey' 
    AND table_name = 'General'
  ) THEN
    ALTER TABLE "General" DROP CONSTRAINT "General_id_Usuario_fkey";
  END IF;
END $$;

ALTER TABLE "General"
  ADD CONSTRAINT "General_id_Usuario_fkey"
  FOREIGN KEY ("id_Usuario")
  REFERENCES "Usuarios"("id_Usuario")
  ON DELETE CASCADE;

-- Scoring table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'Scoring_id_Usuario_fkey' 
    AND table_name = 'Scoring'
  ) THEN
    ALTER TABLE "Scoring" DROP CONSTRAINT "Scoring_id_Usuario_fkey";
  END IF;
END $$;

ALTER TABLE "Scoring"
  ADD CONSTRAINT "Scoring_id_Usuario_fkey"
  FOREIGN KEY ("id_Usuario")
  REFERENCES "Usuarios"("id_Usuario")
  ON DELETE CASCADE;

-- Viajes table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'Viajes_id_Usuario_fkey' 
    AND table_name = 'Viajes'
  ) THEN
    ALTER TABLE "Viajes" DROP CONSTRAINT "Viajes_id_Usuario_fkey";
  END IF;
END $$;

ALTER TABLE "Viajes"
  ADD CONSTRAINT "Viajes_id_Usuario_fkey"
  FOREIGN KEY ("id_Usuario")
  REFERENCES "Usuarios"("id_Usuario")
  ON DELETE CASCADE;