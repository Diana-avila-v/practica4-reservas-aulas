import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { autenticado, usuario, cerrarSesion } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar__interior">
        <Link to="/" className="navbar__marca">
          <span className="navbar__logo" aria-hidden="true">▦</span> Reservas de Aulas
        </Link>
        <nav className="navbar__enlaces">
          {autenticado ? (
            <>
              <span className="navbar__usuario" title={usuario?.email}>{usuario?.nombre}</span>
              <button type="button" className="btn btn--secundario btn--pequeno" onClick={() => cerrarSesion()}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="navbar__enlace">Iniciar sesión</NavLink>
              <NavLink to="/registro" className="navbar__enlace">Registrarse</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
