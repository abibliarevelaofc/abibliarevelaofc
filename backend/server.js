const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const Activity = require("./models/Activity");
const ReadingSession = require("./models/ReadingSession");
const ChatMessage = require("./models/ChatMessage");
const CourseAnalytics = require("./models/CourseAnalytics");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// =====================================================
// ANALYTICS — CURSO CRIADOR PRO
// =====================================================

app.post("/api/curso/analytics", async (req, res) => {

    try {

        await conectarMongoDB();

        const { tipo, tempoAssistido } = req.body;

        const tiposPermitidos = [
            "acesso",
            "compra",
            "video_inicio",
            "video_tempo"
        ];

        if (!tiposPermitidos.includes(tipo)) {

            return res.status(400).json({
                sucesso: false,
                mensagem: "Tipo de evento inválido."
            });

        }

        const registro = await CourseAnalytics.create({

            tipo,

            tempoAssistido:
                Number(tempoAssistido) || 0

        });

        return res.status(201).json({

            sucesso: true,
            id: registro._id

        });

    } catch (erro) {

        console.error(
            "ERRO AO REGISTRAR ANALYTICS DO CURSO:"
        );

        console.error(erro);

        return res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao registrar evento.",

            erro:
                process.env.NODE_ENV === "production"
                    ? undefined
                    : erro.message

        });

    }

});

// =====================================================
// ANALYTICS — DADOS DO CURSO
// =====================================================

app.get("/api/curso/analytics", async (req, res) => {

    try {

        await conectarMongoDB();

        const resultados =
            await CourseAnalytics.aggregate([

                {
                    $group: {

                        _id: "$tipo",

                        total: {
                            $sum: 1
                        },

                        tempo: {
                            $sum: "$tempoAssistido"
                        }

                    }
                }

            ]);

        const dados = {

            acessos: 0,

            compras: 0,

            videoInicio: 0,

            tempoAssistido: 0

        };

        resultados.forEach(item => {

            if (item._id === "acesso") {

                dados.acessos =
                    item.total;

            }

            if (item._id === "compra") {

                dados.compras =
                    item.total;

            }

            if (item._id === "video_inicio") {

                dados.videoInicio =
                    item.total;

            }

            if (item._id === "video_tempo") {

                dados.tempoAssistido =
                    item.tempo;

            }

        });

        return res.status(200).json({

            sucesso: true,

            dados

        });

    } catch (erro) {

        console.error(
            "ERRO AO BUSCAR ANALYTICS DO CURSO:"
        );

        console.error(erro);

        return res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao buscar analytics.",

            erro:
                process.env.NODE_ENV === "production"
                    ? undefined
                    : erro.message

        });

    }

});

// =====================================================
// SISTEMA DE NÍVEL — XP
// =====================================================

function calcularProgressoNivel(xp) {

    const NIVEL_MAXIMO = 100;

    // XP acumulado necessário para chegar em cada nível.
    // O nível 1 começa com 0 XP.
    const xpTotalParaNivel = (nivel) => {

        if (nivel <= 1) {
            return 0;
        }

        return Math.floor(
            50 * Math.pow(nivel - 1, 1.55)
        );
    };

    // =========================================
    // NÍVEL MÁXIMO
    // =========================================

    if (xp >= xpTotalParaNivel(NIVEL_MAXIMO)) {
        return {
            nivel: NIVEL_MAXIMO,
            xpNoNivel: xpTotalParaNivel(NIVEL_MAXIMO),
            xpNecessario: 0,
            progressoNivel: 100
        };
    }

    // =========================================
    // DESCOBRIR NÍVEL ATUAL
    // =========================================

    let nivel = 1;

    while (
        nivel < NIVEL_MAXIMO &&
        xp >= xpTotalParaNivel(nivel + 1)
    ) {
        nivel++;
    }

    // =========================================
    // PROGRESSO DO NÍVEL
    // =========================================

    const xpInicioNivel = xpTotalParaNivel(nivel);

    const xpProximoNivel =
        xpTotalParaNivel(nivel + 1);

    const xpNoNivel =
        xp - xpInicioNivel;

    const xpNecessario =
        xpProximoNivel - xpInicioNivel;

    const progressoNivel = Math.min(
        Math.max(
            Math.floor(
                (xpNoNivel / xpNecessario) * 100
            ),
            0
        ),
        100
    );

    return {
        nivel,
        xpNoNivel,
        xpNecessario,
        progressoNivel
    };
}

async function adicionarRecompensa(
    usuario,
    xpGanho = 0,
    pontosGanhos = 0,
    tipo = "recompensa",
    descricao = "Recompensa recebida"
) {

    // =========================================
    // ADICIONA XP
    // =========================================

    usuario.xp = (usuario.xp || 0) + xpGanho;

    // =========================================
    // ADICIONA PONTOS
    // =========================================

    usuario.pontos = (usuario.pontos || 0) + pontosGanhos;

    // =========================================
    // RECALCULA O NÍVEL
    // =========================================

    const progresso = calcularProgressoNivel(usuario.xp);

    usuario.nivel = progresso.nivel;

    // =========================================
    // REGISTRA A ATIVIDADE
    // =========================================

    await Activity.create({
    usuarioId: usuario._id,
    tipo,
    descricao,
    xp: xpGanho,
    pontos: pontosGanhos
});

    return progresso;
}

/* =========================================
   CONEXÃO COM MONGODB
========================================= */
/* =====================================================
   CONEXÃO MONGODB
   COMPATÍVEL COM VERCEL / SERVERLESS
===================================================== */

let mongoConectando = null;

async function conectarMongoDB() {

    console.log("=== TESTE MONGODB ===");

    console.log(
        "MONGODB_URI existe:",
        !!process.env.MONGODB_URI
    );

    console.log(
        "Estado Mongo:",
        mongoose.connection.readyState
    );

    if (!process.env.MONGODB_URI) {

        throw new Error(
            "MONGODB_URI NÃO EXISTE NA VERCEL"
        );

    }

    if (mongoose.connection.readyState === 1) {

        console.log(
            "MongoDB já está conectado."
        );

        return;

    }

    if (!mongoConectando) {

        console.log(
            "Tentando conectar ao MongoDB..."
        );

        mongoConectando = mongoose.connect(
            process.env.MONGODB_URI,
            {
                serverSelectionTimeoutMS: 10000
            }
        );

    }

    try {

        await mongoConectando;

        console.log(
            "MongoDB conectado com sucesso!"
        );

    } catch (erro) {

        mongoConectando = null;

        console.error(
            "ERRO REAL DO MONGODB:"
        );

        console.error(
            erro
        );

        throw erro;

    }

}
/* =========================================
   CADASTRO DE USUÁRIO
========================================= */

app.post("/api/users/register", async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Nome, email e senha são obrigatórios."
            });
        }

        if (senha.length < 6) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "A senha precisa ter pelo menos 6 caracteres."
            });
        }

        const emailNormalizado = email.toLowerCase().trim();

        const usuarioExistente = await User.findOne({
            email: emailNormalizado
        });

        if (usuarioExistente) {
            return res.status(409).json({
                sucesso: false,
                mensagem: "Este email já está cadastrado."
            });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

const usuario = await User.create({
    nome: nome.trim(),
    email: emailNormalizado,
    senha: senhaHash
});

const token = jwt.sign(
    { id: usuario._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
);

        return res.status(201).json({
            sucesso: true,
            mensagem: "Usuário cadastrado com sucesso!",
            token,
            usuario: {
                id: usuario._id,
                nome: usuario.nome,
                email: usuario.email,
                foto: usuario.foto,
                pontos: usuario.pontos,
                nivel: usuario.nivel,
                diasLogados: usuario.diasLogados,
                capitulosBibliaLidos: usuario.capitulosBibliaLidos,
                missoesConcluidas: usuario.missoesConcluidas,
                criadoEm: usuario.criadoEm
            }
        });
  
    } catch (error) {
        console.error("ERRO AO CADASTRAR USUARIO:");
        console.error(error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao cadastrar usuário.",
            erro: error.message
        });
    }
});


/* =========================================
   LOGIN DE USUÁRIO
========================================= */

app.post("/api/users/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Email e senha são obrigatórios."
            });
        }

        const emailNormalizado = email.toLowerCase().trim();

        const usuario = await User.findOne({
            email: emailNormalizado
        });

        if (!usuario) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Email ou senha incorretos."
            });
        }

        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senha
        );

        if (!senhaCorreta) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Email ou senha incorretos."
            });
        }

const token = jwt.sign(
    {
        id: usuario._id.toString()
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "7d"
    }
);

  return res.status(200).json({
    sucesso: true,
    mensagem: "Login realizado com sucesso!",
    token,
    usuario: {
                id: usuario._id,
                nome: usuario.nome,
                email: usuario.email,
                foto: usuario.foto,
                pontos: usuario.pontos,
                nivel: usuario.nivel,
                diasLogados: usuario.diasLogados,
                ultimoCheckin: usuario.ultimoCheckin,
                capitulosBibliaLidos: usuario.capitulosBibliaLidos,
                missoesConcluidas: usuario.missoesConcluidas,
                criadoEm: usuario.criadoEm
            }
        });

    } catch (error) {
        console.error("ERRO AO FAZER LOGIN:");
        console.error(error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao realizar login.",
            erro: error.message
        });
    }
});

// =====================================================
// MIDDLEWARE — AUTENTICAÇÃO JWT
// =====================================================

const autenticarToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                sucesso: false,
                mensagem: "Token não informado."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.usuarioId = decoded.id;

        next();

    } catch (error) {
        return res.status(401).json({
            sucesso: false,
            mensagem: "Token inválido ou expirado."
        });
    }
};


// =====================================================
// USUÁRIO LOGADO
// =====================================================

app.get("/api/users/me", autenticarToken, async (req, res) => {

    try {

        const usuario =
            await User.findById(req.usuarioId);

        if (!usuario) {

            return res.status(404).json({
                sucesso: false,
                mensagem: "Usuário não encontrado."
            });

        }

        const progresso =
            calcularProgressoNivel(
                usuario.xp || 0
            );

        return res.status(200).json({

            sucesso: true,

            usuario: {

                id: usuario._id,

                nome: usuario.nome,

                email: usuario.email,

                foto: usuario.foto || "",

                xp: usuario.xp || 0,

                nivel: progresso.nivel,

                xpNoNivel:
                    progresso.xpNoNivel,

                xpNecessario:
                    progresso.xpNecessario,

                progressoNivel:
                    progresso.progressoNivel,

                pontos:
                    usuario.pontos || 0,

                diasLogados:
                    usuario.diasLogados || 0,

                ultimoCheckin:
                    usuario.ultimoCheckin,

                /*
                 * DIA ATUAL DA SEQUÊNCIA
                 *
                 * 0 = nenhum check-in
                 * 1 = Dia 1 concluído
                 * 2 = Dia 2 concluído
                 * ...
                 * 6 = Dia 6 concluído
                 * 0 novamente após concluir o Dia 7
                 */
                checkinDia:
                    usuario.checkinDia || 0,

                capitulosBibliaLidos:
                    usuario.capitulosBibliaLidos || 0,

                missoesConcluidas:
                    usuario.missoesConcluidas || 0,

                criadoEm:
                    usuario.criadoEm

            }

        });

    } catch (error) {

        console.error(
            "ERRO AO BUSCAR USUÁRIO:"
        );

        console.error(error);

        return res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao carregar dados do usuário."

        });

    }

});

app.get("/api/users/me/activities", autenticarToken, async (req, res) => {
    try {

        const atividades = await Activity
            .find({
                usuarioId: req.usuarioId
            })
            .sort({
                criadoEm: -1
            });

        return res.status(200).json({
            sucesso: true,
            atividades
        });

    } catch (error) {

        console.error("ERRO AO BUSCAR ATIVIDADES:");
        console.error(error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao buscar atividades."
        });
    }
});


app.put("/api/users/me", autenticarToken, async (req, res) => {
    try {
        const { nome, foto } = req.body;

        const usuario = await User.findById(req.usuarioId);

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Usuário não encontrado."
            });
        }

        if (nome !== undefined) {
            if (!nome.trim()) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "O nome não pode ficar vazio."
                });
            }

            usuario.nome = nome.trim();
        }

        if (foto !== undefined) {
            usuario.foto = foto;
        }

        await usuario.save();

        return res.status(200).json({
            sucesso: true,
            mensagem: "Perfil atualizado com sucesso!",
            usuario: {
                id: usuario._id,
                nome: usuario.nome,
                email: usuario.email,
                foto: usuario.foto,
                pontos: usuario.pontos,
                nivel: usuario.nivel,
                diasLogados: usuario.diasLogados,
                ultimoCheckin: usuario.ultimoCheckin,
                capitulosBibliaLidos: usuario.capitulosBibliaLidos,
                missoesConcluidas: usuario.missoesConcluidas,
                criadoEm: usuario.criadoEm
            }
        });

    } catch (error) {

        console.error("ERRO AO ATUALIZAR PERFIL:");
        console.error(error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao atualizar perfil."
        });
    }
});

app.post("/api/users/checkin", autenticarToken, async (req, res) => {

    try {

        const usuario =
            await User.findById(req.usuarioId);


        if (!usuario) {

            return res.status(404).json({
                sucesso: false,
                mensagem: "Usuário não encontrado."
            });

        }


        const agora = new Date();


        // =====================================================
        // VERIFICAR SE JÁ FEZ CHECK-IN HOJE
        // =====================================================

        if (usuario.ultimoCheckin) {

            const ultimo =
                new Date(usuario.ultimoCheckin);


            const mesmoDia =
                ultimo.getFullYear() === agora.getFullYear() &&
                ultimo.getMonth() === agora.getMonth() &&
                ultimo.getDate() === agora.getDate();


            if (mesmoDia) {

                return res.status(200).json({

                    sucesso: true,

                    jaFezHoje: true,

                    mensagem:
                        "Você já fez seu check-in hoje!",

                    usuario: {

                        id: usuario._id,

                        nome: usuario.nome,

                        xp: usuario.xp || 0,

                        pontos: usuario.pontos || 0,

                        nivel: usuario.nivel,

                        diasLogados:
                            usuario.diasLogados || 0,

                        ultimoCheckin:
                            usuario.ultimoCheckin,

                        checkinDia:
                            usuario.checkinDia || 0

                    }

                });

            }

        }


        // =====================================================
        // DESCOBRIR O DIA DO CICLO
        // =====================================================

        let sequenciaAtual = 1;


        if (usuario.ultimoCheckin) {

            const ultimo =
                new Date(usuario.ultimoCheckin);


            const inicioHoje =
                new Date(
                    agora.getFullYear(),
                    agora.getMonth(),
                    agora.getDate()
                );


            const inicioUltimo =
                new Date(
                    ultimo.getFullYear(),
                    ultimo.getMonth(),
                    ultimo.getDate()
                );


            const diferencaMilissegundos =
                inicioHoje.getTime() -
                inicioUltimo.getTime();


            const diferencaDias =
                Math.floor(
                    diferencaMilissegundos /
                    (1000 * 60 * 60 * 24)
                );


            // =================================================
            // DIA SEGUINTE
            // =================================================

            if (diferencaDias === 1) {

                sequenciaAtual =
                    (usuario.checkinDia || 0) + 1;


                // =================================================
                // NOVO CICLO APÓS DIA 7
                // =================================================

                if (sequenciaAtual > 7) {

                    sequenciaAtual = 1;

                }

            }

            // =================================================
            // PERDEU A SEQUÊNCIA
            // =================================================

            else {

                sequenciaAtual = 1;

            }

        }


        // =====================================================
        // RECOMPENSAS
        // =====================================================

        const recompensasCheckin = {

            1: {
                pontos: 5,
                xp: 10
            },

            2: {
                pontos: 15,
                xp: 20
            },

            3: {
                pontos: 20,
                xp: 30
            },

            4: {
                pontos: 35,
                xp: 40
            },

            5: {
                pontos: 35,
                xp: 50
            },

            6: {
                pontos: 50,
                xp: 60
            },

            7: {
                pontos: 70,
                xp: 70
            }

        };


        const recompensa =
            recompensasCheckin[
                sequenciaAtual
            ];


        // =====================================================
        // DAR XP + PONTOS
        // =====================================================

        const progresso =
            await adicionarRecompensa(
                usuario,

                recompensa.xp,

                recompensa.pontos,

                "checkin",

                `Check-in diário — Dia ${sequenciaAtual}`
            );


        // =====================================================
        // ATUALIZAR DADOS
        // =====================================================

        usuario.diasLogados =
            (usuario.diasLogados || 0) + 1;


        usuario.ultimoCheckin =
            agora;


        // =====================================================
        // DIA 7 → FINALIZA CICLO
        // =====================================================

        if (sequenciaAtual === 7) {

            usuario.checkinDia = 0;

        } else {

            usuario.checkinDia =
                sequenciaAtual;

        }


        await usuario.save();


        // =====================================================
        // RESPOSTA
        // =====================================================

        return res.status(200).json({

            sucesso: true,

            jaFezHoje: false,

            diaCheckin:
                sequenciaAtual,

            proximoDia:
                sequenciaAtual === 7
                    ? 1
                    : sequenciaAtual + 1,

            recompensa: {

                pontos:
                    recompensa.pontos,

                xp:
                    recompensa.xp

            },

            mensagem:
                `Check-in do Dia ${sequenciaAtual} realizado! +${recompensa.pontos} pontos e +${recompensa.xp} XP.`,

            usuario: {

                id: usuario._id,

                nome: usuario.nome,

                xp: usuario.xp,

                pontos: usuario.pontos,

                nivel: usuario.nivel,

                diasLogados:
                    usuario.diasLogados,

                ultimoCheckin:
                    usuario.ultimoCheckin,

                checkinDia:
                    usuario.checkinDia,

                xpNoNivel:
                    progresso.xpNoNivel,

                xpNecessario:
                    progresso.xpNecessario,

                progressoNivel:
                    progresso.progressoNivel

            }

        });


    } catch (error) {

        console.error(
            "ERRO AO REALIZAR CHECK-IN:"
        );

        console.error(error);


        return res.status(500).json({

            sucesso: false,

            mensagem:
                "Erro ao realizar check-in."

        });

    }

});


async function verificarRecompensasBiblia(usuario) {

    // =====================================================
    // CALCULA O TEMPO TOTAL DE LEITURA
    // =====================================================

    const resultado = await ReadingSession.aggregate([
        {
            $match: {
                usuarioId: new mongoose.Types.ObjectId(usuario._id)
            }
        },
        {
            $group: {
                _id: null,
                tempoTotalSegundos: {
                    $sum: "$tempoAtivoSegundos"
                }
            }
        }
    ]);

    const tempoTotalSegundos =
        resultado.length > 0
            ? resultado[0].tempoTotalSegundos
            : 0;

    // =====================================================
    // MISSÃO 1 — 10 MINUTOS
    // =====================================================

    if (
        tempoTotalSegundos >= 10 * 60 &&
        !usuario.missoesBiblia.nivel1
    ) {

        await adicionarRecompensa(
            usuario,
            0,
            15,
            "biblia",
            "Missão Bíblia nível 1 — 10 minutos de leitura"
        );

        usuario.missoesBiblia.nivel1 = true;
        usuario.missoesConcluidas =
            (usuario.missoesConcluidas || 0) + 1;
    }

    // =====================================================
    // MISSÃO 2 — 30 MINUTOS
    // =====================================================

    if (
        tempoTotalSegundos >= 30 * 60 &&
        !usuario.missoesBiblia.nivel2
    ) {

        await adicionarRecompensa(
            usuario,
            0,
            35,
            "biblia",
            "Missão Bíblia nível 2 — 30 minutos de leitura"
        );

        usuario.missoesBiblia.nivel2 = true;
        usuario.missoesConcluidas =
            (usuario.missoesConcluidas || 0) + 1;
    }

    // =====================================================
    // MISSÃO 3 — 60 MINUTOS
    // =====================================================

    if (
        tempoTotalSegundos >= 60 * 60 &&
        !usuario.missoesBiblia.nivel3
    ) {

        await adicionarRecompensa(
            usuario,
            0,
            70,
            "biblia",
            "Missão Bíblia nível 3 — 60 minutos de leitura"
        );

        usuario.missoesBiblia.nivel3 = true;
        usuario.missoesConcluidas =
            (usuario.missoesConcluidas || 0) + 1;
    }

    return {
        tempoTotalSegundos,
        nivel1: usuario.missoesBiblia.nivel1,
        nivel2: usuario.missoesBiblia.nivel2,
        nivel3: usuario.missoesBiblia.nivel3
    };
}


app.post("/api/biblia/iniciar", autenticarToken, async (req, res) => {
    try {

        const usuario = await User.findById(req.usuarioId);

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Usuário não encontrado."
            });
        }

        // Verifica se já existe uma sessão ativa
        const sessaoExistente = await ReadingSession.findOne({
            usuarioId: req.usuarioId,
            ativa: true
        });

        if (sessaoExistente) {
            return res.status(200).json({
                sucesso: true,
                jaExistia: true,
                mensagem: "Sessão de leitura já está ativa.",
                sessao: {
                    id: sessaoExistente._id,
                    iniciadaEm: sessaoExistente.iniciadaEm,
                    ultimaAtividadeEm: sessaoExistente.ultimaAtividadeEm,
                    tempoAtivoSegundos: sessaoExistente.tempoAtivoSegundos
                }
            });
        }

        // Cria uma nova sessão
        const sessao = await ReadingSession.create({
            usuarioId: req.usuarioId,
            iniciadaEm: new Date(),
            ultimaAtividadeEm: new Date(),
            tempoAtivoSegundos: 0,
            ativa: true
        });

        return res.status(201).json({
            sucesso: true,
            jaExistia: false,
            mensagem: "Sessão de leitura iniciada.",
            sessao: {
                id: sessao._id,
                iniciadaEm: sessao.iniciadaEm,
                ultimaAtividadeEm: sessao.ultimaAtividadeEm,
                tempoAtivoSegundos: sessao.tempoAtivoSegundos
            }
        });

    } catch (error) {

        console.error("ERRO AO INICIAR LEITURA DA BÍBLIA:");
        console.error(error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao iniciar sessão de leitura."
        });
    }
});

app.post("/api/biblia/atividade", autenticarToken, async (req, res) => {
    try {

        const sessao = await ReadingSession.findOne({
            usuarioId: req.usuarioId,
            ativa: true
        });

        if (!sessao) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Nenhuma sessão de leitura ativa."
            });
        }

        // =========================================
        // NÃO CONTABILIZA TEMPO DURANTE A PAUSA
        // =========================================

        if (sessao.pausada) {
            return res.status(200).json({
                sucesso: true,
                pausada: true,
                mensagem: "Sessão está pausada. Nenhum tempo foi contabilizado.",
                tempoAtivoSegundos: sessao.tempoAtivoSegundos,
                tempoAtivoMinutos:
                    Math.floor(
                        sessao.tempoAtivoSegundos / 60
                    )
            });
        }

        const agora = new Date();

        const ultimaAtividade =
            new Date(sessao.ultimaAtividadeEm);

        // Calcula quantos segundos passaram
        let segundosPassados =
            Math.floor(
                (agora.getTime() - ultimaAtividade.getTime()) / 1000
            );

        // =========================================
        // PROTEÇÃO CONTRA INTERVALOS ABSURDOS
        // =========================================
        // Se o navegador ficar muito tempo sem enviar
        // atividade, não contabilizamos esse período inteiro.
        //
        // O frontend futuramente enviará sinais
        // frequentes enquanto o usuário estiver ativo.
        // =========================================

        if (segundosPassados < 0) {
            segundosPassados = 0;
        }

        if (segundosPassados > 30) {
            segundosPassados = 30;
        }

                sessao.tempoAtivoSegundos += segundosPassados;

        sessao.ultimaAtividadeEm = agora;

        await sessao.save();

        // =========================================
        // VERIFICA RECOMPENSAS DA BÍBLIA
        // =========================================

        const usuario = await User.findById(req.usuarioId);

        let recompensasBiblia = null;

        if (usuario) {

            recompensasBiblia =
                await verificarRecompensasBiblia(usuario);

            await usuario.save();
        }

                return res.status(200).json({
            sucesso: true,
            mensagem: "Atividade de leitura registrada.",
            tempoAtivoSegundos: sessao.tempoAtivoSegundos,
            tempoAtivoMinutos:
                Math.floor(
                    sessao.tempoAtivoSegundos / 60
                ),
            recompensasBiblia
        });

    } catch (error) {

        console.error("ERRO AO REGISTRAR ATIVIDADE DA BÍBLIA:");
        console.error(error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao registrar atividade de leitura."
        });
    }
});

app.post("/api/biblia/encerrar", autenticarToken, async (req, res) => {
    try {

        const sessao = await ReadingSession.findOne({
            usuarioId: req.usuarioId,
            ativa: true
        });

        if (!sessao) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Nenhuma sessão de leitura ativa."
            });
        }

        const agora = new Date();

        const ultimaAtividade =
            new Date(sessao.ultimaAtividadeEm);

        // Calcula o último intervalo de atividade
        let segundosPassados =
            Math.floor(
                (agora.getTime() - ultimaAtividade.getTime()) / 1000
            );

        if (segundosPassados < 0) {
            segundosPassados = 0;
        }

        if (segundosPassados > 30) {
            segundosPassados = 30;
        }

        sessao.tempoAtivoSegundos += segundosPassados;

        sessao.ultimaAtividadeEm = agora;

        sessao.ativa = false;

        sessao.encerradaEm = agora;

        await sessao.save();

        return res.status(200).json({
            sucesso: true,
            mensagem: "Sessão de leitura encerrada.",
            sessao: {
                id: sessao._id,
                tempoAtivoSegundos: sessao.tempoAtivoSegundos,
                tempoAtivoMinutos:
                    Math.floor(
                        sessao.tempoAtivoSegundos / 60
                    ),
                iniciadaEm: sessao.iniciadaEm,
                encerradaEm: sessao.encerradaEm
            }
        });

    } catch (error) {

        console.error("ERRO AO ENCERRAR LEITURA DA BÍBLIA:");
        console.error(error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao encerrar sessão de leitura."
        });
    }
});

app.post("/api/biblia/pausar", autenticarToken, async (req, res) => {
    try {

        const sessao = await ReadingSession.findOne({
            usuarioId: req.usuarioId,
            ativa: true
        });

        if (!sessao) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Nenhuma sessão de leitura ativa."
            });
        }

        // Se já estiver pausada, não faz nada
        if (sessao.pausada) {
            return res.status(200).json({
                sucesso: true,
                jaEstavaPausada: true,
                mensagem: "Sessão de leitura já está pausada.",
                tempoAtivoSegundos: sessao.tempoAtivoSegundos
            });
        }

        // =========================================
        // PAUSA IMEDIATA
        // =========================================
        // Não contabilizamos o tempo desde o último
        // heartbeat, porque a página acabou de ficar
        // invisível e esse intervalo não deve virar
        // tempo de leitura.
        // =========================================

        sessao.pausada = true;
        sessao.ultimaAtividadeEm = new Date();

        await sessao.save();

        return res.status(200).json({
            sucesso: true,
            jaEstavaPausada: false,
            mensagem: "Sessão de leitura pausada.",
            tempoAtivoSegundos: sessao.tempoAtivoSegundos,
            tempoAtivoMinutos:
                Math.floor(
                    sessao.tempoAtivoSegundos / 60
                )
        });

    } catch (error) {

        console.error("ERRO AO PAUSAR LEITURA DA BÍBLIA:");
        console.error(error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao pausar sessão de leitura."
        });
    }
});

app.post("/api/biblia/retomar", autenticarToken, async (req, res) => {
    try {

        const sessao = await ReadingSession.findOne({
            usuarioId: req.usuarioId,
            ativa: true
        });

        if (!sessao) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Nenhuma sessão de leitura ativa."
            });
        }

        // Se não estiver pausada, não faz nada
        if (!sessao.pausada) {
            return res.status(200).json({
                sucesso: true,
                jaEstavaAtiva: true,
                mensagem: "Sessão de leitura já está ativa.",
                tempoAtivoSegundos: sessao.tempoAtivoSegundos,
                tempoAtivoMinutos:
                    Math.floor(
                        sessao.tempoAtivoSegundos / 60
                    )
            });
        }

        // =========================================
        // RETOMA A SESSÃO
        // =========================================

        sessao.pausada = false;
        sessao.ultimaAtividadeEm = new Date();

        await sessao.save();

        return res.status(200).json({
            sucesso: true,
            jaEstavaAtiva: false,
            mensagem: "Sessão de leitura retomada.",
            tempoAtivoSegundos: sessao.tempoAtivoSegundos,
            tempoAtivoMinutos:
                Math.floor(
                    sessao.tempoAtivoSegundos / 60
                )
        });

    } catch (error) {

        console.error("ERRO AO RETOMAR LEITURA DA BÍBLIA:");
        console.error(error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao retomar sessão de leitura."
        });
    }
});


app.get("/api/biblia/progresso", autenticarToken, async (req, res) => {
    try {

        // =========================================
        // BUSCAR USUÁRIO
        // =========================================

        const usuario = await User.findById(req.usuarioId);

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Usuário não encontrado."
            });
        }


        // =========================================
        // CALCULAR TEMPO TOTAL DE LEITURA
        // =========================================

        const resultado = await ReadingSession.aggregate([
            {
                $match: {
                    usuarioId:
                        new mongoose.Types.ObjectId(req.usuarioId)
                }
            },
            {
                $group: {
                    _id: null,

                    tempoTotalSegundos: {
                        $sum: "$tempoAtivoSegundos"
                    }
                }
            }
        ]);


        const tempoTotalSegundos =
            resultado.length > 0
                ? resultado[0].tempoTotalSegundos
                : 0;


        const tempoTotalMinutos =
            Math.floor(
                tempoTotalSegundos / 60
            );


        // =========================================
        // MISSÕES DA BÍBLIA
        // =========================================

        const missoesBiblia =
            usuario.missoesBiblia || {
                nivel1: false,
                nivel2: false,
                nivel3: false
            };


        // =========================================
        // RETORNO
        // =========================================

        return res.status(200).json({

            sucesso: true,

            biblia: {

                tempoTotalSegundos,

                tempoTotalMinutos,

                missoesBiblia: {

                    nivel1:
                        !!missoesBiblia.nivel1,

                    nivel2:
                        !!missoesBiblia.nivel2,

                    nivel3:
                        !!missoesBiblia.nivel3

                }

            }

        });


    } catch (error) {

        console.error(
            "ERRO AO BUSCAR PROGRESSO DA BÍBLIA:"
        );

        console.error(error);

        return res.status(500).json({
            sucesso: false,
            mensagem:
                "Erro ao buscar progresso da Bíblia."
        });

    }
});


app.get("/api/biblia/progresso-capitulos", autenticarToken, async (req, res) => {
    try {

        const usuario = await User.findById(req.usuarioId);

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Usuário não encontrado."
            });
        }

        return res.status(200).json({
            sucesso: true,
            capitulosBiblia: usuario.capitulosBiblia || [],
            totalCapitulosLidos:
                (usuario.capitulosBiblia || []).length
        });

    } catch (error) {

        console.error(
            "ERRO AO BUSCAR PROGRESSO DOS CAPÍTULOS:"
        );

        console.error(error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao buscar progresso da Bíblia."
        });
    }
});

app.post("/api/biblia/marcar-lido", autenticarToken, async (req, res) => {
    try {

        const usuario = await User.findById(req.usuarioId);

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Usuário não encontrado."
            });
        }

        const { capitulo } = req.body;

        if (!capitulo || typeof capitulo !== "string") {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Capítulo não informado."
            });
        }

        // Evita duplicar o mesmo capítulo
        if (usuario.capitulosBiblia.includes(capitulo)) {

            return res.status(200).json({
                sucesso: true,
                jaEstavaLido: true,
                mensagem: "Este capítulo já está marcado como lido.",
                capitulosBiblia: usuario.capitulosBiblia,
                totalCapitulosLidos:
                    usuario.capitulosBiblia.length
            });
        }

        // Adiciona o capítulo
        usuario.capitulosBiblia.push(capitulo);

        // Mantém também o contador numérico atualizado
        usuario.capitulosBibliaLidos =
            usuario.capitulosBiblia.length;

        await usuario.save();

        return res.status(200).json({
            sucesso: true,
            jaEstavaLido: false,
            mensagem: "Capítulo marcado como lido.",
            capitulo,
            capitulosBiblia: usuario.capitulosBiblia,
            totalCapitulosLidos:
                usuario.capitulosBiblia.length
        });

    } catch (error) {

        console.error(
            "ERRO AO MARCAR CAPÍTULO COMO LIDO:"
        );

        console.error(error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao marcar capítulo como lido."
        });
    }
});

// =====================================================
// BÍBLIA — DESTAQUES DE VERSÍCULOS
// =====================================================

// BUSCAR TODOS OS DESTAQUES DO USUÁRIO
app.get("/api/biblia/destaques", autenticarToken, async (req, res) => {
    try {
        const usuario = await User.findById(req.usuarioId).select("destaquesBiblia");

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Usuário não encontrado."
            });
        }

        return res.status(200).json({
            sucesso: true,
            destaquesBiblia: usuario.destaquesBiblia || []
        });

    } catch (error) {
        console.error("ERRO AO BUSCAR DESTAQUES DA BÍBLIA:");
        console.error(error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao buscar destaques da Bíblia."
        });
    }
});


// SALVAR OU ALTERAR DESTAQUE
app.post("/api/biblia/destaque", autenticarToken, async (req, res) => {
    try {
        const usuario = await User.findById(req.usuarioId);

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Usuário não encontrado."
            });
        }

        const { capitulo, versiculo, cor } = req.body;

        if (
            !capitulo ||
            typeof capitulo !== "string" ||
            !versiculo ||
            typeof versiculo !== "number" ||
            !cor ||
            typeof cor !== "string"
        ) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Dados do destaque inválidos."
            });
        }

        if (!Array.isArray(usuario.destaquesBiblia)) {
            usuario.destaquesBiblia = [];
        }

        const indiceExistente = usuario.destaquesBiblia.findIndex(
            destaque =>
                destaque.capitulo === capitulo &&
                destaque.versiculo === versiculo
        );

        if (indiceExistente !== -1) {
            usuario.destaquesBiblia[indiceExistente].cor = cor;
        } else {
            usuario.destaquesBiblia.push({
                capitulo,
                versiculo,
                cor
            });
        }

        await usuario.save();

        return res.status(200).json({
            sucesso: true,
            mensagem: "Versículo destacado com sucesso.",
            destaquesBiblia: usuario.destaquesBiblia
        });

    } catch (error) {
        console.error("ERRO AO SALVAR DESTAQUE DA BÍBLIA:");
        console.error(error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao salvar destaque."
        });
    }
});


// REMOVER DESTAQUE
app.delete("/api/biblia/destaque", autenticarToken, async (req, res) => {
    try {
        const usuario = await User.findById(req.usuarioId);

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Usuário não encontrado."
            });
        }

        const { capitulo, versiculo } = req.body;

        if (
            !capitulo ||
            typeof capitulo !== "string" ||
            !versiculo ||
            typeof versiculo !== "number"
        ) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Dados do destaque inválidos."
            });
        }

        if (!Array.isArray(usuario.destaquesBiblia)) {
            usuario.destaquesBiblia = [];
        }

        usuario.destaquesBiblia =
            usuario.destaquesBiblia.filter(
                destaque =>
                    !(
                        destaque.capitulo === capitulo &&
                        destaque.versiculo === versiculo
                    )
            );

        await usuario.save();

        return res.status(200).json({
            sucesso: true,
            mensagem: "Destaque removido com sucesso.",
            destaquesBiblia: usuario.destaquesBiblia
        });

    } catch (error) {
        console.error("ERRO AO REMOVER DESTAQUE DA BÍBLIA:");
        console.error(error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao remover destaque."
        });
    }
});


// =====================================================
// CHAT AO VIVO — COMUNIDADE
// =====================================================

// BUSCAR MENSAGENS DO CHAT
app.get("/api/chat/mensagens", autenticarToken, async (req, res) => {
    try {

        const mensagens = await ChatMessage
            .find()
            .sort({
                createdAt: -1
            })
            .limit(50)
            .lean();

        // Invertemos para mostrar da mais antiga
        // para a mais recente no chat
        mensagens.reverse();

        return res.status(200).json({
            sucesso: true,
            mensagens
        });

    } catch (error) {

        console.error("ERRO AO BUSCAR MENSAGENS DO CHAT:");
        console.error(error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao carregar mensagens do chat."
        });
    }
});


// ENVIAR MENSAGEM PARA O CHAT
app.post("/api/chat/mensagens", autenticarToken, async (req, res) => {
    try {

        const { texto } = req.body;

        // =========================================
        // VALIDAÇÃO
        // =========================================

        if (!texto || typeof texto !== "string") {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Digite uma mensagem."
            });
        }

        const textoLimpo = texto.trim();

        if (!textoLimpo) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Digite uma mensagem."
            });
        }

        if (textoLimpo.length > 500) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "A mensagem pode ter no máximo 500 caracteres."
            });
        }

        // =========================================
        // BUSCAR USUÁRIO LOGADO
        // =========================================

        const usuario = await User
            .findById(req.usuarioId)
            .select("nome foto");

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Usuário não encontrado."
            });
        }

        // =========================================
        // CRIAR MENSAGEM
        // =========================================

        const mensagem = await ChatMessage.create({
            usuarioId: usuario._id,
            nome: usuario.nome,
            foto: usuario.foto || "",
            texto: textoLimpo
        });

        return res.status(201).json({
            sucesso: true,
            mensagem
        });

    } catch (error) {

        console.error("ERRO AO ENVIAR MENSAGEM DO CHAT:");
        console.error(error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao enviar mensagem."
        });
    }
});


/* =========================================
   ROTA PRINCIPAL
========================================= */

// =====================================================
// ARQUIVOS DO SITE
// =====================================================

const path = require("path");

// A pasta principal do projeto é:
// D:\abíbliarevela
const pastaSite = path.join(__dirname, "..");

// Servir HTML, CSS, JS, imagens, vídeos etc.
app.use(express.static(pastaSite));

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================

app.get("/", (req, res) => {
    res.sendFile(path.join(pastaSite, "index.html"));
});

/* =========================================
   STATUS DA API
========================================= */

app.get("/api/status", (req, res) => {
    res.json({
        online: true,
        backend: "A Bíblia Revela",
        banco: mongoose.connection.readyState === 1
            ? "MongoDB conectado"
            : "MongoDB desconectado"
    });
});

/* =========================================
   INICIAR SERVIDOR
========================================= */
module.exports = app;
