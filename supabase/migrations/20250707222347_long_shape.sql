/*
  # Add foreign key constraint for Cotizaciones.id_Operador

  1. Changes
    - Add foreign key constraint linking `Cotizaciones.id_Operador` to `Usuarios.id_Usuario`
    - This enables proper joins between quotes and operator information

  2. Security
    - No changes to existing RLS policies
    - Maintains data integrity with cascade operations
*/

-- Add foreign key constraint for id_Operador referencing Usuarios table
ALTER TABLE "Cotizaciones" 
ADD CONSTRAINT "Cotizaciones_id_Operador_fkey" 
FOREIGN KEY ("id_Operador") 
REFERENCES "Usuarios"("id_Usuario") 
ON UPDATE CASCADE 
ON DELETE SET NULL;