/*
  # Fix Cotizaciones RLS Policies

  1. Changes
    - Remove old conflicting RLS policies that compare auth.uid() directly with id_Usuario
    - Keep only the correct policies that check through the Usuarios table
    - Ensure operadores can view their own quotes through id_Operador
    - Ensure dadores can view their own quotes through id_Usuario

  2. Security
    - Operadores can view/update quotes where they are the operator (id_Operador matches)
    - Dadores can view/update quotes for their shipments (id_Usuario matches)
    - All authenticated users can insert quotes
    - Service role has full access
*/

-- Drop old conflicting policies
DROP POLICY IF EXISTS "usuarios_ven_sus_cotizaciones" ON "Cotizaciones";
DROP POLICY IF EXISTS "usuarios_crean_sus_cotizaciones" ON "Cotizaciones";
DROP POLICY IF EXISTS "usuarios_actualizan_sus_cotizaciones" ON "Cotizaciones";
DROP POLICY IF EXISTS "usuarios_eliminan_sus_cotizaciones" ON "Cotizaciones";

-- Ensure the correct policies exist
-- These policies already exist but we'll recreate them to be sure

-- Policy for operators to view their own quotes
DROP POLICY IF EXISTS "operadores_can_view_own_quotes" ON "Cotizaciones";
CREATE POLICY "operadores_can_view_own_quotes"
  ON "Cotizaciones"
  FOR SELECT
  TO authenticated
  USING (
    "id_Operador" IN (
      SELECT "id_Usuario"
      FROM "Usuarios"
      WHERE auth_user_id = auth.uid()
      AND "Rol_Operativo" = 'operador'
    )
  );

-- Policy for operators to update their own quotes
DROP POLICY IF EXISTS "operadores_can_update_own_quotes" ON "Cotizaciones";
CREATE POLICY "operadores_can_update_own_quotes"
  ON "Cotizaciones"
  FOR UPDATE
  TO authenticated
  USING (
    "id_Operador" IN (
      SELECT "id_Usuario"
      FROM "Usuarios"
      WHERE auth_user_id = auth.uid()
      AND "Rol_Operativo" = 'operador'
    )
  )
  WITH CHECK (
    "id_Operador" IN (
      SELECT "id_Usuario"
      FROM "Usuarios"
      WHERE auth_user_id = auth.uid()
      AND "Rol_Operativo" = 'operador'
    )
  );

-- Policy for dadores to view quotes for their shipments
DROP POLICY IF EXISTS "dadores_can_view_own_quotes" ON "Cotizaciones";
CREATE POLICY "dadores_can_view_own_quotes"
  ON "Cotizaciones"
  FOR SELECT
  TO authenticated
  USING (
    "id_Usuario" IN (
      SELECT "id_Usuario"
      FROM "Usuarios"
      WHERE auth_user_id = auth.uid()
      AND "Rol_Operativo" = 'dador'
    )
  );

-- Policy for dadores to update quotes for their shipments
DROP POLICY IF EXISTS "dadores_can_update_own_quotes" ON "Cotizaciones";
CREATE POLICY "dadores_can_update_own_quotes"
  ON "Cotizaciones"
  FOR UPDATE
  TO authenticated
  USING (
    "id_Usuario" IN (
      SELECT "id_Usuario"
      FROM "Usuarios"
      WHERE auth_user_id = auth.uid()
      AND "Rol_Operativo" = 'dador'
    )
  )
  WITH CHECK (
    "id_Usuario" IN (
      SELECT "id_Usuario"
      FROM "Usuarios"
      WHERE auth_user_id = auth.uid()
      AND "Rol_Operativo" = 'dador'
    )
  );

-- Policy for all authenticated users to insert quotes
DROP POLICY IF EXISTS "authenticated_users_can_insert_quotes" ON "Cotizaciones";
CREATE POLICY "authenticated_users_can_insert_quotes"
  ON "Cotizaciones"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Keep the policy for operators and brokers to read all quotes (for marketplace)
-- This policy already exists: operators_and_brokers_can_read_all_quotes