import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { iniciarSesion } from '../lib/data/auth'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { Aviso } from '../componentes/Aviso'
import { IconoCaja } from '../componentes/iconos'
import { BotonTema } from '../componentes/BotonTema'

export function Login() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (session) return <Navigate to="/productos" replace />

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await iniciarSesion(email.trim(), password)
      navigate('/productos', { replace: true })
    } catch (e) {
      console.error('Error al iniciar sesión:', e)
      setError('No pudimos iniciar sesión. Revisa tu correo y tu contraseña.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-marca px-5 py-10">
      <BotonTema className="absolute right-4 top-4 rounded-lg bg-white/15 p-2 text-white active:bg-white/25" />

      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-marca-claro dark:bg-teal-900/40">
            <IconoCaja className="h-8 w-8 text-marca dark:text-teal-300" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Bitácora de Inventario</h1>
          <p className="mt-1 text-base text-slate-500 dark:text-slate-400">Ingresa para continuar</p>
        </div>

        <form onSubmit={enviar} className="flex flex-col gap-4">
          <Campo
            etiqueta="Correo"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="tucorreo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Campo
            etiqueta="Contraseña"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <Aviso tipo="error">{error}</Aviso>}
          <Boton type="submit" cargando={enviando} ancho>
            Entrar
          </Boton>
        </form>
      </div>

      <p className="mt-6 max-w-sm text-center text-sm text-white/80">
        ¿Problemas para entrar? Pide ayuda a quien te creó la cuenta.
      </p>
    </div>
  )
}
