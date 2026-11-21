import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Login y registro: si ya hay sesión iniciada, se va directo al Dashboard.
export default function RutaPublica({ children }) {
  const { autenticado } = useAuth();
  return autenticado ? <Navigate to="/dashboard" replace /> : children;
}
