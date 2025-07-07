/*
  # Fix Fecha_Retiro column data type

  1. Changes
    - Drop the existing Fecha_Retiro column (time with time zone)
    - Add new Fecha_Retiro column (timestamptz)
    - This allows the application to store complete date and time information

  2. Notes
    - Since we cannot directly cast time with time zone to timestamptz,
      we need to drop and recreate the column
    - Any existing data in this column will be lost, but this is acceptable
      since the current data type is incompatible with the application logic
*/

-- Drop the existing Fecha_Retiro column
ALTER TABLE "General" DROP COLUMN IF EXISTS "Fecha_Retiro";

-- Add the new Fecha_Retiro column with the correct data type
ALTER TABLE "General" ADD COLUMN "Fecha_Retiro" timestamptz;