// Mensaje visible de éxito, error o información, con lista opcional de errores.
export default function Alerta({ tipo = 'info', texto, errores = [], onCerrar }) {
  if (!texto) return null;
  return (
    <div className={`alerta alerta--${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      <div className="alerta__cuerpo">
        <strong>{texto}</strong>
        {errores.length > 0 && (
          <ul className="alerta__lista">
            {errores.map((e) => <li key={e}>{e}</li>)}
          </ul>
        )}
      </div>
      {onCerrar && (
        <button type="button" className="alerta__cerrar" onClick={onCerrar} aria-label="Cerrar mensaje">
          ×
        </button>
      )}
    </div>
  );
}
