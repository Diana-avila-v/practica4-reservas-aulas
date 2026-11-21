const { Router } = require('express');
const proteger = require('../middleware/auth');
const { crear, listar, obtener, actualizar, eliminar } = require('../controllers/reservaController');

const router = Router();

// Todas las rutas de reservas requieren un JWT válido.
router.use(proteger);

router.route('/').get(listar).post(crear);
router.route('/:id').get(obtener).put(actualizar).delete(eliminar);

module.exports = router;
