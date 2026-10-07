const express = require("express");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();

app.use(express.json());


// ==========================================
// TESTE DA API
// ==========================================

app.get("/api/curso/analytics", async (req, res) => {

    console.log("=================================");
    console.log("🔥 API DO CURSO FOI CHAMADA");
    console.log("=================================");

    try {

        console.log("1️⃣ MONGODB_URI EXISTE?",
            !!process.env.MONGODB_URI
        );

        if (!process.env.MONGODB_URI) {

            return res.status(500).json({
                sucesso: false,
                etapa: "ENV",
                erro: "MONGODB_URI não encontrada na Vercel"
            });

        }


        console.log("2️⃣ Tentando conectar no MongoDB...");

        await mongoose.connect(
            process.env.MONGODB_URI,
            {
                serverSelectionTimeoutMS: 10000
            }
        );


        console.log("3️⃣ MongoDB CONECTADO!");


        return res.status(200).json({

            sucesso: true,

            mensagem:
                "API funcionando e MongoDB conectado!",

            mongo:
                mongoose.connection.readyState

        });

    } catch (erro) {

        console.error("❌ ERRO REAL:");
        console.error(erro);

        return res.status(500).json({

            sucesso: false,

            etapa: "MONGODB",

            erro: erro.message,

            nome: erro.name

        });

    }

});


module.exports = app;