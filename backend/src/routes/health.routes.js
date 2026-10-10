const { Router } = require('express');
const { pool } = require('../db/pool');

const router = Router();

router.get('/', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'ok' });
  } catch (err) {
    console.error('Health check falhou:', err.code || err.message);
    res.status(503).json({ status: 'error', database: 'error' });
  }
});

module.exports = router;
