const mongoose = require('mongoose');
const { normalizarAula, claveAula } = require('../utils/aula');

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const reservaSchema = new mongoose.Schema(
  {
    aula: {
      type: String,
      required: [true, 'El aula es obligatoria'],
      trim: true,
      maxlength: [50, 'El aula no puede superar los 50 caracteres'],
    },
    // Clave interna del aula sin espacios y en minúsculas ("A1, Lab 4" → "a1,lab4").
    // Se calcula sola a partir de `aula`; no se devuelve en la API.
    aulaClave: {
      type: String,
      required: true,
    },
    fecha: {
      type: Date,
      required: [true, 'La fecha es obligatoria'],
    },
    hora: {
      type: String,
      required: [true, 'La hora es obligatoria'],
      trim: true,
      match: [HORA_REGEX, 'La hora debe tener el formato HH:MM (por ejemplo 09:30)'],
    },
    motivo: {
      type: String,
      required: [true, 'El motivo es obligatorio'],
      trim: true,
      maxlength: [300, 'El motivo no puede superar los 300 caracteres'],
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    // Los índices se sincronizan al arrancar, después de normalizar las reservas
    // existentes (ver config/migraciones.js).
    autoIndex: false,
  }
);

// Un aula no puede reservarse dos veces el mismo día a la misma hora.
// Se compara por aulaClave: ignora espacios y mayúsculas ("A1, Lab4" = "a1,lab 4").
reservaSchema.index({ aulaClave: 1, fecha: 1, hora: 1 }, { unique: true });

// Antes de validar: formato consistente del aula y su clave de comparación.
reservaSchema.pre('validate', function () {
  if (typeof this.aula === 'string') {
    this.aula = normalizarAula(this.aula);
    this.aulaClave = claveAula(this.aula);
  }
});

reservaSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.aulaClave;
    return ret;
  },
});

module.exports = mongoose.model('Reserva', reservaSchema);
