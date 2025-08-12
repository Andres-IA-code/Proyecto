/*
  # Fix Viajes table RLS policies

  1. Security Updates
    - Add INSERT policy for authenticated users to create their own counters
    - Ensure users can only manage their own trip counters
    - Allow service role full access for administrative operations

  2. Policy Details
    - INSERT: Users can create counters for their own user ID
    - SELECT/UPDATE/DELETE: Users can only access their own counters
    - Service role: Full access for system operations
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage own trip counters" ON "Viajes";
DROP POLICY IF EXISTS "Service role full access viajes" ON "Viajes";

-- Create comprehensive RLS policies for Viajes table
CREATE POLICY "Users can insert own trip counters"
  ON "Viajes"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    "id_Usuario" IN (
      SELECT "id_Usuario" 
      FROM "Usuarios" 
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own trip counters"
  ON "Viajes"
  FOR SELECT
  TO authenticated
  USING (
    "id_Usuario" IN (
      SELECT "id_Usuario" 
      FROM "Usuarios" 
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own trip counters"
  ON "Viajes"
  FOR UPDATE
  TO authenticated
  USING (
    "id_Usuario" IN (
      SELECT "id_Usuario" 
      FROM "Usuarios" 
      WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    "id_Usuario" IN (
      SELECT "id_Usuario" 
      FROM "Usuarios" 
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Service role full access viajes"
  ON "Viajes"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);