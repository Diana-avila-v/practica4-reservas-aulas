export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MENSAJE_PASADA = 'No puedes reservar en una fecha u hora pasada';

// Bloques fijos de 1 hora que empiezan en punto: 07:00–08:00 … 20:00–21:00.
// Debe coincidir con la regla del backend (backend/utils/fechaHora.js).
export const HORAS_BLOQUE = Array.from({ length: 14 }, (_, i) => `${String(7 + i).padStart(2, '0')}:00`);

export function esHoraDeBloque(hora) {
  return HORAS_BLOQUE.includes(hora);
}

// "08:00" → "08:00 – 09:00". Las reservas antiguas con minutos sueltos (07:12)
// no tienen bloque y se muestran tal cual.
export function rangoHora(hora) {
  if (!esHoraDeBloque(hora)) return hora;
  const fin = String(Number(hora.slice(0, 2)) + 1).padStart(2, '0');
  return `${hora} – ${fin}:00`;
}
