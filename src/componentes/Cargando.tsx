export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500 dark:text-slate-400">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-marca dark:border-slate-600 dark:border-t-teal-400" />
      <p className="text-base">{texto}</p>
    </div>
  )
}
