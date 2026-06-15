import { useState, type FormEvent } from 'react'
import { Layout } from '../componentes/Layout'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { Aviso } from '../componentes/Aviso'
import { BotonSalir } from '../componentes/BotonSalir'
import { useAuth } from '../auth/AuthContext'
import { cambiarContrasena } from '../lib/data/auth'

const MIN_CARACTERES = 6

export function Cuenta() {
  const { session } = useAuth()
  const correo = session?.user.email ?? ''

  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setExito(false)

    if (nueva.length < MIN_CARACTERES) {
      setError(`La contraseña debe tener al menos ${MIN_CARACTERES} caracteres.`)
      return
    }
    if (nueva !== confirmar) {
      setError('Las dos contraseñas no son iguales. Vuelve a escribirlas.')
      return
    }

    setGuardando(true)
    try {
      await cambiarContrasena(nueva)
      setNueva('')
      setConfirmar('')
      setExito(true)
    } catch (e) {
      console.error('Error al cambiar la contraseña:', e)
      setError('No pudimos cambiar la contraseña. Inténtalo de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Layout titulo="Mi cuenta" accion={<BotonSalir />}>
      <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Tu correo</p>
        <p className="truncate text-lg text-slate-900 dark:text-slate-100">{correo}</p>
      </div>

      <form
        onSubmit={enviar}
        className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Cambiar contraseña</h2>
        <Campo
          etiqueta="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          ayuda={`Mínimo ${MIN_CARACTERES} caracteres.`}
          required
        />
        <Campo
          etiqueta="Repite la nueva contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          required
        />
        {error && <Aviso tipo="error">{error}</Aviso>}
        {exito && (
          <Aviso tipo="exito">
            ✅ Tu contraseña fue cambiada. Úsala la próxima vez que entres.
          </Aviso>
        )}
        <Boton type="submit" cargando={guardando} ancho>
          Guardar contraseña
        </Boton>
      </form>
    </Layout>
  )
}
