const { port, mongoUri } = require('./config/env');
const connectDB = require('./config/db');
const migrarReservas = require('./config/migraciones');
const app = require('./app');

async function iniciar() {
  try {
    await connectDB(mongoUri);
    await migrarReservas();
    app.listen(port, () => console.log(`API escuchando en http://localhost:${port}`));
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err.message);
    process.exit(1);
  }
}

iniciar();
