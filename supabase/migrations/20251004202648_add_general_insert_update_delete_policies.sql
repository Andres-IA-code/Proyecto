/*
  # Add INSERT, UPDATE, DELETE policies to General table

  1. Security Changes
    - Add policy for users to insert their own shipments
    - Add policy for users to update their own shipments
    - Add policy for users to delete their own shipments

  2. Notes
    - Policies check that id_Usuario matches the user's id_Usuario from Usuarios table
    - Uses auth.uid() to verify user identity
*/

-- Policy: Users can insert their own shipments
CREATE POLICY "Users can insert own shipments"
  ON "General"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    "id_Usuario" IN (
      SELECT "id_Usuario"
      FROM "Usuarios"
      WHERE "Usuarios"."auth_user_id" = auth.uid()
    )
  );

-- Policy: Users can update their own shipments
CREATE POLICY "Users can update own shipments"
  ON "General"
  FOR UPDATE
  TO authenticated
  USING (
    "id_Usuario" IN (
      SELECT "id_Usuario"
      FROM "Usuarios"
      WHERE "Usuarios"."auth_user_id" = auth.uid()
    )
  )
  WITH CHECK (
    "id_Usuario" IN (
      SELECT "id_Usuario"
      FROM "Usuarios"
      WHERE "Usuarios"."auth_user_id" = auth.uid()
    )
  );

-- Policy: Users can delete their own shipments
CREATE POLICY "Users can delete own shipments"
  ON "General"
  FOR DELETE
  TO authenticated
  USING (
    "id_Usuario" IN (
      SELECT "id_Usuario"
      FROM "Usuarios"
      WHERE "Usuarios"."auth_user_id" = auth.uid()
    )
  );
