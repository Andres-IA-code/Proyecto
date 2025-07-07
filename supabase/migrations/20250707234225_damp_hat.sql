/*
  # Agregar campos faltantes a la tabla Cotizaciones

  1. New Columns
    - `Valor_Cotizacion` (integer) - Valor de la cotización
    - `Fecha` (timestamp with time zone) - Fecha de creación de la cotización
    - `Vigencia` (timestamp with time zone) - Fecha de vencimiento de la cotización
    - `Estado` (text) - Estado de la cotización (Pendiente, Aceptada, Rechazada)
    - `Scoring` (integer) - Puntuación del operador
    - `Oferta` (numeric) - Monto de la oferta

  2. Changes
    - Agregar todas las columnas necesarias para el funcionamiento de las cotizaciones
    - Establecer valores por defecto apropiados
*/

-- Agregar columna Valor_Cotizacion si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Cotizaciones' AND column_name = 'Valor_Cotizacion'
  ) THEN
    ALTER TABLE "Cotizaciones" ADD COLUMN "Valor_Cotizacion" integer;
  END IF;
END $$;

-- Agregar columna Fecha si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Cotizaciones' AND column_name = 'Fecha'
  ) THEN
    ALTER TABLE "Cotizaciones" ADD COLUMN "Fecha" timestamp with time zone DEFAULT now();
  END IF;
END $$;

-- Agregar columna Vigencia si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Cotizaciones' AND column_name = 'Vigencia'
  ) THEN
    ALTER TABLE "Cotizaciones" ADD COLUMN "Vigencia" timestamp with time zone;
  END IF;
END $$;

-- Agregar columna Estado si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Cotizaciones' AND column_name = 'Estado'
  ) THEN
    ALTER TABLE "Cotizaciones" ADD COLUMN "Estado" text DEFAULT 'Pendiente';
  END IF;
END $$;

-- Agregar columna Scoring si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Cotizaciones' AND column_name = 'Scoring'
  ) THEN
    ALTER TABLE "Cotizaciones" ADD COLUMN "Scoring" integer;
  END IF;
END $$;

-- Asegurar que la columna Oferta existe (ya debería existir según el esquema)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Cotizaciones' AND column_name = 'Oferta'
  ) THEN
    ALTER TABLE "Cotizaciones" ADD COLUMN "Oferta" numeric DEFAULT 0;
  END IF;
END $$;

-- Agregar columna id_Operador si no existe (para identificar quién hizo la cotización)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Cotizaciones' AND column_name = 'id_Operador'
  ) THEN
    ALTER TABLE "Cotizaciones" ADD COLUMN "id_Operador" integer;
  END IF;
END $$;

-- Agregar foreign key constraint para id_Operador si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'Cotizaciones_id_Operador_fkey' 
    AND table_name = 'Cotizaciones'
  ) THEN
    ALTER TABLE "Cotizaciones" 
    ADD CONSTRAINT "Cotizaciones_id_Operador_fkey" 
    FOREIGN KEY ("id_Operador") 
    REFERENCES "Usuarios"("id_Usuario") 
    ON UPDATE CASCADE 
    ON DELETE SET NULL;
  END IF;
END $$;

-- Agregar foreign key constraint para id_Envio si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'Cotizaciones_id_Envio_fkey' 
    AND table_name = 'Cotizaciones'
  ) THEN
    ALTER TABLE "Cotizaciones" 
    ADD CONSTRAINT "Cotizaciones_id_Envio_fkey" 
    FOREIGN KEY ("id_Envio") 
    REFERENCES "General"("id_Envio") 
    ON UPDATE CASCADE 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Agregar índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS "idx_cotizaciones_fecha" ON "Cotizaciones"("Fecha");
CREATE INDEX IF NOT EXISTS "idx_cotizaciones_id_envio" ON "Cotizaciones"("id_Envio");
CREATE INDEX IF NOT EXISTS "idx_cotizaciones_id_operador" ON "Cotizaciones"("id_Operador");
CREATE INDEX IF NOT EXISTS "idx_cotizaciones_id_usuario" ON "Cotizaciones"("id_Usuario");