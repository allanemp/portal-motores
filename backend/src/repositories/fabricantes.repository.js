const { pool } = require('../db/pool');

async function findAll() {
  const [rows] = await pool.query('SELECT id, nome FROM fabricantes ORDER BY nome');
  return rows;
}

async function exists(id) {
  const [rows] = await pool.query('SELECT 1 FROM fabricantes WHERE id = ?', [id]);
  return rows.length > 0;
}

module.exports = { findAll, exists };
