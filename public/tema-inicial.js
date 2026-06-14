// Aplica el tema guardado ANTES de pintar la página, para evitar el parpadeo (FOUC).
// Se carga como script clásico bloqueante en el <head>, así corre antes que React.
;(function () {
  try {
    var t = localStorage.getItem('tema')
    var oscuro = t === 'oscuro' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)
    if (oscuro) document.documentElement.classList.add('dark')
  } catch (e) {
    /* localStorage no disponible: se usa el tema claro por defecto */
  }
})()
