import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cerrarSesion } from '../lib/data/auth'

/** Botón "Salir" para la cabecera. Cierra la sesión y vuelve al login. */
export function BotonSalir() {
  const navigate = useNavigate()
  const [saliendo, setSaliendo] = useState(false)

  async function salir() {
    setSaliendo(true)
    try {
      await cerrarSesion()
      navigate('/login', { replace: true })
    } finally {
      setSaliendo(false)
    }
  }

  return (
    <button
      onClick={salir}
      disabled={saliendo}
      className="shrink-0 rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white active:bg-white/25 disabled:opacity-60"
    >
      Salir
    </button>
  )
}
