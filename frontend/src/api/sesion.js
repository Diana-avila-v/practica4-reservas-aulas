// Persistencia de la sesión (token + datos del usuario) en localStorage.
const CLAVE = 'reservas_sesion';

export function leerSesion() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE));
    return datos?.token ? datos : null;
  } catch {
    return null;
  }
}

export function guardarSesion(sesion) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(sesion));
  } catch {
    // Sin almacenamiento disponible (modo privado estricto): la sesión vive solo en memoria.
  }
}

export function borrarSesion() {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    /* nada que borrar */
  }
}
