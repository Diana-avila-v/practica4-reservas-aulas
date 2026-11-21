import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import RutaProtegida from './components/RutaProtegida';
import RutaPublica from './components/RutaPublica';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="contenedor">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<RutaPublica><Login /></RutaPublica>} />
          <Route path="/registro" element={<RutaPublica><Registro /></RutaPublica>} />
          <Route path="/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
