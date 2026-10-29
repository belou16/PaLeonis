const pool = require("../db");

class Catalogue {
  #id;
  #nom;
  #categorie;
  #prixMensuelHt;
  #enVente;

  static CATEGORIES = ["VPS", "HEBERGEMENT_MUTUALISE", "SERVEUR_DEDIE", "NOM_DE_DOMAINE"];

  constructor({ id, nom, categorie, prixMensuelHt, enVente }) {
    this.#id = id;
    this.#nom = nom;
    this.#categorie = categorie;
    this.#prixMensuelHt = prixMensuelHt;
    this.#enVente = enVente;
  }

  get id() {
    return this.#id;
  }

  get nom() {
    return this.#nom;
  }

  get categorie() {
    return this.#categorie;
  }

  get prixMensuelHt() {
    return this.#prixMensuelHt;
  }

  get enVente() {
    return this.#enVente;
  }

  toJSON() {
    return {
      id: this.#id,
      nom: this.#nom,
      categorie: this.#categorie,
      prixMensuelHt: this.#prixMensuelHt,
      enVente: this.#enVente,
    };
  }

  static #fromRow(row) {
    return new Catalogue({
      id: row.id,
      nom: row.nom,
      categorie: row.categorie,
      prixMensuelHt: Number(row.prix_mensuel_ht),
      enVente: row.en_vente,
    });
  }

  static async findAll(categorie, enVente) {
    const { rows } = await pool.query(
      `SELECT * FROM offre
       WHERE ($1::categorie_offre IS NULL OR categorie = $1)
         AND ($2::boolean IS NULL OR en_vente = $2)
       ORDER BY id`,
      [categorie, enVente]
    );
    return rows.map(Catalogue.#fromRow);
  }

  static async findById(id) {
    const { rows } = await pool.query("SELECT * FROM offre WHERE id = $1", [id]);
    return rows[0] ? Catalogue.#fromRow(rows[0]) : null;
  }

  static async create({ nom, categorie, prixMensuelHt, enVente }) {
    const { rows } = await pool.query(
      `INSERT INTO offre (nom, categorie, prix_mensuel_ht, en_vente)
       VALUES ($1, $2, $3, COALESCE($4, TRUE))
       RETURNING *`,
      [nom, categorie, prixMensuelHt, enVente]
    );
    return Catalogue.#fromRow(rows[0]);
  }

  static async update(id, { nom, categorie, prixMensuelHt, enVente }) {
    const { rows } = await pool.query(
      `UPDATE offre
       SET nom = $2, categorie = $3, prix_mensuel_ht = $4, en_vente = COALESCE($5, en_vente)
       WHERE id = $1
       RETURNING *`,
      [id, nom, categorie, prixMensuelHt, enVente]
    );
    return rows[0] ? Catalogue.#fromRow(rows[0]) : null;
  }

  static async retirer(id) {
    const { rows } = await pool.query(
      "UPDATE offre SET en_vente = FALSE WHERE id = $1 RETURNING *",
      [id]
    );
    return rows[0] ? Catalogue.#fromRow(rows[0]) : null;
  }
}

module.exports = Catalogue;
