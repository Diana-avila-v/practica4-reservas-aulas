const express = require('express');
const cors = require('cors');
const { clientUrl } = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const reservaRoutes = require('./routes/reservaRoutes');
const { noEncontrado, manejarErrores } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: clientUrl }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ estado: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/reservas', reservaRoutes);

app.use(noEncontrado);
app.use(manejarErrores);

module.exports = app;
