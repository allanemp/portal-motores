const { Router } = require('express');
const fabricantesRepository = require('../repositories/fabricantes.repository');

const router = Router();

router.get('/', async (req, res) => {
  res.json(await fabricantesRepository.findAll());
});

module.exports = router;
