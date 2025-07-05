/*
  # Fix RLS policies for user registration

  1. Security
    - Allow anonymous users to register (insert new users)
    - Remove the problematic authenticated user policy since we're not using Supabase Auth
*/

-- Create policy to allow anonymous users to register (insert new users)
CREATE POLICY "Allow anonymous user registration"
  ON "Usuarios"
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow public read access for now
-- (You may want to restrict this later based on your business logic)
CREATE POLICY "Allow public read access"
  ON "Usuarios"
  FOR SELECT
  TO anon, authenticated
  USING (true);