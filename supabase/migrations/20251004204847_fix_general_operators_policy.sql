/*
  # Fix Operators Policy for General Table

  1. Changes
    - Drop the existing policy that checks for 'Operador Logistico'
    - Create a new policy that checks for 'operador' (lowercase, matching actual data)
  
  2. Security
    - Maintains RLS protection
    - Allows operators to view all shipment opportunities
*/

-- Drop the old policy
DROP POLICY IF EXISTS "Operators can read all shipments" ON "General";

-- Create new policy with correct role value
CREATE POLICY "Operators can read all shipments"
  ON "General"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM "Usuarios"
      WHERE "Usuarios".auth_user_id = auth.uid()
      AND "Usuarios"."Rol_Operativo" = 'operador'
    )
  );
