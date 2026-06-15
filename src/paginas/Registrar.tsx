import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Layout } from '../componentes/Layout'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { Select } from '../componentes/Select'
import { Aviso } from '../componentes/Aviso'
import { Cargando } from '../componentes/Cargando'
import { BotonSalir } from '../componentes/BotonSalir'
import { IconoAlerta, IconoCheck } from '../componentes/iconos'
import { listarProductos } from '../lib/data/productos'
import { crearMovimiento, ultimoQuedan } from '../lib/data/movimientos'
import type { Producto } from '../lib/data/types'
import { hoyISO } from '../utils/formato'

// Convierte el texto de un campo numérico en un entero (vacío = 0).
function aEntero(valor: string): number {
  return valor === '' ? 0 : Math.trunc(Number(valor))
}

export function Registrar() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)

  const [productoId, setProductoId] = useState('')
  const [fecha, setFecha] = useState(hoyISO())
  const [lote, setLote] = useState('')
  const [inicio, setInicio] = useState('')
  const [llegan, setLlegan] = useState('')
  const [salen, setSalen] = useState('')

  // Saldo sugerido para "inicio": el "quedan" del último movimiento del producto.
  // null = el producto aún no tiene movimientos (es su primer registro).
  const [sugerencia, setSugerencia] = useState<number | null>(null)

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  useEffect(() => {
    listarProductos()
      .then(setProductos)
      .catch(() => setError('No pudimos cargar los productos.'))
      .finally(() => setCargando(false))
  }, [])

  // Sugiere el "inicio" con el último saldo del producto (editable por el usuario).
  async function cargarSugerencia(pid: string) {
    if (!pid) {
      setSugerencia(null)
      setInicio('')
      return
    }
    try {
      const q = await ultimoQuedan(pid)
      setSugerencia(q)
      setInicio(q === null ? '' : String(q))
    } catch {
      setSugerencia(null)
    }
  }

  // Al cambiar de producto: limpia mensajes y recalcula la sugerencia.
  useEffect(() => {
    setError(null)
    setExito(false)
    cargarSugerencia(productoId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productoId])

  const quedan = useMemo(
    () => aEntero(inicio) + aEntero(llegan) - aEntero(salen),
    [inicio, llegan, salen],
  )
  const negativo = quedan < 0

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setExito(false)
    if (!productoId) {
      setError('Elige un producto.')
      return
    }
    if (!lote.trim()) {
      setError('Escribe el lote.')
      return
    }
    if (negativo) {
      setError('No se puede guardar: el resultado no puede ser negativo.')
      return
    }
    setGuardando(true)
    try {
      await crearMovimiento({
        producto_id: productoId,
        fecha,
        lote,
        inicio: aEntero(inicio),
        llegan: aEntero(llegan),
        salen: aEntero(salen),
      })
      setExito(true)
      setLote('')
      setLlegan('')
      setSalen('')
      // El nuevo saldo pasa a ser el "inicio" sugerido para el siguiente registro.
      await cargarSugerencia(productoId)
    } catch {
      setError('No pudimos guardar el movimiento.')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <Layout titulo="Registrar" accion={<BotonSalir />}>
        <Cargando texto="Cargando…" />
      </Layout>
    )
  }

  return (
    <Layout titulo="Registrar movimiento" accion={<BotonSalir />}>
      {productos.length === 0 ? (
        <Aviso tipo="info">Primero crea un producto en la pestaña «Productos».</Aviso>
      ) : (
        <form onSubmit={enviar} className="flex flex-col gap-4">
          <Select
            etiqueta="Producto"
            value={productoId}
            onChange={(e) => setProductoId(e.target.value)}
            required
          >
            <option value="" disabled>
              Elige un producto…
            </option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </Select>

          <Campo etiqueta="Fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          <Campo
            etiqueta="Lote"
            placeholder="Ej: L-2026-06"
            value={lote}
            onChange={(e) => setLote(e.target.value)}
            required
          />

          <Campo
            etiqueta="Cantidad al inicio"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="0"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            ayuda={
              !productoId
                ? undefined
                : sugerencia === null
                  ? 'Primer registro de este producto: escribe la cantidad inicial real.'
                  : `Sugerido: el último registro de este producto terminó en ${sugerencia}. Lo pusimos como punto de partida. Si después se hizo o se despachó producto, corrige esta cantidad para que refleje lo que realmente hay.`
            }
          />
          <Campo
            etiqueta="Cuántos se hacen"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="0"
            value={llegan}
            onChange={(e) => setLlegan(e.target.value)}
            ayuda="Lo que se produjo hoy."
          />
          <Campo
            etiqueta="Cuántos se despachan"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="0"
            value={salen}
            onChange={(e) => setSalen(e.target.value)}
            ayuda="Lo que salió hoy."
          />

          <div
            className={`rounded-2xl p-4 text-center ${
              negativo ? 'bg-red-50 dark:bg-red-950/40' : 'bg-marca-claro dark:bg-teal-900/40'
            }`}
          >
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Quedan</p>
            <p
              className={`text-4xl font-extrabold ${
                negativo ? 'text-red-600 dark:text-red-400' : 'text-marca-oscuro dark:text-teal-300'
              }`}
            >
              {quedan}
            </p>
            {negativo && (
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-red-600 dark:text-red-400">
                <IconoAlerta className="h-4 w-4 shrink-0" aria-hidden />
                No se puede guardar con un resultado negativo. Revisa la cantidad al inicio o si falta
                registrar lo que se hizo.
              </p>
            )}
          </div>

          {error && <Aviso tipo="error">{error}</Aviso>}
          {exito && (
            <Aviso tipo="exito">
              <span className="flex items-center gap-2">
                <IconoCheck className="h-5 w-5 shrink-0" aria-hidden />
                Movimiento guardado.
              </span>
            </Aviso>
          )}

          <Boton type="submit" cargando={guardando} disabled={negativo} ancho>
            Guardar movimiento
          </Boton>
        </form>
      )}
    </Layout>
  )
}
