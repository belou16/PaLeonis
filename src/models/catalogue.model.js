const pool = require("../db");

const CATEGORIES = [
  "VPS",
  "HEBERGEMENT_MUTUALISE",
  "SERVEUR_DEDIE",
  "NOM_DE_DOMAINE",
];

const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

class Catalogue {
  #id;
  #nom;
  #categorie;
  #prixMensuelHt;
  #enVente;

  constructor(id, nom, categorie, prixMensuelHt, enVente) {
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
      prix_mensuel_ht: this.#prixMensuelHt,
      en_vente: this.#enVente,
    };
  }

  // STATIC
  static #fromRow(row) {
    return new Catalogue(
      row.id,
      row.nom,
      row.categorie,
      Number(row.prix_mensuel_ht),
      row.en_vente,
    );
  }

  static #validate({ nom, categorie, prix_mensuel_ht, en_vente }, partial) {
    if (!partial || nom !== undefined) {
      if (typeof nom !== "string" || nom.trim() === "") {
        throw httpError(400, "Le nom est obligatoire et doit être une chaîne non vide.");
      }
    }
    if (!partial || categorie !== undefined) {
      if (!CATEGORIES.includes(categorie)) {
        throw httpError(400, `La catégorie doit être l'une de : ${CATEGORIES.join(", ")}.`);
      }
    }
    if (!partial || prix_mensuel_ht !== undefined) {
      if (typeof prix_mensuel_ht !== "number" || !Number.isFinite(prix_mensuel_ht)) {
        throw httpError(400, "Le prix_mensuel_ht est obligatoire et doit être un nombre.");
      }
      if (prix_mensuel_ht < 0) {
        throw httpError(400, "Le prix ne peut pas être négatif.");
      }
    }
    if (en_vente !== undefined && typeof en_vente !== "boolean") {
      throw httpError(400, "en_vente doit être un booléen.");
    }
  }

  static async findAll(categorie, enVente) {
    if (categorie !== undefined && !CATEGORIES.includes(categorie)) {
      throw httpError(400, `La catégorie doit être l'une de : ${CATEGORIES.join(", ")}.`);
    }
    if (enVente !== undefined && !["true", "false"].includes(enVente)) {
      throw httpError(400, "en_vente doit valoir true ou false.");
    }
    const { rows } = await pool.query(
      `SELECT * FROM offre
       WHERE ($1::categorie_offre IS NULL OR categorie = $1)
         AND ($2::boolean IS NULL OR en_vente = $2)
       ORDER BY id`,
      [categorie ?? null, enVente ?? null],
    );
    return rows.map(Catalogue.#fromRow);
  }

  static async findById(id) {
    const { rows } = await pool.query("SELECT * FROM offre WHERE id = $1", [id]);
    return rows[0] ? Catalogue.#fromRow(rows[0]) : null;
  }

  static async createOne(dto) {
    const data = dto ?? {};
    Catalogue.#validate(data, false);
    const { rows } = await pool.query(
      `INSERT INTO offre (nom, categorie, prix_mensuel_ht, en_vente)
       VALUES ($1, $2, $3, COALESCE($4, TRUE))
       RETURNING *`,
      [data.nom.trim(), data.categorie, data.prix_mensuel_ht, data.en_vente ?? null],
    );
    return Catalogue.#fromRow(rows[0]);
  }

  static async updateOne(id, dto) {
    const data = dto ?? {};
    Catalogue.#validate(data, true);
    const { rows } = await pool.query(
      `UPDATE offre SET
         nom             = COALESCE($2, nom),
         categorie       = COALESCE($3::categorie_offre, categorie),
         prix_mensuel_ht = COALESCE($4, prix_mensuel_ht),
         en_vente        = COALESCE($5, en_vente)
       WHERE id = $1
       RETURNING *`,
      [
        id,
        data.nom?.trim() ?? null,
        data.categorie ?? null,
        data.prix_mensuel_ht ?? null,
        data.en_vente ?? null,
      ],
    );
    return rows[0] ? Catalogue.#fromRow(rows[0]) : null;
  }

  static async retirer(id) {
    const { rows } = await pool.query(
      "UPDATE offre SET en_vente = FALSE WHERE id = $1 RETURNING *",
      [id],
    );
    return rows[0] ? Catalogue.#fromRow(rows[0]) : null;
  }
}

module.exports = Catalogue;
