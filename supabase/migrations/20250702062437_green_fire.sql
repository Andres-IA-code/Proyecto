/*
  # Agregar campo Nombre_Dador a la tabla General

  1. New Columns
    - `Nombre_Dador` (text) - Para almacenar el nombre del dador de carga

  2. Changes
    - Agregar columna para identificar quién solicita el envío
*/

-- Agregar columna Nombre_Dador a la tabla General
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'General' AND column_name = 'Nombre_Dador'
  ) THEN
    ALTER TABLE "General" ADD COLUMN "Nombre_Dador" text;
  END IF;
END $$;