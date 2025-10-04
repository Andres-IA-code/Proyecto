/*
  # Fix Cotizaciones Policies for Lowercase Roles

  1. Changes
    - Drop existing policies that check for 'Operador Logistico' and 'Dador de Carga'
    - Create new policies that check for 'operador' and 'dador' (lowercase, matching actual data)
  
  2. Security
    - Maintains RLS protection
    - Allows operators to view quotes they created
    - Allows dadores to view quotes for their shipments
*/

-- Drop old policies with incorrect role values
DROP POLICY IF EXISTS "dadores_can_view_own_quotes" ON "Cotizaciones";
DROP POLICY IF EXISTS "operadores_can_view_own_quotes" ON "Cotizaciones";
DROP POLICY IF EXISTS "dadores_can_update_own_quotes" ON "Cotizaciones";
DROP POLICY IF EXISTS "operadores_can_update_own_quotes" ON "Cotizaciones";
DROP POLICY IF EXISTS "operators_and_brokers_can_read_all_quotes" ON "Cotizaciones";

-- Create new policies with correct role values
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

CREATE POLICY "operators_and_brokers_can_read_all_quotes"
  ON "Cotizaciones"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM "Usuarios"
      WHERE auth_user_id = auth.uid()
      AND "Rol_Operativo" IN ('operador', 'broker')
    )
  );
