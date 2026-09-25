const mongoose = require("mongoose");

const readingSessionSchema = new mongoose.Schema(
    {
        usuarioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        iniciadaEm: {
            type: Date,
            default: Date.now
        },

        ultimaAtividadeEm: {
            type: Date,
            default: Date.now
        },

        tempoAtivoSegundos: {
            type: Number,
            default: 0
        },

        ativa: {
            type: Boolean,
            default: true
        },

              pausada: {
            type: Boolean,
            default: false
        },

        encerradaEm: {
            type: Date,
            default: null
        }
    },
    {
        versionKey: false
    }
);

module.exports = mongoose.model(
    "ReadingSession",
    readingSessionSchema
);