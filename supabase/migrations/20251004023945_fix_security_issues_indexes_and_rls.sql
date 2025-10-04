/*
  # Fix Security Issues - Indexes and RLS Performance

  ## Changes Made
  
  1. **Add Missing Indexes for Foreign Keys**
     - Add index on Flota.id_Usuario (foreign key to Usuarios)
     - Add index on General.id_Usuario (foreign key to Usuarios)
     - Add index on Scoring.id_Envio (foreign key to General)
     - Add index on Scoring.id_Usuario (foreign key to Usuarios)

  2. **Optimize RLS Policies for Performance**
     - Replace all auth.uid() calls with (select auth.uid()) in all RLS policies
     - This prevents re-evaluation of auth functions for each row, significantly improving query performance at scale
     
  3. **Tables Affected**
     - Usuarios: All RLS policies optimized
     - General: All RLS policies optimized
     - Flota: All RLS policies optimized
     - Scoring: All RLS policies optimized
     - Cotizaciones: All RLS policies optimized
     - Viajes: All RLS policies optimized

  ## Important Notes
  - Indexes improve join performance and foreign key constraint checks
  - RLS optimization reduces function call overhead from O(n) to O(1) per query
  - These changes maintain the same security logic while improving performance
*/

-- ============================================
-- STEP 1: Add indexes for unindexed foreign keys
-- ============================================

-- Index for Flota.id_Usuario foreign key
CREATE INDEX IF NOT EXISTS idx_flota_id_usuario ON public."Flota" ("id_Usuario");

-- Index for General.id_Usuario foreign key
CREATE INDEX IF NOT EXISTS idx_general_id_usuario ON public."General" ("id_Usuario");

-- Index for Scoring.id_Envio foreign key
CREATE INDEX IF NOT EXISTS idx_scoring_id_envio ON public."Scoring" ("id_Envio");

-- Index for Scoring.id_Usuario foreign key
CREATE INDEX IF NOT EXISTS idx_scoring_id_usuario ON public."Scoring" ("id_Usuario");

-- ============================================
-- STEP 2: Drop and recreate RLS policies with optimized auth.uid() calls
-- ============================================

-- ============================================
-- Table: Usuarios
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable delete for users based on auth_user_id" ON public."Usuarios";
DROP POLICY IF EXISTS "Enable select for users based on auth_user_id" ON public."Usuarios";
DROP POLICY IF EXISTS "Enable update for users based on auth_user_id" ON public."Usuarios";
DROP POLICY IF EXISTS "authenticated_users_can_insert_own_profile" ON public."Usuarios";
DROP POLICY IF EXISTS "users_can_read_own_profile" ON public."Usuarios";
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public."Usuarios";

-- Recreate policies with optimized auth.uid()
CREATE POLICY "Enable delete for users based on auth_user_id"
  ON public."Usuarios"
  FOR DELETE
  TO authenticated
  USING (auth_user_id = (select auth.uid()));

CREATE POLICY "Enable select for users based on auth_user_id"
  ON public."Usuarios"
  FOR SELECT
  TO authenticated
  USING (auth_user_id = (select auth.uid()));

CREATE POLICY "Enable update for users based on auth_user_id"
  ON public."Usuarios"
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = (select auth.uid()))
  WITH CHECK (auth_user_id = (select auth.uid()));

CREATE POLICY "authenticated_users_can_insert_own_profile"
  ON public."Usuarios"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = (select auth.uid()));

CREATE POLICY "users_can_read_own_profile"
  ON public."Usuarios"
  FOR SELECT
  TO authenticated
  USING (auth_user_id = (select auth.uid()));

CREATE POLICY "users_can_update_own_profile"
  ON public."Usuarios"
  FOR UPDATE
  TO authenticated
  USING (auth_user_id = (select auth.uid()))
  WITH CHECK (auth_user_id = (select auth.uid()));

-- ============================================
-- Table: General
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Operators can read all shipments" ON public."General";
DROP POLICY IF EXISTS "Users can manage own shipments" ON public."General";

-- Recreate policies with optimized auth.uid()
CREATE POLICY "Operators can read all shipments"
  ON public."General"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Usuarios"
      WHERE "Usuarios".auth_user_id = (select auth.uid())
      AND "Usuarios"."Rol_Operativo" = 'Operador Logistico'
    )
  );

CREATE POLICY "Users can manage own shipments"
  ON public."General"
  FOR SELECT
  TO authenticated
  USING (
    "id_Usuario" IN (
      SELECT "id_Usuario" FROM public."Usuarios"
      WHERE auth_user_id = (select auth.uid())
    )
  );

-- ============================================
-- Table: Flota
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own fleet" ON public."Flota";

-- Recreate policy with optimized auth.uid()
CREATE POLICY "Users can manage own fleet"
  ON public."Flota"
  FOR ALL
  TO authenticated
  USING (
    "id_Usuario" IN (
      SELECT "id_Usuario" FROM public."Usuarios"
      WHERE auth_user_id = (select auth.uid())
    )
  );

-- ============================================
-- Table: Scoring
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own scoring" ON public."Scoring";

-- Recreate policy with optimized auth.uid()
CREATE POLICY "Users can manage own scoring"
  ON public."Scoring"
  FOR ALL
  TO authenticated
  USING (
    "id_Usuario" IN (
      SELECT "id_Usuario" FROM public."Usuarios"
      WHERE auth_user_id = (select auth.uid())
    )
  );

-- ============================================
-- Table: Cotizaciones
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "dadores_can_view_own_quotes" ON public."Cotizaciones";
DROP POLICY IF EXISTS "operadores_can_view_own_quotes" ON public."Cotizaciones";
DROP POLICY IF EXISTS "dadores_can_update_own_quotes" ON public."Cotizaciones";
DROP POLICY IF EXISTS "operadores_can_update_own_quotes" ON public."Cotizaciones";
DROP POLICY IF EXISTS "operators_and_brokers_can_read_all_quotes" ON public."Cotizaciones";

-- Recreate policies with optimized auth.uid()
CREATE POLICY "dadores_can_view_own_quotes"
  ON public."Cotizaciones"
  FOR SELECT
  TO authenticated
  USING (
    "id_Usuario" IN (
      SELECT "id_Usuario" FROM public."Usuarios"
      WHERE auth_user_id = (select auth.uid())
      AND "Rol_Operativo" = 'Dador de Carga'
    )
  );

CREATE POLICY "operadores_can_view_own_quotes"
  ON public."Cotizaciones"
  FOR SELECT
  TO authenticated
  USING (
    "id_Operador" IN (
      SELECT "id_Usuario" FROM public."Usuarios"
      WHERE auth_user_id = (select auth.uid())
      AND "Rol_Operativo" = 'Operador Logistico'
    )
  );

CREATE POLICY "dadores_can_update_own_quotes"
  ON public."Cotizaciones"
  FOR UPDATE
  TO authenticated
  USING (
    "id_Usuario" IN (
      SELECT "id_Usuario" FROM public."Usuarios"
      WHERE auth_user_id = (select auth.uid())
      AND "Rol_Operativo" = 'Dador de Carga'
    )
  )
  WITH CHECK (
    "id_Usuario" IN (
      SELECT "id_Usuario" FROM public."Usuarios"
      WHERE auth_user_id = (select auth.uid())
      AND "Rol_Operativo" = 'Dador de Carga'
    )
  );

CREATE POLICY "operadores_can_update_own_quotes"
  ON public."Cotizaciones"
  FOR UPDATE
  TO authenticated
  USING (
    "id_Operador" IN (
      SELECT "id_Usuario" FROM public."Usuarios"
      WHERE auth_user_id = (select auth.uid())
      AND "Rol_Operativo" = 'Operador Logistico'
    )
  )
  WITH CHECK (
    "id_Operador" IN (
      SELECT "id_Usuario" FROM public."Usuarios"
      WHERE auth_user_id = (select auth.uid())
      AND "Rol_Operativo" = 'Operador Logistico'
    )
  );

CREATE POLICY "operators_and_brokers_can_read_all_quotes"
  ON public."Cotizaciones"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."Usuarios"
      WHERE auth_user_id = (select auth.uid())
      AND "Rol_Operativo" IN ('Operador Logistico', 'Broker Logistico')
    )
  );

-- ============================================
-- Table: Viajes
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own trip counters" ON public."Viajes";
DROP POLICY IF EXISTS "Users can read own trip counters" ON public."Viajes";
DROP POLICY IF EXISTS "Users can update own trip counters" ON public."Viajes";

-- Recreate policies with optimized auth.uid()
CREATE POLICY "Users can insert own trip counters"
  ON public."Viajes"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    "id_Usuario" IN (
      SELECT "id_Usuario" FROM public."Usuarios"
      WHERE auth_user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can read own trip counters"
  ON public."Viajes"
  FOR SELECT
  TO authenticated
  USING (
    "id_Usuario" IN (
      SELECT "id_Usuario" FROM public."Usuarios"
      WHERE auth_user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update own trip counters"
  ON public."Viajes"
  FOR UPDATE
  TO authenticated
  USING (
    "id_Usuario" IN (
      SELECT "id_Usuario" FROM public."Usuarios"
      WHERE auth_user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    "id_Usuario" IN (
      SELECT "id_Usuario" FROM public."Usuarios"
      WHERE auth_user_id = (select auth.uid())
    )
  );