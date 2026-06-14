// Tipos que reflejan el esquema de la base de datos (ver supabase/schema.sql).

export interface Producto {
  id: string
  user_id: string
  nombre: string
  descripcion: string | null
  archivado_en: string | null
  creado_en: string
}

export interface NuevoProducto {
  nombre: string
  descripcion?: string | null
}

export interface Movimiento {
  id: string
  user_id: string
  producto_id: string
  fecha: string // formato YYYY-MM-DD
  lote: string
  inicio: number
  llegan: number
  salen: number
  quedan: number // columna generada en la base de datos
  creado_en: string
}

// Movimiento con el nombre del producto ya resuelto (para el historial).
export interface MovimientoConProducto extends Movimiento {
  producto: { nombre: string } | null
}

// Lo que la app envía al crear un movimiento.
// No incluye user_id (lo pone la base) ni quedan (es columna generada).
export interface NuevoMovimiento {
  producto_id: string
  fecha: string
  lote: string
  inicio: number
  llegan: number
  salen: number
}

export interface ExistenciaActual {
  producto_id: string
  producto_nombre: string
  fecha: string
  lote: string
  quedan: number
}
