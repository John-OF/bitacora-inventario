/** Fecha de hoy en formato YYYY-MM-DD (para inputs type="date"), en hora local. */
export function hoyISO(): string {
  const ahora = new Date()
  const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

/** Convierte "2026-06-14" en algo legible: "14 jun 2026". */
export function fechaLegible(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number)
  if (!a || !m || !d) return iso
  return new Date(a, m - 1, d).toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
