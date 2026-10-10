const { pool } = require('../db/pool');

// Todas as consultas usam placeholders "?": o driver envia os valores
// separados do SQL, então texto vindo da requisição nunca vira código SQL.

const SELECT_MOTOR = `
  SELECT m.id, m.codigo, m.modelo, m.fabricante_id, f.nome AS fabricante_nome,
         m.potencia_cv, m.tensao, m.frequencia_hz, m.polos, m.rotacao_rpm,
         m.carcaca, m.grau_protecao, m.preco, m.criado_em
    FROM motores m
    JOIN fabricantes f ON f.id = m.fabricante_id`;

// Escapa os curingas do LIKE (% e _) para que a busca seja pelo texto literal.
function escapeLike(text) {
  return text.replace(/[\\%_]/g, '\\$&');
}

async function findAll(search) {
  if (search) {
    const term = `%${escapeLike(search)}%`;
    const [rows] = await pool.query(
      `${SELECT_MOTOR} WHERE m.codigo LIKE ? OR m.modelo LIKE ? ORDER BY m.codigo`,
      [term, term],
    );
    return rows;
  }
  const [rows] = await pool.query(`${SELECT_MOTOR} ORDER BY m.codigo`);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(`${SELECT_MOTOR} WHERE m.id = ?`, [id]);
  return rows[0] || null;
}

module.exports = { findAll, findById, escapeLike };
