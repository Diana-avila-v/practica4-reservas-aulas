const mongoose = require('mongoose');

const CAMPOS_DUPLICADOS = {
  email: 'Ya existe un usuario registrado con ese email',
  aulaClave: 'Esa aula ya está reservada en esa fecha y hora',
};

function noEncontrado(req, _res, next) {
  const err = new Error(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
}

// Manejador centralizado: traduce cualquier error a { mensaje, errores? }.
// eslint-disable-next-line no-unused-vars
function manejarErrores(err, _req, res, _next) {
  let status = err.statusCode || 500;
  let mensaje = err.message || 'Error interno del servidor';
  let errores = err.detalles;

  if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    errores = Object.values(err.errors).map((e) =>
      e instanceof mongoose.Error.CastError ? `El campo "${e.path}" no tiene un valor válido` : e.message
    );
    mensaje = 'Error de validación';
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    mensaje = err.path === '_id' ? 'El identificador no es válido' : `El campo "${err.path}" no tiene un valor válido`;
  } else if (err.code === 11000) {
    status = 409;
    const campo = Object.keys(err.keyPattern || err.keyValue || {})[0];
    mensaje = CAMPOS_DUPLICADOS[campo] || 'Ya existe un registro con esos datos';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    mensaje = 'El cuerpo de la petición no es un JSON válido';
  }

  if (status >= 500) {
    console.error(err);
    mensaje = 'Error interno del servidor';
    errores = undefined;
  }

  res.status(status).json({ mensaje, ...(errores && { errores }) });
}

module.exports = { noEncontrado, manejarErrores };
