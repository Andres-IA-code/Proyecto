/*
  # Fix RLS policy for user registration

  1. Security Changes
    - Drop the existing restrictive INSERT policy for Usuarios table
    - Create a new INSERT policy that allows authenticated users to create profiles
    - The policy ensures users can only create profiles with their own auth_user_id
    - Maintains security while allowing registration to work properly

  2. Policy Details
    - Policy name: "Enable insert for authenticated users during registration"
    - Allows INSERT operations for authenticated users
    - WITH CHECK ensures auth_user_id matches the authenticated user's ID
    - This allows the signUp function to work properly during registration
*/

-- Drop the existing INSERT policy that's too restrictive
DROP POLICY IF EXISTS "Enable insert for authenticated users during registration" ON "Usuarios";

-- Create a new INSERT policy that allows profile creation during registration
CREATE POLICY "Enable insert for authenticated users during registration"
  ON "Usuarios"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Ensure the policy allows users to insert their own profile during registration
-- The key difference is that this policy will work even when the user is newly authenticated
-- during the registration process, as long as the auth_user_id matches their authenticated ID