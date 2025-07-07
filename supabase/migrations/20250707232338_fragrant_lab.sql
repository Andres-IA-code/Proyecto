/*
  # Add Oferta column to Cotizaciones table

  1. Changes
    - Add `Oferta` column to `Cotizaciones` table with numeric type
    - Set default value to 0 for data consistency
    - Allow null values for backward compatibility

  2. Notes
    - This column will store the quote amount submitted by operators
    - Uses numeric type to handle decimal values for pricing
*/

-- Add the Oferta column to the Cotizaciones table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Cotizaciones' AND column_name = 'Oferta'
  ) THEN
    ALTER TABLE "Cotizaciones" ADD COLUMN "Oferta" numeric DEFAULT 0;
  END IF;
END $$;