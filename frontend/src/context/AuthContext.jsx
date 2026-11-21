import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { registrarManejador401 } from '../api/client';
import { borrarSesion, guardarSesion, leerSesion } from '../api/sesion';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion);
  // Motivo de la última salida ({ tipo, texto }); RutaProtegida lo pasa al login al redirigir.
  const [avisoSalida, setAvisoSalida] = useState(null);

  const iniciarSesion = useCallback((token, usuario) => {
    const nueva = { token, usuario };
    guardarSesion(nueva);
    setAvisoSalida(null);
    setSesion(nueva);
  }, []);

  const actualizarUsuario = useCallback((usuario) => {
    setSesion((actual) => {
      if (!actual) return actual;
      const nueva = { ...actual, usuario };
      guardarSesion(nueva);
      return nueva;
    });
  }, []);

  // Al quedar sin sesión, RutaProtegida redirige al login mostrando `aviso`.
  const cerrarSesion = useCallback(
    (aviso = { tipo: 'exito', texto: 'Has cerrado sesión correctamente' }) => {
      borrarSesion();
      setAvisoSalida(aviso);
      setSesion(null);
    },
    []
  );

  // Token inválido o expirado → se borra la sesión y se vuelve al login.
  useEffect(() => {
    registrarManejador401(() => cerrarSesion({ tipo: 'error', texto: 'Sesión expirada' }));
    return () => registrarManejador401(null);
  }, [cerrarSesion]);

  const valor = useMemo(
    () => ({
      token: sesion?.token ?? null,
      usuario: sesion?.usuario ?? null,
      autenticado: Boolean(sesion?.token),
      avisoSalida,
      iniciarSesion,
      cerrarSesion,
      actualizarUsuario,
    }),
    [sesion, avisoSalida, iniciarSesion, cerrarSesion, actualizarUsuario]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
