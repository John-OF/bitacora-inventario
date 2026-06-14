import { supabase } from '../supabase'
import type { ExistenciaActual, MovimientoConProducto, NuevoMovimiento } from './types'

const TABLA = 'movimientos'

export interface FiltrosMovimientos {
  productoId?: string
  lote?: string
  fecha?: string // formato YYYY-MM-DD
}

/**
 * Lista movimientos (más recientes primero) aplicando filtros opcionales
 * (producto, lote y/o fecha). Incluye el nombre del producto asociado.
 */
export async function listarMovimientos(filtros: FiltrosMovimientos = {}): Promise<MovimientoConProducto[]> {
  let consulta = supabase
    .from(TABLA)
    .select('*, producto:productos(nombre)')
    .order('fecha', { ascending: false })
    .order('creado_en', { ascending: false })

  if (filtros.productoId) consulta = consulta.eq('producto_id', filtros.productoId)
  if (filtros.lote) consulta = consulta.eq('lote', filtros.lote)
  if (filtros.fecha) consulta = consulta.eq('fecha', filtros.fecha)

  const { data, error } = await consulta
  if (error) throw error
  return (data ?? []) as unknown as MovimientoConProducto[]
}

/**
 * Lista de lotes distintos ya registrados (para llenar el filtro del historial),
 * opcionalmente acotada a un producto. Ordenados alfabéticamente.
 */
export async function listarLotes(productoId?: string): Promise<string[]> {
  let consulta = supabase.from(TABLA).select('lote')
  if (productoId) consulta = consulta.eq('producto_id', productoId)

  const { data, error } = await consulta
  if (error) throw error

  const unicos = Array.from(new Set((data ?? []).map((fila) => fila.lote as string)))
  return unicos.sort((a, b) => a.localeCompare(b, 'es'))
}

/**
 * Crea un movimiento. No se envía "quedan" (lo calcula la base de datos)
 * ni "user_id" (lo asigna la base con auth.uid()).
 */
export async function crearMovimiento(nuevo: NuevoMovimiento): Promise<void> {
  const { error } = await supabase.from(TABLA).insert({
    producto_id: nuevo.producto_id,
    fecha: nuevo.fecha,
    lote: nuevo.lote.trim(),
    inicio: nuevo.inicio,
    llegan: nuevo.llegan,
    salen: nuevo.salen,
  })
  if (error) throw error
}

/**
 * Devuelve el "quedan" del último movimiento de un producto (o null si todavía
 * no tiene movimientos). Sirve como punto de partida SUGERIDO para "inicio".
 */
export async function ultimoQuedan(productoId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from(TABLA)
    .select('quedan')
    .eq('producto_id', productoId)
    .order('fecha', { ascending: false })
    .order('creado_en', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data?.quedan ?? null
}

/** Existencia actual por producto (último "quedan" de cada producto activo). */
export async function existenciaActual(): Promise<ExistenciaActual[]> {
  const { data, error } = await supabase
    .from('existencia_actual')
    .select('*')
    .order('producto_nombre', { ascending: true })
  if (error) throw error
  return data ?? []
}

/**
 * Conjunto de ids de movimientos que son el ÚLTIMO de su producto.
 * Solo esos se pueden borrar (deshacer), para no romper la continuidad del saldo.
 */
export async function idsUltimoPorProducto(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from(TABLA)
    .select('id, producto_id, fecha, creado_en')
    .order('fecha', { ascending: false })
    .order('creado_en', { ascending: false })
  if (error) throw error

  const vistos = new Set<string>()
  const ultimos = new Set<string>()
  for (const fila of data ?? []) {
    if (!vistos.has(fila.producto_id)) {
      vistos.add(fila.producto_id)
      ultimos.add(fila.id)
    }
  }
  return ultimos
}

/**
 * Borra un movimiento, pero SOLO si es el último de su producto (deshacer seguro).
 * Si no lo es, lanza un error y no borra nada. Para errores antiguos se debe
 * registrar un movimiento de corrección en su lugar.
 */
export async function eliminarMovimiento(id: string, productoId: string): Promise<void> {
  const { data, error } = await supabase
    .from(TABLA)
    .select('id')
    .eq('producto_id', productoId)
    .order('fecha', { ascending: false })
    .order('creado_en', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  if (!data || data.id !== id) {
    throw new Error('Solo se puede borrar el último movimiento de cada producto.')
  }

  const { error: errorBorrado } = await supabase.from(TABLA).delete().eq('id', id)
  if (errorBorrado) throw errorBorrado
}
