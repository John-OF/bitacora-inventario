import { useEffect, useMemo, useState } from 'react'
import { Layout } from '../componentes/Layout'
import { Select } from '../componentes/Select'
import { Campo } from '../componentes/Campo'
import { Boton } from '../componentes/Boton'
import { Aviso } from '../componentes/Aviso'
import { Cargando } from '../componentes/Cargando'
import { Dialogo } from '../componentes/Dialogo'
import { BotonSalir } from '../componentes/BotonSalir'
import { IconoBasura, IconoDescargar } from '../componentes/iconos'
import { listarProductos } from '../lib/data/productos'
import {
  eliminarMovimiento,
  existenciaActual,
  idsUltimoPorProducto,
  listarLotes,
  listarMovimientos,
} from '../lib/data/movimientos'
import type { ExistenciaActual, MovimientoConProducto, Producto } from '../lib/data/types'
import { descargarCSV } from '../utils/csv'
import { fechaLegible } from '../utils/formato'

export function Historial() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [lotes, setLotes] = useState<string[]>([])
  const [movimientos, setMovimientos] = useState<MovimientoConProducto[]>([])
  const [existencias, setExistencias] = useState<ExistenciaActual[]>([])
  const [idsUltimos, setIdsUltimos] = useState<Set<string>>(new Set())

  // Filtros
  const [productoId, setProductoId] = useState('')
  const [lote, setLote] = useState('')
  const [fecha, setFecha] = useState('')

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Borrado
  const [aBorrar, setABorrar] = useState<MovimientoConProducto | null>(null)
  const [borrando, setBorrando] = useState(false)

  // Resumen que NO depende de los filtros: existencias y cuáles son borrables.
  function recargarResumen() {
    existenciaActual()
      .then(setExistencias)
      .catch(() => setError('No pudimos cargar la información.'))
    idsUltimoPorProducto()
      .then(setIdsUltimos)
      .catch(() => setIdsUltimos(new Set()))
  }

  // Historial según los filtros actuales.
  function cargarMovimientos() {
    setCargando(true)
    listarMovimientos({
      productoId: productoId || undefined,
      lote: lote || undefined,
      fecha: fecha || undefined,
    })
      .then(setMovimientos)
      .catch(() => setError('No pudimos cargar el historial.'))
      .finally(() => setCargando(false))
  }

  // Carga inicial.
  useEffect(() => {
    listarProductos()
      .then(setProductos)
      .catch(() => setError('No pudimos cargar la información.'))
    recargarResumen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Lista de lotes para el filtro; se acota al producto elegido.
  useEffect(() => {
    listarLotes(productoId || undefined)
      .then(setLotes)
      .catch(() => setLotes([]))
  }, [productoId])

  // Recarga el historial cada vez que cambia cualquier filtro.
  useEffect(() => {
    cargarMovimientos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productoId, lote, fecha])

  const existenciasFiltradas = useMemo(
    () => (productoId ? existencias.filter((e) => e.producto_id === productoId) : existencias),
    [existencias, productoId],
  )

  const hayFiltros = Boolean(productoId || lote || fecha)

  // Al cambiar de producto se reinicia el lote (sus opciones dependen del producto).
  function cambiarProducto(nuevo: string) {
    setProductoId(nuevo)
    setLote('')
  }

  function limpiarFiltros() {
    setProductoId('')
    setLote('')
    setFecha('')
  }

  async function confirmarBorrar() {
    if (!aBorrar) return
    setBorrando(true)
    setError(null)
    try {
      await eliminarMovimiento(aBorrar.id, aBorrar.producto_id)
      setABorrar(null)
      cargarMovimientos()
      recargarResumen()
    } catch {
      setError('No pudimos borrar el movimiento. Solo se puede borrar el último de cada producto.')
    } finally {
      setBorrando(false)
    }
  }

  function exportar() {
    const filas = movimientos.map((m) => ({
      Fecha: m.fecha,
      Producto: m.producto?.nombre ?? '',
      Lote: m.lote,
      Inicio: m.inicio,
      Llegan: m.llegan,
      Salen: m.salen,
      Quedan: m.quedan,
    }))
    descargarCSV('historial-inventario.csv', filas)
  }

  return (
    <Layout titulo="Historial" accion={<BotonSalir />}>
      {/* Existencia actual por producto */}
      <section className="mb-5">
        <h2 className="mb-2 text-base font-bold text-slate-700 dark:text-slate-200">Existencia actual</h2>
        {existenciasFiltradas.length === 0 ? (
          <p className="rounded-xl bg-white p-3 text-sm text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-400">
            Todavía no hay existencias registradas.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {existenciasFiltradas.map((e) => (
              <li
                key={e.producto_id}
                className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800"
              >
                <span className="font-medium text-slate-700 dark:text-slate-200">{e.producto_nombre}</span>
                <span className="text-xl font-bold text-marca-oscuro dark:text-teal-300">{e.quedan}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Filtros */}
      <div className="mb-4 flex flex-col gap-3">
        <Select etiqueta="Producto" value={productoId} onChange={(e) => cambiarProducto(e.target.value)}>
          <option value="">Todos los productos</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </Select>

        <Select etiqueta="Lote" value={lote} onChange={(e) => setLote(e.target.value)}>
          <option value="">Todos los lotes</option>
          {lotes.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </Select>

        <Campo etiqueta="Fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />

        {hayFiltros && (
          <button
            type="button"
            onClick={limpiarFiltros}
            className="self-start text-sm font-semibold text-marca underline dark:text-teal-300"
          >
            Limpiar filtros
          </button>
        )}

        <Boton variante="secundario" onClick={exportar} disabled={movimientos.length === 0} ancho>
          <span className="inline-flex items-center gap-2">
            <IconoDescargar className="h-5 w-5" aria-hidden />
            Exportar a CSV (Excel)
          </span>
        </Boton>
      </div>

      {error && (
        <div className="mb-4">
          <Aviso tipo="error">{error}</Aviso>
        </div>
      )}

      {cargando ? (
        <Cargando texto="Cargando historial…" />
      ) : movimientos.length === 0 ? (
        <p className="py-10 text-center text-slate-500 dark:text-slate-400">
          {hayFiltros ? 'No hay movimientos con esos filtros.' : 'No hay movimientos registrados.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {movimientos.map((m) => (
            <li key={m.id} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                  {m.producto?.nombre ?? 'Producto'}
                </p>
                <p className="shrink-0 text-sm text-slate-500 dark:text-slate-400">{fechaLegible(m.fecha)}</p>
              </div>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Lote: <span className="font-medium text-slate-700 dark:text-slate-200">{m.lote}</span>
              </p>
              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                <Dato etiqueta="Inicio" valor={m.inicio} />
                <Dato etiqueta="Llegan" valor={m.llegan} />
                <Dato etiqueta="Salen" valor={m.salen} />
                <Dato etiqueta="Quedan" valor={m.quedan} resaltado />
              </div>
              {idsUltimos.has(m.id) && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setABorrar(m)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 active:bg-red-50 dark:text-red-400 dark:active:bg-red-950/50"
                  >
                    <IconoBasura className="h-4 w-4" aria-hidden />
                    Borrar
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {aBorrar && (
        <Dialogo
          titulo="¿Borrar este movimiento?"
          textoConfirmar="Sí, borrar"
          varianteConfirmar="peligro"
          onConfirmar={confirmarBorrar}
          onCancelar={() => setABorrar(null)}
          cargando={borrando}
        >
          Se eliminará el último registro de{' '}
          <strong>{aBorrar.producto?.nombre ?? 'este producto'}</strong> del {fechaLegible(aBorrar.fecha)}{' '}
          (lote {aBorrar.lote}). Esta acción no se puede deshacer.
        </Dialogo>
      )}
    </Layout>
  )
}

function Dato({ etiqueta, valor, resaltado = false }: { etiqueta: string; valor: number; resaltado?: boolean }) {
  return (
    <div className={`rounded-lg py-2 ${resaltado ? 'bg-marca-claro dark:bg-teal-900/40' : 'bg-slate-50 dark:bg-slate-700'}`}>
      <p className="text-xs text-slate-500 dark:text-slate-400">{etiqueta}</p>
      <p
        className={`text-lg font-bold ${
          resaltado ? 'text-marca-oscuro dark:text-teal-300' : 'text-slate-800 dark:text-slate-100'
        }`}
      >
        {valor}
      </p>
    </div>
  )
}
