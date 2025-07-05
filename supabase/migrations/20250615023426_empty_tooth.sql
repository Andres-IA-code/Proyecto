/*
  # Fix RLS policies for user registration

  1. Security Updates
    - Update INSERT policy to allow new user registration
    - Ensure SELECT policy works correctly for authenticated users
    - Maintain security while allowing proper registration flow

  The issue is that during registration, we need to allow users to insert their profile
  data immediately after Supabase Auth creates their account, but before they're fully
  authenticated in the application context.
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can insert own profile" ON "Usuarios";
DROP POLICY IF EXISTS "Users can view own profile" ON "Usuarios";
DROP POLICY IF EXISTS "Users can update own profile" ON "Usuarios";

-- Create new INSERT policy that allows authenticated users to insert their own profile
-- This works because after supabase.auth.signUp(), the user is authenticated
CREATE POLICY "Users can insert own profile"
  ON "Usuarios"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

-- Create SELECT policy for users to read their own profile
CREATE POLICY "Users can view own profile"
  ON "Usuarios"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

-- Create UPDATE policy for users to update their own profile
CREATE POLICY "Users can update own profile"
  ON "Usuarios"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- Keep the service role policy for admin operations
-- (This should already exist, but ensuring it's there)
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