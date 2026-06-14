import { useState } from 'react'
import { IconoLuna, IconoSol } from './iconos'

function esOscuroActual(): boolean {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
}

/**
 * Botón para alternar entre modo claro y oscuro.
 * Guarda la preferencia en el navegador y aplica/quita la clase "dark" en <html>.
 * El tema inicial lo fija un script en index.html (para evitar parpadeo).
 */
export function BotonTema({ className = '' }: { className?: string }) {
  const [oscuro, setOscuro] = useState(esOscuroActual)

  function alternar() {
    const nuevo = !oscuro
    setOscuro(nuevo)
    document.documentElement.classList.toggle('dark', nuevo)
    try {
      localStorage.setItem('tema', nuevo ? 'oscuro' : 'claro')
    } catch {
      /* almacenamiento no disponible */
    }
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={oscuro ? 'Modo claro' : 'Modo oscuro'}
      className={className}
    >
      {oscuro ? <IconoSol className="h-5 w-5" aria-hidden /> : <IconoLuna className="h-5 w-5" aria-hidden />}
    </button>
  )
}
