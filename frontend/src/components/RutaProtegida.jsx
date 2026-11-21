import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Solo deja pasar si hay token; si no, redirige al login con el motivo
// (sesión expirada, sesión cerrada o acceso sin iniciar sesión).
export default function RutaProtegida({ children }) {
  const { autenticado, avisoSalida } = useAuth();
  if (!autenticado) {
    const aviso = avisoSalida ?? { tipo: 'info', texto: 'Inicia sesión para acceder a tus reservas' };
    return <Navigate to="/login" replace state={{ aviso }} />;
  }
  return children;
}
