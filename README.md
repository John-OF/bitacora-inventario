# Bitácora de Inventario

Aplicación web sencilla para llevar el control diario de inventario de una bodega
(pensada inicialmente para una bodega de fábrica de alimento de camarón).

Está diseñada para ser **fácil de usar desde el celular**, en español y con botones grandes.

## ¿Qué hace?

- **Productos:** crear, listar y "borrar" (al borrar, en realidad se *archiva*, así el
  historial de movimientos nunca se pierde).
- **Registro diario:** elegir producto, fecha, lote y las cantidades que había al inicio,
  cuántas llegan y cuántas salen. La app **calcula "cuántos quedan" en vivo** y avisa en
  rojo si el resultado da negativo.
- **Historial:** lista de movimientos (más recientes primero), filtrable por producto, con
  el lote visible y la **existencia actual** de cada producto.
- **Exportar a CSV** (se abre en Excel) para tener un respaldo legible y compartible.
- **Multiusuario:** cada cuenta ve solo sus propios datos (seguridad RLS de Supabase).

## Tecnología

- **Frontend:** React + Vite + TypeScript + Tailwind CSS (se publica como sitio estático).
- **Backend / datos / login:** Supabase (PostgreSQL + Auth + Row Level Security).

La interfaz nunca habla directamente con la base de datos: todo pasa por la **capa de datos**
en `src/lib/data/`, lo que facilita cambiar o ampliar el backend más adelante.

---

## Puesta en marcha (paso a paso)

### 1. Requisitos

- [Node.js](https://nodejs.org) 18 o superior (recomendado 20+).
- Una cuenta gratuita en [Supabase](https://supabase.com).

### 2. Crear el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) y crea un **New project** (guarda la contraseña
   de la base de datos en un lugar seguro).
2. Espera 1–2 minutos a que termine de crearse.

### 3. Crear las tablas y la seguridad

1. En el panel de Supabase abre **SQL Editor → New query**.
2. Abre el archivo [`supabase/schema.sql`](./supabase/schema.sql) de este proyecto.
3. Copia **todo** su contenido, pégalo en el editor y presiona **Run**.
   Esto crea las tablas `productos` y `movimientos`, activa la seguridad por usuario (RLS)
   y crea la vista de existencias.

### 4. Crear el primer usuario

Al inicio, lo más simple y seguro es **crear las cuentas a mano** (sin registro público):

1. En Supabase ve a **Authentication → Sign In / Providers** y asegúrate de que **Email**
   esté habilitado. *(Recomendado: desactiva "Allow new users to sign up" para que nadie
   más pueda registrarse por su cuenta.)*
2. Ve a **Authentication → Users → Add user → Create new user**.
3. Escribe el **correo** y una **contraseña**, y marca **"Auto Confirm User"** (así no hace
   falta confirmar por email).
4. Esa será la cuenta para iniciar sesión en la app.

> Para agregar más usuarios en el futuro, repite este paso. Cada usuario verá únicamente
> sus propios productos y movimientos.

### 5. Configurar las variables de entorno

1. En Supabase ve a **Settings → API**.
2. Copia el **Project URL** (solo el dominio, **sin** `/rest/v1/` ni barra final) y la clave
   pública del cliente — sirve la **anon public** (`eyJ...`) o la **Publishable key**
   (`sb_publishable_...`). Nunca uses la `service_role`/`Secret key`.
3. En la raíz del proyecto, copia el archivo `.env.example` y nómbralo `.env`:
   ```bash
   cp .env.example .env
   ```
4. Rellena los valores:
   ```
   VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anon-publica
   ```

> ⚠️ **Nunca** pongas la clave `service_role` en el frontend ni en el `.env`. Aquí solo va la
> clave pública `anon`. El archivo `.env` está ignorado por git.

### 6. Correr en tu computadora

```bash
npm install
npm run dev
```

Abre en el navegador la dirección que aparece en la terminal (normalmente
`http://localhost:5173`). Para probarla como celular, abre las herramientas del navegador
(tecla `F12`) y activa la vista de dispositivo móvil.

---

## Desplegar en Cloudflare Pages

1. Sube este proyecto a un repositorio de **GitHub**.
2. En Cloudflare entra a **Workers & Pages → Create → Pages → Connect to Git** y elige el repo.
3. Configura el build:
   - **Framework preset:** `Vite` (o `None`)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. En **Settings → Environment variables** agrega las mismas dos variables del `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Pulsa **Deploy**. El archivo `public/_redirects` ya está incluido para que las rutas de la
   app funcionen correctamente.

---

## Estructura del proyecto

```
src/
  lib/
    supabase.ts        Cliente de Supabase (único punto de conexión)
    data/              CAPA DE DATOS: la UI solo habla con estas funciones
      types.ts         Tipos (Producto, Movimiento, ...)
      auth.ts          Iniciar/cerrar sesión
      productos.ts     Crear / listar / archivar productos
      movimientos.ts   Crear / listar movimientos, existencia actual
  auth/                Contexto de sesión y ruta protegida
  componentes/         Botones, campos, layout, diálogos, ... (reutilizables)
  paginas/             Login, Productos, Registrar, Historial
  utils/               CSV y formato de fechas
supabase/
  schema.sql           SQL para pegar en Supabase (tablas, RLS, vista)
public/
  _redirects           Reglas de rutas para Cloudflare Pages
```

---

## Decisiones de diseño (para quien continúe el proyecto)

- **`quedan` es una columna generada** en PostgreSQL (`inicio + llegan - salen`). La base de
  datos la calcula sola, así nunca se desincroniza. La app además la muestra "en vivo"
  mientras se escribe, solo como ayuda visual.
- **"Borrar" un producto = archivarlo** (`archivado_en`). Desaparece de las listas pero su
  fila y su historial se conservan.
- **Login con correo + contraseña**, porque la sesión queda guardada y es más simple para un
  usuario no técnico que recibir un enlace por correo cada vez.
- **Datos aislados por cuenta** mediante RLS desde el inicio, listo para crecer a multiusuario.
