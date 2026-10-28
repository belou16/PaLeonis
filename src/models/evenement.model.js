const { Schema, model } = require("mongoose");

const TYPES = ["REDEMARRAGE", "ALERTE", "MAINTENANCE", "METRIQUE"];
const NIVEAUX = ["INFO", "AVERTISSEMENT", "CRITIQUE"];
const QUATRE_VINGT_DIX_JOURS = 90 * 24 * 60 * 60;

const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

// Journal en écriture seule : pas de updatedAt, un schéma par type (discriminators).
const evenementSchema = new Schema(
  {
    serveurId: { type: Number, required: true }, // id PostgreSQL du serveur
    date: { type: Date, default: Date.now },
  },
  {
    discriminatorKey: "type",
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

// Lecture du plus récent au plus ancien, serveur par serveur.
evenementSchema.index({ serveurId: 1, date: -1 });
// Les relevés de métriques expirent tout seuls au bout de 90 jours.
evenementSchema.index(
  { date: 1 },
  { expireAfterSeconds: QUATRE_VINGT_DIX_JOURS, partialFilterExpression: { type: "METRIQUE" } },
);

const Evenement = model("Evenement", evenementSchema, "evenements");

Evenement.discriminator(
  "REDEMARRAGE",
  new Schema({
    motif: { type: String, required: true, trim: true, maxlength: 300 },
    planifie: { type: Boolean, default: false },
    dureeSecondes: { type: Number, min: 0 },
  }),
);

Evenement.discriminator(
  "ALERTE",
  new Schema({
    niveau: { type: String, enum: NIVEAUX, required: true },
    message: { type: String, required: true, trim: true, maxlength: 500 },
  }),
);

Evenement.discriminator(
  "MAINTENANCE",
  new Schema({
    technicienId: { type: Number }, // id PostgreSQL du technicien
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    dureeMinutes: { type: Number, min: 0 },
  }),
);

const pourcentage = { type: Number, required: true, min: 0, max: 100 };
Evenement.discriminator(
  "METRIQUE",
  new Schema({ cpu: pourcentage, ram: pourcentage, disque: pourcentage }),
);

const parseDate = (value, nom) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw httpError(400, `${nom} n'est pas une date valide.`);
  return date;
};

Evenement.enregistrer = async (serveurId, dto) => {
  const { _id, createdAt, ...data } = dto ?? {};
  if (!TYPES.includes(data.type)) {
    throw httpError(422, `Le type doit être l'un de : ${TYPES.join(", ")}.`);
  }
  return Evenement.discriminators[data.type].create({ ...data, serveurId });
};

Evenement.lister = async (serveurId, { type, debut, fin, limite }) => {
  const filtre = { serveurId };
  if (type !== undefined) {
    if (!TYPES.includes(type)) {
      throw httpError(400, `Le type doit être l'un de : ${TYPES.join(", ")}.`);
    }
    filtre.type = type;
  }
  if (debut !== undefined || fin !== undefined) {
    filtre.date = {};
    if (debut !== undefined) filtre.date.$gte = parseDate(debut, "debut");
    if (fin !== undefined) filtre.date.$lte = parseDate(fin, "fin");
  }
  const max = limite === undefined ? 50 : Number(limite);
  if (!Number.isInteger(max) || max < 1 || max > 500) {
    throw httpError(400, "limite doit être un entier entre 1 et 500.");
  }
  return Evenement.find(filtre).sort({ date: -1 }).limit(max);
};

// Nombre d'événements par type, calculé par MongoDB.
Evenement.statistiques = (serveurId) =>
  Evenement.aggregate([
    { $match: { serveurId } },
    { $group: { _id: "$type", total: { $sum: 1 }, dernier: { $max: "$date" } } },
    { $project: { _id: 0, type: "$_id", total: 1, dernier: 1 } },
    { $sort: { total: -1 } },
  ]);

// Nombre d'alertes par jour et par serveur sur les 7 derniers jours, en un seul pipeline.
Evenement.alertesParJour = () =>
  Evenement.aggregate([
    {
      $match: {
        type: "ALERTE",
        date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    },
    {
      $group: {
        _id: {
          serveurId: "$serveurId",
          jour: { $dateToString: { format: "%Y-%m-%d", date: "$date", timezone: "Europe/Paris" } },
        },
        total: { $sum: 1 },
      },
    },
    { $project: { _id: 0, serveurId: "$_id.serveurId", jour: "$_id.jour", total: 1 } },
    { $sort: { jour: -1, serveurId: 1 } },
  ]);

Evenement.TYPES = TYPES;

module.exports = Evenement;
