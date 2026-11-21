import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, describirError } from '../api/client';
import Alerta from '../components/Alerta';
import { EMAIL_REGEX } from '../utils/validaciones';

const VACIO = { nombre: '', email: '', password: '', confirmar: '' };

function validar(form) {
  const errores = {};
  if (!form.nombre.trim()) errores.nombre = 'El nombre es obligatorio';
  if (!form.email.trim()) errores.email = 'El email es obligatorio';
  else if (!EMAIL_REGEX.test(form.email.trim())) errores.email = 'El email no tiene un formato válido';
  if (!form.password) errores.password = 'La contraseña es obligatoria';
  else if (form.password.length < 6) errores.password = 'La contraseña debe tener al menos 6 caracteres';
  if (!form.confirmar) errores.confirmar = 'Confirma la contraseña';
  else if (form.confirmar !== form.password) errores.confirmar = 'Las contraseñas no coinciden';
  return errores;
}

export default function Registro() {
  const navigate = useNavigate();
  const [form, setForm] = useState(VACIO);
  const [erroresCampo, setErroresCampo] = useState({});
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErroresCampo({ ...erroresCampo, [e.target.name]: undefined });
  }

  async function enviar(e) {
    e.preventDefault();
    const errores = validar(form);
    setErroresCampo(errores);
    if (Object.keys(errores).length) return;

    setEnviando(true);
    setAviso(null);
    try {
      await api.post('/auth/register', {
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate('/login', {
        replace: true,
        state: { aviso: { tipo: 'exito', texto: 'Registro completado. Ya puedes iniciar sesión.' } },
      });
    } catch (err) {
      const { status, mensaje, errores: erroresApi } = describirError(err);
      if (status === 409) setErroresCampo({ email: mensaje });
      setAviso({ tipo: 'error', texto: mensaje, errores: erroresApi });
      setEnviando(false);
    }
  }

  const campo = (nombre, etiqueta, tipo = 'text', autoComplete) => (
    <div className="campo">
      <label htmlFor={nombre}>{etiqueta}</label>
      <input id={nombre} name={nombre} type={tipo} autoComplete={autoComplete} value={form[nombre]}
        onChange={cambiar} aria-invalid={Boolean(erroresCampo[nombre])} />
      {erroresCampo[nombre] && <span className="campo__error">{erroresCampo[nombre]}</span>}
    </div>
  );

  return (
    <section className="tarjeta tarjeta--estrecha">
      <h1>Crear cuenta</h1>
      <p className="texto-suave">Regístrate para reservar aulas.</p>

      <Alerta {...aviso} onCerrar={() => setAviso(null)} />

      <form onSubmit={enviar} noValidate className="formulario">
        {campo('nombre', 'Nombre', 'text', 'name')}
        {campo('email', 'Email', 'email', 'email')}
        {campo('password', 'Contraseña (mínimo 6 caracteres)', 'password', 'new-password')}
        {campo('confirmar', 'Confirmar contraseña', 'password', 'new-password')}
        <button type="submit" className="btn btn--primario btn--bloque" disabled={enviando}>
          {enviando ? <><span className="spinner spinner--boton" /> Registrando…</> : 'Registrarme'}
        </button>
      </form>

      <p className="pie-formulario">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </section>
  );
}
