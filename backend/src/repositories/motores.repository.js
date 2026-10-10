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

// Verifica se já existe outro motor com o mesmo código (ignorando o próprio, na edição).
async function codigoEmUso(codigo, ignoreId = 0) {
  const [rows] = await pool.query('SELECT 1 FROM motores WHERE codigo = ? AND id <> ?', [codigo, ignoreId]);
  return rows.length > 0;
}

async function create(motor) {
  const [result] = await pool.query(
    `INSERT INTO motores
       (codigo, modelo, fabricante_id, potencia_cv, tensao, frequencia_hz,
        polos, rotacao_rpm, carcaca, grau_protecao, preco)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      motor.codigo, motor.modelo, motor.fabricante_id, motor.potencia_cv, motor.tensao,
      motor.frequencia_hz, motor.polos, motor.rotacao_rpm, motor.carcaca,
      motor.grau_protecao, motor.preco,
    ],
  );
  return result.insertId;
}

async function update(id, motor) {
  await pool.query(
    `UPDATE motores
        SET codigo = ?, modelo = ?, fabricante_id = ?, potencia_cv = ?, tensao = ?,
            frequencia_hz = ?, polos = ?, rotacao_rpm = ?, carcaca = ?,
            grau_protecao = ?, preco = ?
      WHERE id = ?`,
    [
      motor.codigo, motor.modelo, motor.fabricante_id, motor.potencia_cv, motor.tensao,
      motor.frequencia_hz, motor.polos, motor.rotacao_rpm, motor.carcaca,
      motor.grau_protecao, motor.preco, id,
    ],
  );
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM motores WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, codigoEmUso, create, update, remove, escapeLike };
