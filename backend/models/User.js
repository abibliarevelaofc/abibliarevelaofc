const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        nome: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        senha: {
            type: String,
            required: true
        },

        foto: {
            type: String,
            default: ""
        },

        pontos: {
            type: Number,
            default: 0
        },

        xp: {
            type: Number,
            default: 0
        },

        nivel: {
            type: Number,
            default: 1
        },

        diasLogados: {
            type: Number,
            default: 0
        },

        ultimoCheckin: {
            type: Date,
            default: null
        },

        // =====================================================
        // CICLO DE CHECK-IN
        // =====================================================
        // Guarda o dia atual do ciclo de 7 dias.
        //
        // 0 = ciclo acabou / próximo será Dia 1
        // 1 = Dia 1 concluído
        // 2 = Dia 2 concluído
        // ...
        // 6 = Dia 6 concluído
        //
        // Depois do Dia 7 volta para 0.
        // =====================================================

        checkinDia: {
            type: Number,
            default: 0
        },

        capitulosBibliaLidos: {
            type: Number,
            default: 0
        },

        capitulosBiblia: {
            type: [String],
            default: []
        },

        destaquesBiblia: {
            type: [
                {
                    capitulo: {
                        type: String,
                        required: true
                    },

                    versiculo: {
                        type: Number,
                        required: true
                    },

                    cor: {
                        type: String,
                        required: true
                    }
                }
            ],
            default: []
        },

        missoesConcluidas: {
            type: Number,
            default: 0
        },

        missoesBiblia: {
            nivel1: {
                type: Boolean,
                default: false
            },

            nivel2: {
                type: Boolean,
                default: false
            },

            nivel3: {
                type: Boolean,
                default: false
            }
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

module.exports = mongoose.model("User", userSchema);