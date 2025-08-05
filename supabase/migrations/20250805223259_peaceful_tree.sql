/*
  # Corregir políticas RLS para tabla Cotizaciones

  1. Problemas identificados
    - RLS está deshabilitado en la tabla Cotizaciones
    - Las políticas existentes no permiten acceso correcto a las cotizaciones
    - Los usuarios no pueden ver las cotizaciones que les corresponden

  2. Soluciones implementadas
    - Habilitar RLS en la tabla Cotizaciones
    - Crear políticas que permitan acceso basado en Nombre_Dador y Nombre_Operador
    - Permitir acceso completo al service role
    - Agregar políticas para operadores que puedan ver cotizaciones de sus envíos

  3. Políticas creadas
    - Dadores pueden ver cotizaciones donde aparecen como Nombre_Dador
    - Operadores pueden ver cotizaciones donde aparecen como Nombre_Operador
    - Service role tiene acceso completo
    - Usuarios pueden insertar cotizaciones
*/

-- Primero, eliminar todas las políticas existentes para empezar limpio
DROP POLICY IF EXISTS "Service role full access cotizaciones" ON "Cotizaciones";
DROP POLICY IF EXISTS "Users can manage own quotes" ON "Cotizaciones";
DROP POLICY IF EXISTS "Users can view quotes for their shipments" ON "Cotizaciones";
DROP POLICY IF EXISTS "Operators can read all shipments" ON "Cotizaciones";
DROP POLICY IF EXISTS "Enable read access for all users" ON "Cotizaciones";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "Cotizaciones";

-- Habilitar RLS en la tabla Cotizaciones
ALTER TABLE "Cotizaciones" ENABLE ROW LEVEL SECURITY;

-- Política 1: Service role tiene acceso completo
CREATE POLICY "service_role_full_access_cotizaciones"
ON "Cotizaciones"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Política 2: Los dadores de carga pueden ver cotizaciones donde aparecen como Nombre_Dador
CREATE POLICY "dadores_can_view_own_quotes"
ON "Cotizaciones"
FOR SELECT
TO authenticated
USING (
  "Nombre_Dador" IN (
    SELECT 
      CASE 
        WHEN "Tipo_Persona" = 'Física' THEN "Nombre" || ' ' || COALESCE("Apellido", '')
        ELSE "Nombre"
      END
    FROM "Usuarios"
    WHERE auth_user_id = auth.uid()
  )
);

-- Política 3: Los operadores pueden ver cotizaciones donde aparecen como Nombre_Operador
CREATE POLICY "operadores_can_view_own_quotes"
ON "Cotizaciones"
FOR SELECT
TO authenticated
USING (
  "Nombre_Operador" IN (
    SELECT 
      CASE 
        WHEN "Tipo_Persona" = 'Física' THEN "Nombre" || ' ' || COALESCE("Apellido", '')
        ELSE "Nombre"
      END
    FROM "Usuarios"
    WHERE auth_user_id = auth.uid()
  )
);

-- Política 4: Los usuarios autenticados pueden insertar cotizaciones
CREATE POLICY "authenticated_users_can_insert_quotes"
ON "Cotizaciones"
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política 5: Los dadores pueden actualizar cotizaciones donde aparecen como Nombre_Dador
CREATE POLICY "dadores_can_update_own_quotes"
ON "Cotizaciones"
FOR UPDATE
TO authenticated
USING (
  "Nombre_Dador" IN (
    SELECT 
      CASE 
        WHEN "Tipo_Persona" = 'Física' THEN "Nombre" || ' ' || COALESCE("Apellido", '')
        ELSE "Nombre"
      END
    FROM "Usuarios"
    WHERE auth_user_id = auth.uid()
  )
)
WITH CHECK (
  "Nombre_Dador" IN (
    SELECT 
      CASE 
        WHEN "Tipo_Persona" = 'Física' THEN "Nombre" || ' ' || COALESCE("Apellido", '')
        ELSE "Nombre"
      END
    FROM "Usuarios"
    WHERE auth_user_id = auth.uid()
  )
);

-- Política 6: Los operadores pueden actualizar cotizaciones donde aparecen como Nombre_Operador
CREATE POLICY "operadores_can_update_own_quotes"
ON "Cotizaciones"
FOR UPDATE
TO authenticated
USING (
  "Nombre_Operador" IN (
    SELECT 
      CASE 
        WHEN "Tipo_Persona" = 'Física' THEN "Nombre" || ' ' || COALESCE("Apellido", '')
        ELSE "Nombre"
      END
    FROM "Usuarios"
    WHERE auth_user_id = auth.uid()
  )
)
WITH CHECK (
  "Nombre_Operador" IN (
    SELECT 
      CASE 
        WHEN "Tipo_Persona" = 'Física' THEN "Nombre" || ' ' || COALESCE("Apellido", '')
        ELSE "Nombre"
      END
    FROM "Usuarios"
    WHERE auth_user_id = auth.uid()
  )
);

-- Política 7: Permitir a usuarios con rol de operador o broker leer todas las cotizaciones
CREATE POLICY "operators_and_brokers_can_read_all_quotes"
ON "Cotizaciones"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM "Usuarios" 
    WHERE auth_user_id = auth.uid() 
    AND ("Rol_Operativo" ILIKE '%operador%' OR "Rol_Operativo" ILIKE '%broker%')
  )
);