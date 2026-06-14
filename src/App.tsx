import { Navigate, Route, Routes } from 'react-router-dom'
import { RutaProtegida } from './auth/RutaProtegida'
import { Login } from './paginas/Login'
import { Productos } from './paginas/Productos'
import { Registrar } from './paginas/Registrar'
import { Historial } from './paginas/Historial'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/productos"
        element={
          <RutaProtegida>
            <Productos />
          </RutaProtegida>
        }
      />
      <Route
        path="/registrar"
        element={
          <RutaProtegida>
            <Registrar />
          </RutaProtegida>
        }
      />
      <Route
        path="/historial"
        element={
          <RutaProtegida>
            <Historial />
          </RutaProtegida>
        }
      />
      <Route path="*" element={<Navigate to="/productos" replace />} />
    </Routes>
  )
}
