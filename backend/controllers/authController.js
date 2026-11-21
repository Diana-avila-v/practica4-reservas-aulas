const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const AppError = require('../utils/AppError');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function generarToken(usuario) {
  return jwt.sign({ id: usuario._id.toString() }, jwtSecret, { expiresIn: jwtExpiresIn });
}

// POST /api/auth/register
async function registrar(req, res) {
  const nombre = texto(req.body?.nombre);
  const email = texto(req.body?.email).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  const errores = [];
  if (!nombre) errores.push('El nombre es obligatorio');
  if (!email) errores.push('El email es obligatorio');
  else if (!EMAIL_REGEX.test(email)) errores.push('El email no tiene un formato válido');
  if (!password) errores.push('La contraseña es obligatoria');
  else if (password.length < 6) errores.push('La contraseña debe tener al menos 6 caracteres');
  if (errores.length) throw new AppError('Error de validación', 400, errores);

  if (await Usuario.exists({ email })) {
    throw new AppError('Ya existe un usuario registrado con ese email', 409);
  }

  const usuario = await Usuario.create({ nombre, email, password });
  res.status(201).json({
    mensaje: 'Usuario registrado correctamente',
    token: generarToken(usuario),
    usuario,
  });
}

// POST /api/auth/login
async function login(req, res) {
  const email = texto(req.body?.email).toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  const errores = [];
  if (!email) errores.push('El email es obligatorio');
  if (!password) errores.push('La contraseña es obligatoria');
  if (errores.length) throw new AppError('Error de validación', 400, errores);

  const usuario = await Usuario.findOne({ email }).select('+password');
  if (!usuario || !(await usuario.compararPassword(password))) {
    throw new AppError('Email o contraseña incorrectos', 401);
  }

  res.json({
    mensaje: 'Inicio de sesión correcto',
    token: generarToken(usuario),
    usuario,
  });
}

// GET /api/auth/me (protegida)
function perfil(req, res) {
  res.json({ usuario: req.usuario });
}

module.exports = { registrar, login, perfil };
