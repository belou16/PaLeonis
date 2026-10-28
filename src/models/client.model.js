const pool = require("../db");

const SELECT_CLIENT = `
  SELECT c.id, c.type, c.email, c.tel, c.date_inscription, c.cree_le, c.modifie_le,
         p.nom, e.siret, e.raison_sociale
  FROM client c
  LEFT JOIN particulier p ON p.client_id = c.id
  LEFT JOIN entreprise  e ON e.client_id = c.id
`;

class Client {
  static async findAll() {
    const { rows } = await pool.query(`${SELECT_CLIENT} ORDER BY c.id`);
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(`${SELECT_CLIENT} WHERE c.id = $1`, [id]);
    return rows[0] ?? null;
  }

  static async createOne({ type, email, tel, nom, siret, raison_sociale }) {
    const db = await pool.connect();
    try {
      await db.query("BEGIN");

      const { rows } = await db.query(
        "INSERT INTO client (type, email, tel) VALUES ($1, $2, $3) RETURNING *",
        [type, email, tel ?? null],
      );
      const client = rows[0];

      if (type === "PARTICULIER") {
        await db.query(
          "INSERT INTO particulier (client_id, nom) VALUES ($1, $2)",
          [client.id, nom],
        );
      } else {
        await db.query(
          "INSERT INTO entreprise (client_id, siret, raison_sociale) VALUES ($1, $2, $3)",
          [client.id, siret, raison_sociale],
        );
      }

      await db.query("COMMIT");
      return Client.findById(client.id);
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    } finally {
      db.release();
    }
  }
}

module.exports = Client;
