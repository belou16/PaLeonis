const Catalogue = require("./catalogue.model");

const today = () => new Date().toISOString().slice(0, 10);

const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

class Abonnement {
  #id;
  #clientId;
  #offreId;
  #serveurId;
  #dateDebut;
  #dateFin;
  #statut;
  #prixApplique;

  constructor(
    id,
    clientId,
    offreId,
    serveurId,
    dateDebut,
    dateFin,
    statut,
    prixApplique,
  ) {
    this.#id = id;
    this.#clientId = clientId;
    this.#offreId = offreId;
    this.#serveurId = serveurId;
    this.#dateDebut = dateDebut;
    this.#dateFin = dateFin;
    this.#statut = statut;
    this.#prixApplique = prixApplique;
  }

  get id() {
    return this.#id;
  }

  get clientId() {
    return this.#clientId;
  }

  get offreId() {
    return this.#offreId;
  }

  get serveurId() {
    return this.#serveurId;
  }

  get dateDebut() {
    return this.#dateDebut;
  }

  get dateFin() {
    return this.#dateFin;
  }

  get statut() {
    return this.#statut;
  }

  get prixApplique() {
    return this.#prixApplique;
  }

  toJSON() {
    return {
      id: this.#id,
      client_id: this.#clientId,
      offre_id: this.#offreId,
      serveur_id: this.#serveurId,
      date_debut: this.#dateDebut,
      date_fin: this.#dateFin,
      statut: this.#statut,
      prix_applique: this.#prixApplique,
    };
  }

  static #data = [
    new Abonnement(1, 1, 1, 1, "2026-01-15", null, "ACTIF", 9.99),
    new Abonnement(2, 2, 2, 2, "2026-03-01", null, "ACTIF", 19.99),
    new Abonnement(3, 1, 3, null, "2025-06-01", "2026-02-01", "RESILIE", 49.99),
  ];

  static findAll() {
    return Abonnement.#data;
  }

  static findById(id) {
    return (
      Abonnement.#data.find((abonnement) => abonnement.id === Number(id)) ??
      null
    );
  }

  static createOne(dto) {
    const { client_id, offre_id, serveur_id } = dto ?? {};

    if (!Number.isInteger(client_id) || client_id <= 0) {
      throw httpError(
        400,
        "client_id est obligatoire et doit être un entier positif.",
      );
    }
    if (!Number.isInteger(offre_id) || offre_id <= 0) {
      throw httpError(
        400,
        "offre_id est obligatoire et doit être un entier positif.",
      );
    }
    if (
      serveur_id != null &&
      (!Number.isInteger(serveur_id) || serveur_id <= 0)
    ) {
      throw httpError(400, "serveur_id doit être un entier positif.");
    }

    const offre = Catalogue.findById(offre_id);
    if (!offre) {
      throw httpError(404, "Offre introuvable.");
    }

    if (
      serveur_id != null &&
      Abonnement.#data.some((a) => a.serveurId === serveur_id)
    ) {
      throw httpError(409, "Ce serveur est déjà attribué à un abonnement.");
    }

    const nextId = Math.max(0, ...Abonnement.#data.map((a) => a.id)) + 1;
    const abonnement = new Abonnement(
      nextId,
      client_id,
      offre_id,
      serveur_id ?? null,
      today(),
      null,
      "ACTIF",
      offre.price,
    );
    Abonnement.#data.push(abonnement);
    return abonnement;
  }

  static resilier(id) {
    const abonnement = Abonnement.findById(id);
    if (!abonnement) {
      return null;
    }
    if (abonnement.#statut === "RESILIE") {
      throw httpError(409, "Abonnement déjà résilié.");
    }

    abonnement.#statut = "RESILIE";
    abonnement.#dateFin = today();
    abonnement.#serveurId = null;
    return abonnement;
  }
}

module.exports = Abonnement;
