import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Faltan las variables de entorno VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. ' +
      'Copia el archivo .env.example como .env y rellena los valores de tu proyecto Supabase.',
  )
}

/**
 * Cliente único de Supabase para toda la app.
 * La sesión se guarda en el navegador (persistSession) para que el usuario
 * no tenga que volver a iniciar sesión cada vez que abre la app.
 */
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
