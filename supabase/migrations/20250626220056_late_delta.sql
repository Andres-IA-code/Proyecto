/*
  # Agregar campo Tiempo_Estimado_Operacion a la tabla General

  1. New Columns
    - `Tiempo_Estimado_Operacion` (text) - Campo para almacenar el tiempo estimado de la operación

  2. Changes
    - Agregar nueva columna a la tabla General para almacenar el tiempo estimado que ingresa el usuario
*/

-- Agregar columna Tiempo_Estimado_Operacion a la tabla General
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'General' AND column_name = 'Tiempo_Estimado_Operacion'
  ) THEN
    ALTER TABLE "General" ADD COLUMN "Tiempo_Estimado_Operacion" text;
  END IF;
END $$;