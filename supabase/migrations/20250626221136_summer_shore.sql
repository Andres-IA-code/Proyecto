/*
  # Agregar campo Parada_Programada a la tabla General

  1. New Columns
    - `Parada_Programada` (text) - Para almacenar las paradas programadas del envío

  2. Changes
    - Agregar columna para almacenar paradas programadas separadamente
*/

-- Agregar columna Parada_Programada a la tabla General
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'General' AND column_name = 'Parada_Programada'
  ) THEN
    ALTER TABLE "General" ADD COLUMN "Parada_Programada" text;
  END IF;
END $$;