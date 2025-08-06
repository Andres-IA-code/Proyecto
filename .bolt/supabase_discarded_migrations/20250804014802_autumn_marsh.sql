/*
  # Corregir políticas RLS para cotizaciones

  1. Políticas actualizadas
    - Permite a los usuarios ver cotizaciones donde son el dador (por nombre)
    - Permite a los operadores ver cotizaciones que han enviado
    - Mantiene acceso completo para service role

  2. Cambios realizados
    - Actualiza política existente para incluir búsqueda por nombre
    - Agrega política para operadores
    - Corrige la lógica de comparación de nombres
*/

-- Eliminar políticas existentes que puedan estar causando conflictos
DROP POLICY IF EXISTS "Users can view quotes for their shipments" ON "Cotizaciones";
DROP POLICY IF EXISTS "Users can manage own quotes" ON "Cotizaciones";

-- Crear nueva política para que los dadores puedan ver sus cotizaciones
CREATE POLICY "Dadores pueden ver sus cotizaciones por nombre"
  ON "Cotizaciones"
  FOR SELECT
  TO authenticated
  USING (
    "Nombre_Dador" = (
      SELECT 
        CASE 
          WHEN "Tipo_Persona" = 'Física' THEN 
            TRIM("Nombre" || ' ' || COALESCE("Apellido", ''))
          ELSE 
            "Nombre"
        END
      FROM "Usuarios"
      WHERE auth_user_id = auth.uid()
    )
    OR
    -- También permitir búsqueda insensible a acentos
    unaccent(lower("Nombre_Dador")) = unaccent(lower(
      (SELECT 
        CASE 
          WHEN "Tipo_Persona" = 'Física' THEN 
            TRIM("Nombre" || ' ' || COALESCE("Apellido", ''))
          ELSE 
            "Nombre"
        END
      FROM "Usuarios"
      WHERE auth_user_id = auth.uid())
    ))
  );

-- Crear política para que los operadores puedan ver las cotizaciones que han enviado
CREATE POLICY "Operadores pueden ver sus cotizaciones enviadas"
  ON "Cotizaciones"
  FOR SELECT
  TO authenticated
  USING (
    "id_Operador" IN (
      SELECT "id_Usuario"
      FROM "Usuarios"
      WHERE auth_user_id = auth.uid()
    )
    OR
    "Nombre_Operador" = (
      SELECT 
        CASE 
          WHEN "Tipo_Persona" = 'Física' THEN 
            TRIM("Nombre" || ' ' || COALESCE("Apellido", ''))
          ELSE 
            "Nombre"
        END
      FROM "Usuarios"
      WHERE auth_user_id = auth.uid()
    )
  );

-- Crear política para insertar cotizaciones (para operadores)
CREATE POLICY "Operadores pueden crear cotizaciones"
  ON "Cotizaciones"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    "id_Operador" IN (
      SELECT "id_Usuario"
      FROM "Usuarios"
      WHERE auth_user_id = auth.uid()
    )
  );

-- Crear política para actualizar cotizaciones (para dadores y operadores)
CREATE POLICY "Usuarios pueden actualizar sus cotizaciones"
  ON "Cotizaciones"
  FOR UPDATE
  TO authenticated
  USING (
    -- Dadores pueden actualizar cotizaciones de sus envíos
    "Nombre_Dador" = (
      SELECT 
        CASE 
          WHEN "Tipo_Persona" = 'Física' THEN 
            TRIM("Nombre" || ' ' || COALESCE("Apellido", ''))
          ELSE 
            "Nombre"
        END
      FROM "Usuarios"
      WHERE auth_user_id = auth.uid()
    )
    OR
    -- Operadores pueden actualizar sus cotizaciones
    "id_Operador" IN (
      SELECT "id_Usuario"
      FROM "Usuarios"
      WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Mismas condiciones para el check
    "Nombre_Dador" = (
      SELECT 
        CASE 
          WHEN "Tipo_Persona" = 'Física' THEN 
            TRIM("Nombre" || ' ' || COALESCE("Apellido", ''))
          ELSE 
            "Nombre"
        END
      FROM "Usuarios"
      WHERE auth_user_id = auth.uid()
    )
    OR
    "id_Operador" IN (
      SELECT "id_Usuario"
      FROM "Usuarios"
      WHERE auth_user_id = auth.uid()
    )
  );

-- Mantener acceso completo para service role
-- (Esta política ya existe, pero la recreamos para asegurar consistencia)
DROP POLICY IF EXISTS "Service role full access cotizaciones" ON "Cotizaciones";
CREATE POLICY "Service role full access cotizaciones"
  ON "Cotizaciones"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Habilitar la extensión unaccent si no está habilitada
CREATE EXTENSION IF NOT EXISTS unaccent;