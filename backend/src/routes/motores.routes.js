const { Router } = require('express');
const controller = require('../controllers/motores.controller');

const router = Router();

router.get('/', controller.list);
router.get('/:id', controller.getById);

module.exports = router;
