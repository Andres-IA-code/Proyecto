/*
  # Add Supabase Auth integration to Usuarios table

  1. New Columns
    - `auth_user_id` (uuid) - Links to Supabase Auth users table
  
  2. Security
    - Update RLS policies to use Supabase Auth
    - Enable proper user isolation
    - Allow service role access for admin operations

  3. Changes
    - Add foreign key constraint to auth.users
    - Add unique constraint for one profile per auth user
    - Update all policies to use auth.uid()
*/

-- Add auth_user_id column to Usuarios table
ALTER TABLE "Usuarios" 
ADD COLUMN IF NOT EXISTS "auth_user_id" uuid;

-- Add foreign key constraint to auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'usuarios_auth_user_id_fkey'
  ) THEN
    ALTER TABLE "Usuarios" 
    ADD CONSTRAINT "usuarios_auth_user_id_fkey" 
    FOREIGN KEY ("auth_user_id") REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add unique constraint to ensure one profile per auth user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'usuarios_auth_user_id_unique'
  ) THEN
    ALTER TABLE "Usuarios" 
    ADD CONSTRAINT "usuarios_auth_user_id_unique" UNIQUE ("auth_user_id");
  END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous user registration" ON "Usuarios";
DROP POLICY IF EXISTS "Allow public read access" ON "Usuarios";

-- Create new policies for authenticated users
CREATE POLICY "Users can view own profile"
  ON "Usuarios"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile"
  ON "Usuarios"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own profile"
  ON "Usuarios"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

-- Allow service role to manage all data (for admin operations)
CREATE POLICY "Service role can manage all data"
  ON "Usuarios"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);