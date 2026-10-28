const { Schema, model } = require("mongoose");

// Une seule collection, un schéma par catégorie d'offre (discriminators).
const ficheSchema = new Schema(
  {
    offreId: { type: Number, required: true, unique: true }, // id PostgreSQL de l'offre
    // Caractéristiques libres : le commercial peut en ajouter sans migration.
    caracteristiques: { type: Schema.Types.Mixed, default: {} },
  },
  { discriminatorKey: "categorie", timestamps: true, versionKey: false },
);

ficheSchema.index({ "$**": "text" });

const FicheTechnique = model("FicheTechnique", ficheSchema, "fiches_techniques");

FicheTechnique.discriminator(
  "VPS",
  new Schema({
    vcpu: { type: Number, required: true, min: 1 },
    ramGo: { type: Number, required: true, min: 1 },
    stockageGo: { type: Number, required: true, min: 1 },
    typeStockage: { type: String, enum: ["HDD", "SSD", "NVMe"], default: "SSD" },
    systeme: { type: String, required: true, trim: true },
  }),
);

FicheTechnique.discriminator(
  "HEBERGEMENT_MUTUALISE",
  new Schema({
    espaceDisqueGo: { type: Number, required: true, min: 1 },
    nbSitesMax: { type: Number, required: true, min: 1 },
    nbBasesDonnees: { type: Number, min: 0, default: 1 },
    certificatSsl: { type: Boolean, default: true },
  }),
);

FicheTechnique.discriminator(
  "SERVEUR_DEDIE",
  new Schema({
    processeur: { type: String, required: true, trim: true },
    ramGo: { type: Number, required: true, min: 1 },
    disques: {
      type: [
        {
          _id: false,
          type: { type: String, enum: ["HDD", "SSD", "NVMe"], required: true },
          capaciteGo: { type: Number, required: true, min: 1 },
        },
      ],
      validate: [(disques) => disques.length > 0, "Au moins un disque est obligatoire."],
    },
    bandePassanteMbps: { type: Number, required: true, min: 1 },
  }),
);

FicheTechnique.discriminator(
  "NOM_DE_DOMAINE",
  new Schema({
    extension: { type: String, required: true, match: /^\.[a-z0-9.-]+$/ },
    registrar: { type: String, required: true, trim: true },
    dureeEngagementMois: { type: Number, required: true, min: 1 },
  }),
);

FicheTechnique.findByOffre = (offreId) => FicheTechnique.findOne({ offreId });

// Remplace (ou crée) la fiche d'une offre. La catégorie vient de PostgreSQL.
FicheTechnique.remplacer = async (offreId, categorie, dto) => {
  const { _id, createdAt, updatedAt, ...data } = dto ?? {};
  const Fiche = FicheTechnique.discriminators[categorie];
  const fiche = new Fiche({ ...data, offreId, categorie });
  await fiche.validate();
  const { deletedCount } = await FicheTechnique.deleteOne({ offreId });
  await fiche.save();
  return { fiche, creee: deletedCount === 0 };
};

FicheTechnique.rechercher = async (texte) => {
  const fiches = await FicheTechnique.find({ $text: { $search: texte } }, { offreId: 1 });
  return fiches.map((fiche) => fiche.offreId);
};

module.exports = FicheTechnique;
