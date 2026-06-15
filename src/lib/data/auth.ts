import { supabase } from '../supabase'
import type { Session, User } from '@supabase/supabase-js'

/** Inicia sesión con correo y contraseña. Lanza un error si las credenciales fallan. */
export async function iniciarSesion(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

/** Cambia la contraseña del usuario que tiene la sesión abierta. */
export async function cambiarContrasena(nueva: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: nueva })
  if (error) throw error
}

/** Cierra la sesión del usuario actual. */
export async function cerrarSesion(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/** Devuelve la sesión guardada (o null si no hay sesión). */
export async function sesionActual(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

/**
 * Se suscribe a los cambios de autenticación (login / logout / refresco).
 * Devuelve una función para cancelar la suscripción.
 */
export function onCambioAuth(callback: (session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_evento, session) => callback(session))
  return () => data.subscription.unsubscribe()
}

export type { Session, User }
