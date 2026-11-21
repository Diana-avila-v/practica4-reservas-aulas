// Utilidades de fecha y hora en la zona horaria de Ecuador.
//
// Las fechas de reserva se manejan como texto "AAAA-MM-DD" (y se guardan como
// medianoche UTC solo para poder ordenarlas/filtrarlas). Nunca se usa
// new Date("AAAA-MM-DD") para decidir el día, porque eso se interpreta en UTC y,
// convertido a la hora de Ecuador (UTC-5), cae en el día anterior.

const ZONA_HORARIA = 'America/Guayaquil';
const HORA_APERTURA = '07:00';
const HORA_CIERRE = '21:00';

const formateador = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA_HORARIA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

// Fecha ("AAAA-MM-DD") y hora ("HH:MM") actuales en Ecuador.
function ahoraEnEcuador(referencia = new Date()) {
  const p = Object.fromEntries(formateador.formatToParts(referencia).map(({ type, value }) => [type, value]));
  return { fecha: `${p.year}-${p.month}-${p.day}`, hora: `${p.hour}:${p.minute}` };
}

// true si el día es anterior a hoy, o si es hoy y la hora ya llegó o pasó (hora de Ecuador).
// Las cadenas "AAAA-MM-DD" y "HH:MM" se comparan bien como texto.
function esFechaHoraPasada(fecha, hora, referencia = new Date()) {
  const ahora = ahoraEnEcuador(referencia);
  return fecha < ahora.fecha || (fecha === ahora.fecha && hora <= ahora.hora);
}

function horaDentroDeHorario(hora) {
  return hora >= HORA_APERTURA && hora <= HORA_CIERRE;
}

// Date guardado (medianoche UTC) → "AAAA-MM-DD"
function claveDia(fecha) {
  return fecha.toISOString().slice(0, 10);
}

module.exports = {
  ZONA_HORARIA,
  HORA_APERTURA,
  HORA_CIERRE,
  ahoraEnEcuador,
  esFechaHoraPasada,
  horaDentroDeHorario,
  claveDia,
};
