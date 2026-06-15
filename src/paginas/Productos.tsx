import { useEffect, useState, type FormEvent } from 'react'
import { Layout } from '../componentes/Layout'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { Aviso } from '../componentes/Aviso'
import { Cargando } from '../componentes/Cargando'
import { Dialogo } from '../componentes/Dialogo'
import { BotonSalir } from '../componentes/BotonSalir'
import {
  actualizarProducto,
  archivarProducto,
  crearProducto,
  listarProductos,
} from '../lib/data/productos'
import type { Producto } from '../lib/data/types'

export function Productos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Producto que se está editando (null = el formulario crea uno nuevo).
  const [enEdicion, setEnEdicion] = useState<Producto | null>(null)

  const [aArchivar, setAArchivar] = useState<Producto | null>(null)
  const [archivando, setArchivando] = useState(false)

  async function cargar() {
    setCargando(true)
    setError(null)
    try {
      setProductos(await listarProductos())
    } catch {
      setError('No pudimos cargar los productos.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  // Carga un producto en el formulario para editarlo y sube al inicio de la página.
  function comenzarEdicion(p: Producto) {
    setEnEdicion(p)
    setNombre(p.nombre)
    setDescripcion(p.descripcion ?? '')
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelarEdicion() {
    setEnEdicion(null)
    setNombre('')
    setDescripcion('')
  }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) return
    setGuardando(true)
    setError(null)
    try {
      if (enEdicion) {
        await actualizarProducto(enEdicion.id, { nombre, descripcion })
      } else {
        await crearProducto({ nombre, descripcion })
      }
      cancelarEdicion()
      await cargar()
    } catch {
      setError(enEdicion ? 'No pudimos guardar los cambios.' : 'No pudimos guardar el producto.')
    } finally {
      setGuardando(false)
    }
  }

  async function confirmarArchivar() {
    if (!aArchivar) return
    setArchivando(true)
    try {
      await archivarProducto(aArchivar.id)
      if (enEdicion?.id === aArchivar.id) cancelarEdicion()
      setAArchivar(null)
      await cargar()
    } catch {
      setError('No pudimos borrar el producto.')
    } finally {
      setArchivando(false)
    }
  }

  return (
    <Layout titulo="Productos" accion={<BotonSalir />}>
      <form
        onSubmit={guardar}
        className="mb-6 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800"
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {enEdicion ? 'Editar producto' : 'Nuevo producto'}
        </h2>
        <Campo
          etiqueta="Nombre"
          placeholder="Ej: Alimento etapa 1"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <Campo
          etiqueta="Descripción (opcional)"
          placeholder="Ej: Saco de 25 kg"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <Boton type="submit" cargando={guardando} ancho>
          {enEdicion ? 'Guardar cambios' : 'Guardar producto'}
        </Boton>
        {enEdicion && (
          <Boton type="button" variante="secundario" onClick={cancelarEdicion} ancho>
            Cancelar
          </Boton>
        )}
      </form>

      {error && (
        <div className="mb-4">
          <Aviso tipo="error">{error}</Aviso>
        </div>
      )}

      {cargando ? (
        <Cargando texto="Cargando productos…" />
      ) : productos.length === 0 ? (
        <p className="py-10 text-center text-slate-500 dark:text-slate-400">
          Aún no tienes productos. Crea el primero en el formulario de arriba.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {productos.map((p) => (
            <li
              key={p.id}
              className={`flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800 ${
                enEdicion?.id === p.id ? 'ring-2 ring-marca dark:ring-teal-400' : ''
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">{p.nombre}</p>
                {p.descripcion && (
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">{p.descripcion}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => comenzarEdicion(p)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-marca active:bg-marca-claro dark:text-teal-300 dark:active:bg-slate-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => setAArchivar(p)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 active:bg-red-50 dark:text-red-400 dark:active:bg-red-950/50"
                >
                  Borrar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {aArchivar && (
        <Dialogo
          titulo={`¿Borrar "${aArchivar.nombre}"?`}
          textoConfirmar="Sí, borrar"
          varianteConfirmar="peligro"
          onConfirmar={confirmarArchivar}
          onCancelar={() => setAArchivar(null)}
          cargando={archivando}
        >
          El producto dejará de aparecer en las listas, pero{' '}
          <strong>su historial de movimientos se conservará</strong>.
        </Dialogo>
      )}
    </Layout>
  )
}
