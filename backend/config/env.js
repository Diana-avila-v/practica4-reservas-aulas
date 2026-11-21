const path = require('path');

// Carga backend/.env aunque el proceso se arranque desde otra carpeta.
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const requeridas = ['MONGO_URI', 'JWT_SECRET'];
const faltan = requeridas.filter((nombre) => !process.env[nombre]);
if (faltan.length) {
  throw new Error(`Faltan variables de entorno: ${faltan.join(', ')}. Revisa el archivo .env`);
}

module.exports = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
