/*
  # Fix RLS policies for Usuarios table and related tables

  1. Security
    - Create proper RLS policies for user registration and data access
    - Ensure users can only access their own data
    - Add service role policies for administrative access
    - Fix column name casing issues
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can insert own profile" ON "Usuarios";
DROP POLICY IF EXISTS "Users can view own profile" ON "Usuarios";
DROP POLICY IF EXISTS "Users can update own profile" ON "Usuarios";
DROP POLICY IF EXISTS "Service role can manage all data" ON "Usuarios";

-- Create comprehensive RLS policies for Usuarios table
CREATE POLICY "Enable insert for authenticated users during registration"
  ON "Usuarios"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Enable select for users based on auth_user_id"
  ON "Usuarios"
  FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Enable update for users based on auth_user_id"
  ON "Usuarios"
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Enable delete for users based on auth_user_id"
  ON "Usuarios"
  FOR DELETE
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Service role policy for administrative access
CREATE POLICY "Service role full access"
  ON "Usuarios"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE "Usuarios" ENABLE ROW LEVEL SECURITY;

-- Add similar policies for other tables that reference Usuarios
-- Flota table policies
DROP POLICY IF EXISTS "Users can manage own fleet" ON "Flota";
CREATE POLICY "Users can manage own fleet"
  ON "Flota"
  FOR ALL
  TO authenticated
  USING (
    "id_Usuario" IN (
      SELECT "id_Usuario" FROM "Usuarios" WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    "id_Usuario" IN (
      SELECT "id_Usuario" FROM "Usuarios" WHERE auth_user_id = auth.uid()
    )
  );

-- General table policies
DROP POLICY IF EXISTS "Users can manage own shipments" ON "General";
CREATE POLICY "Users can manage own shipments"
  ON "General"
  FOR ALL
  TO authenticated
  USING (
    "id_Usuario" IN (
      SELECT "id_Usuario" FROM "Usuarios" WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    "id_Usuario" IN (
      SELECT "id_Usuario" FROM "Usuarios" WHERE auth_user_id = auth.uid()
    )
  );

-- Cotizaciones table policies
DROP POLICY IF EXISTS "Users can manage own quotes" ON "Cotizaciones";
CREATE POLICY "Users can manage own quotes"
  ON "Cotizaciones"
  FOR ALL
  TO authenticated
  USING (
    "id_Usuario" IN (
      SELECT "id_Usuario" FROM "Usuarios" WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    "id_Usuario" IN (
      SELECT "id_Usuario" FROM "Usuarios" WHERE auth_user_id = auth.uid()
    )
  );

-- Scoring table policies
DROP POLICY IF EXISTS "Users can manage own scoring" ON "Scoring";
CREATE POLICY "Users can manage own scoring"
  ON "Scoring"
  FOR ALL
  TO authenticated
  USING (
    "id_Usuario" IN (
      SELECT "id_Usuario" FROM "Usuarios" WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    "id_Usuario" IN (
      SELECT "id_Usuario" FROM "Usuarios" WHERE auth_user_id = auth.uid()
    )
  );

-- Service role policies for all tables
DROP POLICY IF EXISTS "Service role full access flota" ON "Flota";
DROP POLICY IF EXISTS "Service role full access general" ON "General";
DROP POLICY IF EXISTS "Service role full access cotizaciones" ON "Cotizaciones";
DROP POLICY IF EXISTS "Service role full access scoring" ON "Scoring";

CREATE POLICY "Service role full access flota" ON "Flota" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access general" ON "General" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access cotizaciones" ON "Cotizaciones" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access scoring" ON "Scoring" FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Ensure RLS is enabled on all tables
ALTER TABLE "Flota" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "General" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Cotizaciones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Scoring" ENABLE ROW LEVEL SECURITY;