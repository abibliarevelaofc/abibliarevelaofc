const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
    {
        usuarioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        tipo: {
    type: String,
    required: true,
    trim: true,
    enum: [
        "checkin",
        "biblia",
        "missao",
        "comunidade",
        "evento",
        "recompensa"
    ]
},

        descricao: {
            type: String,
            default: ""
        },

        xp: {
            type: Number,
            default: 0
        },

        pontos: {
            type: Number,
            default: 0
        },

        criadoEm: {
            type: Date,
            default: Date.now
        }
    },
    {
        versionKey: false
    }
);

module.exports = mongoose.model("Activity", activitySchema);