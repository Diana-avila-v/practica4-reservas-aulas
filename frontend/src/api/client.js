import axios from 'axios';
import { leerSesion } from './sesion';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Añade "Authorization: Bearer <token>" a todas las peticiones si hay sesión.
api.interceptors.request.use((config) => {
  const token = leerSesion()?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// El AuthProvider registra aquí qué hacer cuando el token deja de ser válido.
let manejador401 = null;
export function registrarManejador401(fn) {
  manejador401 = fn;
}

// Un 401 en una petición que llevaba token = token inválido o expirado.
// (Un 401 en el login sin token es solo "credenciales incorrectas" y no cierra nada.)
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401 && error.config?.headers?.Authorization && manejador401) {
      manejador401();
    }
    return Promise.reject(error);
  }
);

// Convierte un error de axios en { mensaje, errores, status } legible.
export function describirError(error) {
  if (!error.response) {
    return {
      status: 0,
      mensaje: 'No se pudo conectar con el servidor. Comprueba que el backend está en marcha.',
      errores: [],
    };
  }
  const { status, data } = error.response;
  return {
    status,
    mensaje: data?.mensaje || 'Ha ocurrido un error inesperado',
    errores: Array.isArray(data?.errores) ? data.errores : [],
  };
}
