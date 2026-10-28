const pool = require("../db");

class Technicien {
  static async findAll() {
    const { rows } = await pool.query(
      "SELECT id, datacenter_id, nom, prenom, mail_pro FROM technicien ORDER BY id"
    );
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(
      "SELECT id, datacenter_id, nom, prenom, mail_pro FROM technicien WHERE id = $1",
      [id]
    );
    return rows[0] ?? null;
  }
}

module.exports = Technicien;
