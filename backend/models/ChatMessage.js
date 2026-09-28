const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema(
    {
        usuarioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        nome: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50
        },

        foto: {
            type: String,
            default: ""
        },

        texto: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "ChatMessage",
    ChatMessageSchema
);
