/*
  # Fix Fecha_Retiro column data type

  1. Changes
    - Change `Fecha_Retiro` column from `time with time zone` to `timestamptz` (timestamp with time zone)
    - This allows storing complete date and time information instead of just time

  2. Reasoning
    - The application sends full datetime strings like "2025-07-08T08:44:00+00:00"
    - The current `time with time zone` type can only store time information
    - `timestamptz` is the correct PostgreSQL type for storing complete date and time with timezone
*/

-- Change the Fecha_Retiro column type to timestamptz
ALTER TABLE "General" 
ALTER COLUMN "Fecha_Retiro" TYPE timestamptz 
USING "Fecha_Retiro"::timestamptz;