import { supabase } from '../supabase'
import type { NuevoProducto, Producto } from './types'

const TABLA = 'productos'

/** Lista los productos activos (no archivados) del usuario, ordenados por nombre. */
export async function listarProductos(): Promise<Producto[]> {
  const { data, error } = await supabase
    .from(TABLA)
    .select('*')
    .is('archivado_en', null)
    .order('nombre', { ascending: true })
  if (error) throw error
  return data ?? []
}

/** Crea un producto nuevo. user_id lo asigna la base de datos (auth.uid()). */
export async function crearProducto(nuevo: NuevoProducto): Promise<Producto> {
  const { data, error } = await supabase
    .from(TABLA)
    .insert({
      nombre: nuevo.nombre.trim(),
      descripcion: nuevo.descripcion?.trim() || null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * "Borra" un producto archivándolo (soft delete): deja de aparecer en las listas,
 * pero su fila y sus movimientos históricos se conservan.
 */
export async function archivarProducto(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABLA)
    .update({ archivado_en: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
