const pool = require("../db");

const SELECT_SERVEURS = `
  SELECT s.*, a.id IS NOT NULL AS attribue
  FROM serveur s
  LEFT JOIN abonnement a ON a.serveur_id = s.id`;

class Serveur {
  static async findAll(datacenter, statut, attribue) {
    const { rows } = await pool.query(
      `${SELECT_SERVEURS}
       WHERE ($1::int IS NULL OR s.datacenter_id = $1)
         AND ($2::statut_serveur IS NULL OR s.statut = $2)
         AND ($3::boolean IS NULL OR (a.id IS NOT NULL) = $3)
       ORDER BY s.id`,
      [datacenter, statut, attribue]
    );
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(`${SELECT_SERVEURS} WHERE s.id = $1`, [id]);
    return rows[0] ?? null;
  }
}

module.exports = Serveur;
