const pool = require("../db");

class Serveur {
  #id;
  #datacenterId;
  #nomHote;
  #adresseIp;
  #statut;
  #dateMiseEnService;
  #attribue;

  static #SELECT = `
    SELECT s.*, a.id IS NOT NULL AS attribue
    FROM serveur s
    LEFT JOIN abonnement a ON a.serveur_id = s.id`;

  constructor(id, datacenterId, nomHote, adresseIp, statut, dateMiseEnService, attribue) {
    this.#id = id;
    this.#datacenterId = datacenterId;
    this.#nomHote = nomHote;
    this.#adresseIp = adresseIp;
    this.#statut = statut;
    this.#dateMiseEnService = dateMiseEnService;
    this.#attribue = attribue;
  }

  get id() {
    return this.#id;
  }

  get datacenterId() {
    return this.#datacenterId;
  }

  set datacenterId(datacenterId) {
    this.#datacenterId = datacenterId;
  }

  get nomHote() {
    return this.#nomHote;
  }

  set nomHote(nomHote) {
    this.#nomHote = nomHote;
  }

  get adresseIp() {
    return this.#adresseIp;
  }

  set adresseIp(adresseIp) {
    this.#adresseIp = adresseIp;
  }

  get statut() {
    return this.#statut;
  }

  set statut(statut) {
    this.#statut = statut;
  }

  get dateMiseEnService() {
    return this.#dateMiseEnService;
  }

  set dateMiseEnService(dateMiseEnService) {
    this.#dateMiseEnService = dateMiseEnService;
  }

  get attribue() {
    return this.#attribue;
  }

  set attribue(attribue) {
    this.#attribue = attribue;
  }

  toJSON() {
    return {
      id: this.#id,
      datacenterId: this.#datacenterId,
      nomHote: this.#nomHote,
      adresseIp: this.#adresseIp,
      statut: this.#statut,
      dateMiseEnService: this.#dateMiseEnService,
      attribue: this.#attribue,
    };
  }

  static #fromRow(row) {
    return new Serveur(
      row.id,
      row.datacenter_id,
      row.nom_hote,
      row.adresse_ip,
      row.statut,
      row.date_mise_en_service,
      row.attribue
    );
  }

  static async findAll(datacenter, statut, attribue) {
    const { rows } = await pool.query(
      `${Serveur.#SELECT}
       WHERE ($1::int IS NULL OR s.datacenter_id = $1)
         AND ($2::statut_serveur IS NULL OR s.statut = $2)
         AND ($3::boolean IS NULL OR (a.id IS NOT NULL) = $3)
       ORDER BY s.id`,
      [datacenter, statut, attribue]
    );
    return rows.map(Serveur.#fromRow);
  }

  static async findById(id) {
    const { rows } = await pool.query(`${Serveur.#SELECT} WHERE s.id = $1`, [id]);
    return rows[0] ? Serveur.#fromRow(rows[0]) : null;
  }

  static async deleteOne(id) {
    const { rowCount } = await pool.query("DELETE FROM serveur WHERE id = $1", [id]);
    return rowCount > 0;
  }
}

module.exports = Serveur;
