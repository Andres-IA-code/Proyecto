export interface Usuario {
  id_Usuario: number;
  Nombre: string;
  Apellido: string | null;
  DNI: number | null;
  Domicilio: string | null;
  Numero: number | null;
  Piso: number | null;
  Departamento: string | null;
  Localidad: string | null;
  Tipo_Persona: string | null;
  Rol_Operativo: 'dador' | 'operador' | 'broker' | null;
  Correo: string | null;
  Telefono: string | null;
  auth_user_id: string | null;
}

export interface Envio {
  id_Envio: number;
  id_Usuario: number;
  Estado: string | null;
  Origen: string | null;
  Destino: string | null;
  Distancia: number | null;
  Tipo_Carga: string | null;
  Tipo_Vehiculo: string | null;
  Peso: string | null;
  Dimension_Largo: number | null;
  Dimension_Ancho: number | null;
  Dimension_Alto: number | null;
  Horario_Retiro: string | null;
  Observaciones: string | null;
  Tipo_Carroceria: string | null;
  Tiempo_Estimado_Operacion: string | null;
  Parada_Programada: string | null;
  Nombre_Dador: string | null;
  Fecha_Retiro: string | null;
  Email: string | null;
}

export interface Cotizacion {
  id_Cotizaciones: number;
  id_Usuario: number;
  id_Envio: number | null;
  id_Operador: number | null;
  Fecha: string | null;
  Vigencia: string | null;
  Estado: string | null;
  Scoring: number | null;
  Oferta: number | null;
  Nombre_Operador: string | null;
  Nombre_Dador: string | null;
  Email: string | null;
}

export interface Flota {
  id_Flota: number;
  id_Usuario: number;
  Dominio: string | null;
  Marca: string | null;
  Categoria: string | null;
  Cantidad_ejes: number | null;
}
