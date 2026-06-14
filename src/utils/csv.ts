type Valor = string | number | null | undefined

const BOM = String.fromCharCode(0xfeff) // marca de orden de bytes: hace que Excel lea el CSV como UTF-8

/**
 * Genera y descarga un archivo CSV.
 * Incluye un BOM UTF-8 para que Excel muestre bien las tildes y la ñ.
 */
export function descargarCSV(nombreArchivo: string, filas: Record<string, Valor>[]): void {
  if (filas.length === 0) return

  const columnas = Object.keys(filas[0])

  // Anti "inyección de fórmulas" en CSV: si un TEXTO empieza con un caracter que
  // Excel/Sheets podría tomar como fórmula (= + - @ tab CR), le anteponemos un
  // apóstrofo para forzarlo a texto. No aplica a números (no se alteran).
  const escapar = (v: Valor): string => {
    if (v === null || v === undefined) return ''
    let s = String(v)
    if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s)) {
      s = "'" + s
    }
    return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }

  const lineas = [
    columnas.join(','),
    ...filas.map((fila) => columnas.map((c) => escapar(fila[c])).join(',')),
  ]
  const contenido = BOM + lineas.join('\r\n') // BOM + saltos CRLF (amigables con Excel)

  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
  URL.revokeObjectURL(url)
}
