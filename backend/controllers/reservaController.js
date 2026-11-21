const Reserva = require('../models/Reserva');
const AppError = require('../utils/AppError');
const {
  HORA_APERTURA,
  HORA_CIERRE,
  claveDia,
  esFechaHoraPasada,
  horaDentroDeHorario,
} = require('../utils/fechaHora');
const { normalizarAula, claveAula } = require('../utils/aula');

const CAMPOS = ['aula', 'fecha', 'hora', 'motivo'];
const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

// Convierte "YYYY-MM-DD" en una fecha a medianoche UTC; null si no es válida.
function parsearFecha(valor) {
  if (typeof valor !== 'string' || !FECHA_REGEX.test(valor.trim())) return null;
  const fecha = new Date(`${valor.trim()}T00:00:00.000Z`);
  // Descarta fechas imposibles como 2026-02-30
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().startsWith(valor.trim()) ? fecha : null;
}

function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Valida y normaliza el cuerpo. Con parcial=true (edición) solo se validan los campos enviados.
function validarReserva(body = {}, parcial = false) {
  const datos = {};
  const errores = [];

  for (const campo of CAMPOS) {
    const presente = body[campo] !== undefined;
    if (!presente && parcial) continue;

    const valor = typeof body[campo] === 'string' ? body[campo].trim() : body[campo];
    if (valor === undefined || valor === null || valor === '') {
      errores.push(`El campo "${campo}" es obligatorio`);
      continue;
    }

    if (campo === 'fecha') {
      const fecha = parsearFecha(valor);
      if (!fecha) errores.push('La fecha debe tener el formato AAAA-MM-DD y ser una fecha real');
      else datos.fecha = fecha;
    } else if (typeof valor !== 'string') {
      errores.push(`El campo "${campo}" debe ser texto`);
    } else if (campo === 'hora' && !HORA_REGEX.test(valor)) {
      errores.push('La hora debe tener el formato HH:MM (por ejemplo 09:30)');
    } else if (campo === 'hora' && !horaDentroDeHorario(valor)) {
      errores.push(`La hora debe estar entre las ${HORA_APERTURA} y las ${HORA_CIERRE}`);
    } else if (campo === 'aula') {
      datos.aula = normalizarAula(valor);
    } else {
      datos[campo] = valor;
    }
  }

  if (parcial && !errores.length && !Object.keys(datos).length) {
    errores.push(`Debes enviar al menos un campo para actualizar: ${CAMPOS.join(', ')}`);
  }
  if (errores.length) throw new AppError('Error de validación', 400, errores);
  return datos;
}

// Rechaza reservas en el pasado (hora de Ecuador). fecha es el Date guardado (medianoche UTC).
function comprobarNoPasada(fecha, hora) {
  if (esFechaHoraPasada(claveDia(fecha), hora)) {
    throw new AppError('No puedes reservar en una fecha u hora pasada', 400);
  }
}

// 409 si esa aula (ignorando espacios y mayúsculas) ya está reservada ese día a esa hora.
// El índice único hace lo mismo en la base de datos; esta comprobación da el error antes.
async function comprobarAulaLibre({ aula, fecha, hora }, idExcluir) {
  const ocupada = await Reserva.exists({
    aulaClave: claveAula(aula),
    fecha,
    hora,
    ...(idExcluir && { _id: { $ne: idExcluir } }),
  });
  if (ocupada) throw new AppError('Esa aula ya está reservada en esa fecha y hora', 409);
}

async function buscarPropia(req) {
  const reserva = await Reserva.findOne({ _id: req.params.id, usuario: req.usuario._id });
  if (!reserva) throw new AppError('Reserva no encontrada', 404);
  return reserva;
}

// POST /api/reservas
async function crear(req, res) {
  const datos = validarReserva(req.body);
  comprobarNoPasada(datos.fecha, datos.hora);
  await comprobarAulaLibre(datos);
  const reserva = await Reserva.create({ ...datos, usuario: req.usuario._id });
  res.status(201).json({ mensaje: 'Reserva creada correctamente', reserva });
}

// GET /api/reservas?q=texto&aula=A1&fecha=2026-11-25
//   q     → busca en aula (ignorando espacios y mayúsculas: "lab4" encuentra "A1, Lab 4")
//           y en motivo (sin distinguir mayúsculas)
//   aula  → filtra por aula exacta (ignorando espacios y mayúsculas)
//   fecha → filtra por día (AAAA-MM-DD)
async function listar(req, res) {
  const { q, aula, fecha } = req.query;
  const filtro = { usuario: req.usuario._id };

  if (typeof q === 'string' && q.trim()) {
    filtro.$or = [
      { aulaClave: new RegExp(escaparRegex(claveAula(q))) },
      { motivo: new RegExp(escaparRegex(q.trim()), 'i') },
    ];
  }
  if (typeof aula === 'string' && aula.trim()) {
    filtro.aulaClave = claveAula(aula);
  }
  if (fecha !== undefined && fecha !== '') {
    const dia = parsearFecha(fecha);
    if (!dia) throw new AppError('El filtro "fecha" debe tener el formato AAAA-MM-DD', 400);
    filtro.fecha = dia;
  }

  const reservas = await Reserva.find(filtro).sort({ fecha: 1, hora: 1 });
  res.json({ total: reservas.length, reservas });
}

// GET /api/reservas/:id
async function obtener(req, res) {
  const reserva = await buscarPropia(req);
  res.json({ reserva });
}

// PUT /api/reservas/:id
async function actualizar(req, res) {
  const reserva = await buscarPropia(req);
  const datos = validarReserva(req.body, true);
  // Si cambia la fecha o la hora, el resultado (combinado con lo guardado) no puede quedar en el pasado.
  if (datos.fecha || datos.hora) {
    comprobarNoPasada(datos.fecha ?? reserva.fecha, datos.hora ?? reserva.hora);
  }
  if (datos.aula || datos.fecha || datos.hora) {
    await comprobarAulaLibre(
      { aula: datos.aula ?? reserva.aula, fecha: datos.fecha ?? reserva.fecha, hora: datos.hora ?? reserva.hora },
      reserva._id
    );
  }
  reserva.set(datos);
  await reserva.save();
  res.json({ mensaje: 'Reserva actualizada correctamente', reserva });
}

// DELETE /api/reservas/:id
async function eliminar(req, res) {
  const reserva = await buscarPropia(req);
  await reserva.deleteOne();
  res.json({ mensaje: 'Reserva eliminada correctamente', id: reserva._id });
}

module.exports = { crear, listar, obtener, actualizar, eliminar };
