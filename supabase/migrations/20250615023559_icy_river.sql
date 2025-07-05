/*
  # Fix RLS policies for Usuarios table

  1. Security Updates
    - Drop existing INSERT policy that may be causing issues
    - Create new INSERT policy that allows authenticated users to create their own profile
    - Ensure the policy works correctly during the registration flow
    - Add policy to allow service role full access for administrative operations

  2. Policy Changes
    - "Users can insert own profile" - allows authenticated users to insert their profile
    - "Service role can manage all data" - allows service role full access
    - Keep existing SELECT and UPDATE policies as they work correctly
*/

-- Drop the existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON "Usuarios";

-- Create a new INSERT policy that allows authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON "Usuarios"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Ensure the service role policy exists for administrative operations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'Usuarios' 
    AND policyname = 'Service role can manage all data'
  ) THEN
    CREATE POLICY "Service role can manage all data"
      ON "Usuarios"
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Ensure RLS is enabled on the Usuarios table
ALTER TABLE "Usuarios" ENABLE ROW LEVEL SECURITY;