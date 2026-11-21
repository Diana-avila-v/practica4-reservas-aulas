// Normalización del nombre del aula.
//
// - normalizarAula: formato consistente para guardar y mostrar.
//     "  A1 ,Lab   4 " → "A1, Lab 4"
//   (quita espacios al inicio y al final, convierte varios espacios en uno
//    y deja siempre ", " después de cada coma, sin espacio antes).
// - claveAula: clave de comparación que ignora espacios y mayúsculas.
//     "A1, Lab4", "a1,lab 4" y "A1, Lab 4" → "a1,lab4"
//   Se usa para detectar duplicados y para buscar.

function normalizarAula(texto) {
  return String(texto)
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .trim();
}

function claveAula(texto) {
  return String(texto).replace(/\s+/g, '').toLowerCase();
}

module.exports = { normalizarAula, claveAula };
