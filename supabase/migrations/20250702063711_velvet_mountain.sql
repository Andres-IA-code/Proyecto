/*
  # Agregar campo Horario_Retiro a la tabla General

  1. New Columns
    - `Horario_Retiro` (time without time zone) - Para almacenar la hora de retiro específicamente

  2. Changes
    - Agregar columna para almacenar la hora de retiro por separado
*/

-- Agregar columna Horario_Retiro a la tabla General
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'General' AND column_name = 'Horario_Retiro'
  ) THEN
    ALTER TABLE "General" ADD COLUMN "Horario_Retiro" time without time zone;
  END IF;
END $$;