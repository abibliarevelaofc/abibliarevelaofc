const mongoose = require("mongoose");

const courseAnalyticsSchema = new mongoose.Schema(
    {
        tipo: {
            type: String,
            required: true,
            enum: [
                "acesso",
                "compra",
                "video_inicio",
                "video_tempo"
            ]
        },

        tempoAssistido: {
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

module.exports = mongoose.model(
    "CourseAnalytics",
    courseAnalyticsSchema
);