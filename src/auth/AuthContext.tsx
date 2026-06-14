import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { onCambioAuth, sesionActual } from '../lib/data/auth'

interface AuthContextValue {
  session: Session | null
  cargando: boolean
}

const AuthContext = createContext<AuthContextValue>({ session: null, cargando: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let activo = true

    // Sesión inicial (guardada en el navegador).
    sesionActual()
      .then((s) => {
        if (activo) setSession(s)
      })
      .catch(() => {
        /* sin sesión */
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    // Suscripción a cambios (login / logout / refresco de token).
    const desuscribir = onCambioAuth((s) => {
      setSession(s)
      setCargando(false)
    })

    return () => {
      activo = false
      desuscribir()
    }
  }, [])

  return <AuthContext.Provider value={{ session, cargando }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
