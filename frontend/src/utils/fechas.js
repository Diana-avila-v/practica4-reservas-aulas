// El backend guarda la fecha como medianoche UTC ("2026-11-25T00:00:00.000Z").
// Se trabaja con la parte AAAA-MM-DD para evitar desfases por zona horaria.

export function aFechaInput(iso) {
  return typeof iso === 'string' ? iso.slice(0, 10) : '';
}

// Fecha ("AAAA-MM-DD") y hora ("HH:MM") actuales en Ecuador, sin depender
// de la zona horaria del navegador. Debe coincidir con la regla del backend.
const formateadorEcuador = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Guayaquil',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function ahoraEnEcuador() {
  const p = Object.fromEntries(formateadorEcuador.formatToParts(new Date()).map(({ type, value }) => [type, value]));
  return { fecha: `${p.year}-${p.month}-${p.day}`, hora: `${p.hour}:${p.minute}` };
}

// true si es un día anterior a hoy, o si es hoy y la hora ya llegó o pasó.
export function esFechaHoraPasada(fecha, hora) {
  const ahora = ahoraEnEcuador();
  return fecha < ahora.fecha || (fecha === ahora.fecha && hora <= ahora.hora);
}

export function formatearFecha(iso) {
  const [anio, mes, dia] = aFechaInput(iso).split('-');
  return anio ? `${dia}/${mes}/${anio}` : '';
}
