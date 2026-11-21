import { useCallback, useEffect, useRef, useState } from 'react';
import { api, describirError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Alerta from '../components/Alerta';
import Cargando from '../components/Cargando';
import ReservaForm from '../components/ReservaForm';
import ReservaTabla from '../components/ReservaTabla';
import { formatearFecha } from '../utils/fechas';

const FILTROS_VACIOS = { q: '', fecha: '' };

export default function Dashboard() {
  const { usuario, actualizarUsuario } = useAuth();

  const [perfil, setPerfil] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState(null);

  const [filtrosForm, setFiltrosForm] = useState(FILTROS_VACIOS);
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);

  const [editando, setEditando] = useState(null);
  const [idEliminando, setIdEliminando] = useState(null);
  const formRef = useRef(null);

  // Datos del usuario desde /api/auth/me
  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => {
        setPerfil(data.usuario);
        actualizarUsuario(data.usuario);
      })
      .catch((err) => {
        const e = describirError(err);
        if (e.status !== 401) setAviso({ tipo: 'error', texto: e.mensaje });
      });
  }, [actualizarUsuario]);

  const cargarReservas = useCallback(async () => {
    setCargando(true);
    try {
      const params = {};
      if (filtros.q.trim()) params.q = filtros.q.trim();
      if (filtros.fecha) params.fecha = filtros.fecha;
      const { data } = await api.get('/reservas', { params });
      setReservas(data.reservas);
    } catch (err) {
      const e = describirError(err);
      if (e.status !== 401) setAviso({ tipo: 'error', texto: e.mensaje, errores: e.errores });
    } finally {
      setCargando(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargarReservas();
  }, [cargarReservas]);

  function buscar(e) {
    e.preventDefault();
    setFiltros({ ...filtrosForm });
  }

  function limpiarFiltros() {
    setFiltrosForm(FILTROS_VACIOS);
    setFiltros(FILTROS_VACIOS);
  }

  async function guardar(datos) {
    setAviso(null);
    if (editando) {
      await api.put(`/reservas/${editando._id}`, datos);
      setAviso({ tipo: 'exito', texto: 'Reserva actualizada correctamente' });
      setEditando(null);
    } else {
      await api.post('/reservas', datos);
      setAviso({ tipo: 'exito', texto: 'Reserva creada correctamente' });
    }
    await cargarReservas();
  }

  function empezarEdicion(reserva) {
    setEditando(reserva);
    setAviso(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function eliminar(reserva) {
    const ok = window.confirm(
      `¿Seguro que quieres eliminar la reserva del aula ${reserva.aula} ` +
        `del ${formatearFecha(reserva.fecha)} a las ${reserva.hora}?\n\nEsta acción no se puede deshacer.`
    );
    if (!ok) return;

    setIdEliminando(reserva._id);
    try {
      await api.delete(`/reservas/${reserva._id}`);
      if (editando?._id === reserva._id) setEditando(null);
      setAviso({ tipo: 'exito', texto: 'Reserva eliminada correctamente' });
      await cargarReservas();
    } catch (err) {
      const e = describirError(err);
      if (e.status !== 401) setAviso({ tipo: 'error', texto: e.mensaje });
    } finally {
      setIdEliminando(null);
    }
  }

  const nombre = perfil?.nombre ?? usuario?.nombre ?? '';
  const hayFiltros = Boolean(filtros.q.trim() || filtros.fecha);

  return (
    <div className="dashboard">
      <section className="bienvenida">
        <h1>Bienvenido, {nombre || '…'}</h1>
        <p className="texto-suave">Gestiona aquí tus reservas de aulas.</p>
      </section>

      <Alerta {...aviso} onCerrar={() => setAviso(null)} />

      <div className="dashboard__rejilla">
        <section className="tarjeta" ref={formRef}>
          <h2>{editando ? 'Editar reserva' : 'Nueva reserva'}</h2>
          <ReservaForm
            key={editando?._id ?? 'nueva'}
            reserva={editando}
            onGuardar={guardar}
            onCancelar={() => setEditando(null)}
          />
        </section>

        <section className="tarjeta">
          <div className="tarjeta__cabecera">
            <h2>Mis reservas</h2>
            {!cargando && <span className="insignia">{reservas.length}</span>}
          </div>

          <form className="filtros" onSubmit={buscar} role="search">
            <input type="search" placeholder="Buscar por aula o motivo…" aria-label="Buscar por aula o motivo"
              value={filtrosForm.q} onChange={(e) => setFiltrosForm({ ...filtrosForm, q: e.target.value })} />
            <input type="date" aria-label="Filtrar por fecha" value={filtrosForm.fecha}
              onChange={(e) => setFiltrosForm({ ...filtrosForm, fecha: e.target.value })} />
            <button type="submit" className="btn btn--primario">Buscar</button>
            {(hayFiltros || filtrosForm.q || filtrosForm.fecha) && (
              <button type="button" className="btn btn--secundario" onClick={limpiarFiltros}>Limpiar</button>
            )}
          </form>

          {cargando ? (
            <Cargando texto="Cargando reservas…" />
          ) : reservas.length === 0 ? (
            <p className="vacio">
              {hayFiltros ? 'No hay reservas que coincidan con la búsqueda.' : 'Todavía no tienes reservas. Crea la primera con el formulario.'}
            </p>
          ) : (
            <ReservaTabla
              reservas={reservas}
              idEditando={editando?._id}
              idEliminando={idEliminando}
              onEditar={empezarEdicion}
              onEliminar={eliminar}
            />
          )}
        </section>
      </div>
    </div>
  );
}
