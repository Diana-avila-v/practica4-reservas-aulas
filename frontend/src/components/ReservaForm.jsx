import { useState } from 'react';
import { describirError } from '../api/client';
import Alerta from './Alerta';
import { aFechaInput, ahoraEnEcuador, esFechaHoraPasada } from '../utils/fechas';
import { HORA_APERTURA, HORA_CIERRE, HORA_REGEX, MENSAJE_PASADA } from '../utils/validaciones';

function valoresIniciales(reserva) {
  return {
    aula: reserva?.aula ?? '',
    fecha: aFechaInput(reserva?.fecha),
    hora: reserva?.hora ?? '',
    motivo: reserva?.motivo ?? '',
  };
}

function validar(form) {
  const errores = {};
  if (!form.aula.trim()) errores.aula = 'El aula es obligatoria';
  if (!form.fecha) errores.fecha = 'La fecha es obligatoria';
  if (!form.hora) errores.hora = 'La hora es obligatoria';
  else if (!HORA_REGEX.test(form.hora)) errores.hora = 'Usa el formato HH:MM';
  else if (form.hora < HORA_APERTURA || form.hora > HORA_CIERRE) {
    errores.hora = `La hora debe estar entre las ${HORA_APERTURA} y las ${HORA_CIERRE}`;
  }
  if (!errores.fecha && !errores.hora && esFechaHoraPasada(form.fecha, form.hora)) {
    errores.fecha = MENSAJE_PASADA;
  }
  if (!form.motivo.trim()) errores.motivo = 'El motivo es obligatorio';
  else if (form.motivo.trim().length > 300) errores.motivo = 'Máximo 300 caracteres';
  return errores;
}

// Formulario de alta y edición. `reserva` null = crear; con datos = editar.
// `onGuardar(datos)` debe devolver una promesa; si falla, el error se muestra aquí.
export default function ReservaForm({ reserva, onGuardar, onCancelar }) {
  const editando = Boolean(reserva);
  const [form, setForm] = useState(() => valoresIniciales(reserva));
  const [erroresCampo, setErroresCampo] = useState({});
  const [error, setError] = useState(null);
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
    setError(null);
    try {
      await onGuardar({ aula: form.aula.trim(), fecha: form.fecha, hora: form.hora, motivo: form.motivo.trim() });
      if (!editando) setForm(valoresIniciales(null));
    } catch (err) {
      const { status, mensaje, errores: erroresApi } = describirError(err);
      if (status === 401) return; // la sesión se cierra y se redirige al login
      setError(
        status === 409
          ? {
              texto: 'Reserva duplicada',
              errores: [`${mensaje}. Elige otra aula, fecha u hora.`],
            }
          : { texto: mensaje, errores: erroresApi }
      );
    } finally {
      setEnviando(false);
    }
  }

  const textoBoton = editando ? 'Guardar cambios' : 'Crear reserva';

  return (
    <form onSubmit={enviar} noValidate className="formulario">
      <Alerta tipo="error" {...error} onCerrar={() => setError(null)} />

      <div className="formulario__fila">
        <div className="campo">
          <label htmlFor="aula">Aula</label>
          <input id="aula" name="aula" placeholder="Ej. A1, Lab 3" maxLength={50} value={form.aula}
            onChange={cambiar} aria-invalid={Boolean(erroresCampo.aula)} />
          {erroresCampo.aula && <span className="campo__error">{erroresCampo.aula}</span>}
        </div>
        <div className="campo">
          <label htmlFor="fecha">Fecha</label>
          <input id="fecha" name="fecha" type="date" min={ahoraEnEcuador().fecha} value={form.fecha}
            onChange={cambiar} aria-invalid={Boolean(erroresCampo.fecha)} />
          {erroresCampo.fecha && <span className="campo__error">{erroresCampo.fecha}</span>}
        </div>
        <div className="campo">
          <label htmlFor="hora">Hora</label>
          <input id="hora" name="hora" type="time" min={HORA_APERTURA} max={HORA_CIERRE} value={form.hora}
            onChange={cambiar} aria-invalid={Boolean(erroresCampo.hora)} />
          {erroresCampo.hora && <span className="campo__error">{erroresCampo.hora}</span>}
        </div>
      </div>

      <div className="campo">
        <label htmlFor="motivo">Motivo</label>
        <textarea id="motivo" name="motivo" rows={2} maxLength={300} placeholder="Ej. Clase de Bases de Datos"
          value={form.motivo} onChange={cambiar} aria-invalid={Boolean(erroresCampo.motivo)} />
        {erroresCampo.motivo && <span className="campo__error">{erroresCampo.motivo}</span>}
      </div>

      <div className="formulario__acciones">
        <button type="submit" className="btn btn--primario" disabled={enviando}>
          {enviando ? <><span className="spinner spinner--boton" /> Guardando…</> : textoBoton}
        </button>
        {editando && (
          <button type="button" className="btn btn--secundario" onClick={onCancelar} disabled={enviando}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
