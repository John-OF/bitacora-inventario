import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { Cargando } from '../componentes/Cargando'

/** Envuelve páginas privadas: si no hay sesión, redirige a /login. */
export function RutaProtegida({ children }: { children: ReactNode }) {
  const { session, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Cargando texto="Cargando…" />
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return <>{children}</>
}
