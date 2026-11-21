const { Router } = require('express');
const { registrar, login, perfil } = require('../controllers/authController');
const proteger = require('../middleware/auth');

const router = Router();

router.post('/register', registrar);
router.post('/login', login);
router.get('/me', proteger, perfil);

module.exports = router;
