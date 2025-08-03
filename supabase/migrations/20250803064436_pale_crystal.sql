/*
  # Agregar campo Nombre_Operador a tabla Cotizaciones

  1. Modificaciones
    - Agregar columna `Nombre_Operador` a la tabla `Cotizaciones`
    - Permitir valores NULL para compatibilidad con registros existentes
    - Tipo TEXT para almacenar el nombre completo del operador

  2. Notas
    - Este campo almacenará el nombre del operador logístico que envía la cotización
    - Se llenará automáticamente cuando se cree una nueva cotización
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Cotizaciones' AND column_name = 'Nombre_Operador'
  ) THEN
    ALTER TABLE "Cotizaciones" ADD COLUMN "Nombre_Operador" TEXT;
  END IF;
END $$;