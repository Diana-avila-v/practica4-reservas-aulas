import { formatearFecha } from '../utils/fechas';
import { esHoraDeBloque, rangoHora } from '../utils/validaciones';

export default function ReservaTabla({ reservas, idEditando, idEliminando, onEditar, onEliminar }) {
  return (
    <div className="tabla-envoltorio">
      <table className="tabla">
        <thead>
          <tr>
            <th>Aula</th>
            <th>Fecha</th>
            <th>Horario</th>
            <th>Motivo</th>
            <th className="tabla__acciones-cab">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((r) => (
            <tr key={r._id} className={r._id === idEditando ? 'tabla__fila--activa' : undefined}>
              <td data-label="Aula"><strong>{r.aula}</strong></td>
              <td data-label="Fecha">{formatearFecha(r.fecha)}</td>
              <td data-label="Horario">
                {esHoraDeBloque(r.hora) ? (
                  <span className="tabla__horario">{rangoHora(r.hora)}</span>
                ) : (
                  <span title="Reserva anterior a los bloques de 1 hora">
                    {r.hora} <span className="etiqueta-antigua">fuera de bloque</span>
                  </span>
                )}
              </td>
              <td data-label="Motivo" className="tabla__motivo">{r.motivo}</td>
              <td className="tabla__acciones">
                <button type="button" className="btn btn--secundario btn--pequeno" onClick={() => onEditar(r)}>
                  Editar
                </button>
                <button type="button" className="btn btn--peligro btn--pequeno" onClick={() => onEliminar(r)}
                  disabled={idEliminando === r._id}>
                  {idEliminando === r._id ? 'Eliminando…' : 'Eliminar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
