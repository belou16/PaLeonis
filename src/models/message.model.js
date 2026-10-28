const { Schema, model } = require("mongoose");

// Messages référencés : un document par message, rattaché au ticket PostgreSQL par ticketId.
const messageSchema = new Schema(
  {
    ticketId: { type: Number, required: true }, // id PostgreSQL du ticket
    auteur: {
      type: { type: String, enum: ["CLIENT", "TECHNICIEN"], required: true },
      id: { type: Number, required: true }, // id PostgreSQL du client ou du technicien
    },
    contenu: { type: String, required: true, trim: true, maxlength: 5000 },
    piecesJointes: [
      {
        _id: false,
        nom: { type: String, required: true, trim: true },
        url: { type: String, required: true, match: /^https?:\/\/\S+$/ },
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

// Le fil se lit en entier, dans l'ordre chronologique.
messageSchema.index({ ticketId: 1, createdAt: 1 });

const Message = model("Message", messageSchema, "messages");

Message.filDuTicket = (ticketId) => Message.find({ ticketId }).sort({ createdAt: 1 });

module.exports = Message;
