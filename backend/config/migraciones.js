const Reserva = require('../models/Reserva');
const { normalizarAula, claveAula } = require('../utils/aula');

// Se ejecuta en cada arranque y es idempotente (si no hay nada que cambiar, no cambia nada).
//
// 1. Normaliza el aula de las reservas ya guardadas y les calcula `aulaClave`
//    (las reservas creadas antes de este cambio no la tenían).
// 2. Avisa de reservas que ahora cuentan como duplicadas ("A1, Lab4" y "A1, Lab 4"
//    el mismo día a la misma hora): hay que resolverlas a mano.
// 3. Sincroniza los índices: borra el índice antiguo por `aula` y crea el nuevo
//    índice único por `aulaClave + fecha + hora`.
async function migrarReservas() {
  const reservas = await Reserva.find({}, { aula: 1, aulaClave: 1 }).lean();
  const operaciones = [];
  for (const r of reservas) {
    const aula = normalizarAula(r.aula ?? '');
    const clave = claveAula(aula);
    if (aula !== r.aula || clave !== r.aulaClave) {
      operaciones.push({ updateOne: { filter: { _id: r._id }, update: { $set: { aula, aulaClave: clave } } } });
    }
  }
  if (operaciones.length) {
    await Reserva.bulkWrite(operaciones);
    console.log(`Migración: ${operaciones.length} reserva(s) con el aula normalizada`);
  }

  const duplicadas = await Reserva.aggregate([
    { $group: { _id: { aulaClave: '$aulaClave', fecha: '$fecha', hora: '$hora' }, aulas: { $push: '$aula' }, ids: { $push: '$_id' }, total: { $sum: 1 } } },
    { $match: { total: { $gt: 1 } } },
  ]);
  for (const d of duplicadas) {
    console.warn(
      `AVISO: reservas duplicadas para el aula "${d.aulas[0]}" el ${d._id.fecha.toISOString().slice(0, 10)} ` +
        `a las ${d._id.hora} (ids: ${d.ids.join(', ')}). Elimina o cambia una de ellas.`
    );
  }

  try {
    await Reserva.syncIndexes();
  } catch (err) {
    // Solo ocurre si quedan duplicados: la API sigue rechazando reservas nuevas duplicadas
    // (comprobación en el controlador) y el índice se creará en el siguiente arranque.
    console.warn(`AVISO: no se pudo crear el índice único de reservas: ${err.message}`);
  }
}

module.exports = migrarReservas;
