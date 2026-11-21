const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const Usuario = require('../models/Usuario');
const AppError = require('../utils/AppError');

// Exige un header "Authorization: Bearer <token>" válido.
// Responde 401 si falta, es inválido, expiró o el usuario ya no existe.
async function proteger(req, _res, next) {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');

  if (tipo !== 'Bearer' || !token) {
    throw new AppError('No autorizado: falta el token de acceso', 401);
  }

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('No autorizado: el token ha expirado, inicia sesión de nuevo', 401);
    }
    throw new AppError('No autorizado: el token no es válido', 401);
  }

  const usuario = await Usuario.findById(payload.id);
  if (!usuario) {
    throw new AppError('No autorizado: el usuario del token ya no existe', 401);
  }

  req.usuario = usuario;
  next();
}

module.exports = proteger;
