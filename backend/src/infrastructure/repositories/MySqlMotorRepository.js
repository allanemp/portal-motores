const { MotorRepository } = require('../../domain/motor/MotorRepository');

const SELECT_MOTOR = `
  SELECT m.id, m.codigo, m.modelo, m.fabricante_id, f.nome AS fabricante_nome,
         m.potencia_cv, m.tensao, m.frequencia_hz, m.polos, m.rotacao_rpm,
         m.carcaca, m.grau_protecao, m.preco, m.criado_em
    FROM motores m
    JOIN fabricantes f ON f.id = m.fabricante_id`;

// Escapa os curingas do LIKE (\, % e _) para que a busca seja pelo texto literal.
function escapeLike(texto) {
  return texto.replace(/[\\%_]/g, '\\$&');
}

// Converte a entidade (camelCase) para a ordem das colunas usadas no INSERT/UPDATE.
function colunas(motor) {
  return [
    motor.codigo, motor.modelo, motor.fabricanteId, motor.potenciaCv, motor.tensao,
    motor.frequenciaHz, motor.polos, motor.rotacaoRpm, motor.carcaca,
    motor.grauProtecao, motor.preco,
  ];
}

class MySqlMotorRepository extends MotorRepository {
  constructor({ database }) {
    super();
    this.db = database;
  }

  async listar(busca) {
    if (busca) {
      const termo = `%${escapeLike(busca)}%`;
      return this.db.query(
        `${SELECT_MOTOR} WHERE m.codigo LIKE ? OR m.modelo LIKE ? ORDER BY m.codigo`,
        [termo, termo],
      );
    }
    return this.db.query(`${SELECT_MOTOR} ORDER BY m.codigo`);
  }

  async buscarPorId(id) {
    const rows = await this.db.query(`${SELECT_MOTOR} WHERE m.id = ?`, [id]);
    return rows[0] || null;
  }

  async codigoEmUso(codigo, ignorarId = 0) {
    const rows = await this.db.query('SELECT 1 FROM motores WHERE codigo = ? AND id <> ?', [codigo, ignorarId]);
    return rows.length > 0;
  }

  async criar(motor) {
    const result = await this.db.query(
      `INSERT INTO motores
         (codigo, modelo, fabricante_id, potencia_cv, tensao, frequencia_hz,
          polos, rotacao_rpm, carcaca, grau_protecao, preco)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      colunas(motor),
    );
    return result.insertId;
  }

  async atualizar(motor) {
    await this.db.query(
      `UPDATE motores
          SET codigo = ?, modelo = ?, fabricante_id = ?, potencia_cv = ?, tensao = ?,
              frequencia_hz = ?, polos = ?, rotacao_rpm = ?, carcaca = ?,
              grau_protecao = ?, preco = ?
        WHERE id = ?`,
      [...colunas(motor), motor.id],
    );
  }

  async excluir(id) {
    const result = await this.db.query('DELETE FROM motores WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = { MySqlMotorRepository, escapeLike };
