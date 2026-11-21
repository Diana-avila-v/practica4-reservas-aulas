import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, describirError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Alerta from '../components/Alerta';
import { EMAIL_REGEX } from '../utils/validaciones';

export default function Login() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mensaje que llega desde otra pantalla (registro correcto, sesión expirada, logout…)
  const [aviso, setAviso] = useState(location.state?.aviso ?? null);

  // Se limpia el estado del historial para que el aviso no reaparezca al recargar.
  useEffect(() => {
    if (location.state?.aviso) navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);
  const [form, setForm] = useState({ email: '', password: '' });
  const [erroresCampo, setErroresCampo] = useState({});
  const [enviando, setEnviando] = useState(false);

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErroresCampo({ ...erroresCampo, [e.target.name]: undefined });
  }

  function validar() {
    const errores = {};
    if (!form.email.trim()) errores.email = 'El email es obligatorio';
    else if (!EMAIL_REGEX.test(form.email.trim())) errores.email = 'El email no tiene un formato válido';
    if (!form.password) errores.password = 'La contraseña es obligatoria';
    setErroresCampo(errores);
    return Object.keys(errores).length === 0;
  }

  async function enviar(e) {
    e.preventDefault();
    if (!validar()) return;
    setEnviando(true);
    setAviso(null);
    try {
      const { data } = await api.post('/auth/login', { email: form.email.trim(), password: form.password });
      iniciarSesion(data.token, data.usuario);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const { mensaje, errores } = describirError(err);
      setAviso({ tipo: 'error', texto: mensaje, errores });
      setEnviando(false);
    }
  }

  return (
    <section className="tarjeta tarjeta--estrecha">
      <h1>Iniciar sesión</h1>
      <p className="texto-suave">Accede para gestionar tus reservas de aulas.</p>

      <Alerta {...aviso} onCerrar={() => setAviso(null)} />

      <form onSubmit={enviar} noValidate className="formulario">
        <div className="campo">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" value={form.email}
            onChange={cambiar} aria-invalid={Boolean(erroresCampo.email)} />
          {erroresCampo.email && <span className="campo__error">{erroresCampo.email}</span>}
        </div>
        <div className="campo">
          <label htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" autoComplete="current-password" value={form.password}
            onChange={cambiar} aria-invalid={Boolean(erroresCampo.password)} />
          {erroresCampo.password && <span className="campo__error">{erroresCampo.password}</span>}
        </div>
        <button type="submit" className="btn btn--primario btn--bloque" disabled={enviando}>
          {enviando ? <><span className="spinner spinner--boton" /> Entrando…</> : 'Entrar'}
        </button>
      </form>

      <p className="pie-formulario">
        ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
      </p>
    </section>
  );
}
