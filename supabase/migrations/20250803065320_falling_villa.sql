/*
  # Add Nombre_Dador field to Cotizaciones table

  1. Changes
    - Add `Nombre_Dador` column to `Cotizaciones` table
    - Column type: TEXT (nullable)
    - Allows storing the name of the cargo giver for each quote

  2. Purpose
    - Store the name of the cargo giver when quotes are created
    - Enables better tracking and filtering of quotes by cargo giver
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Cotizaciones' AND column_name = 'Nombre_Dador'
  ) THEN
    ALTER TABLE "Cotizaciones" ADD COLUMN "Nombre_Dador" TEXT;
  END IF;
END $$;