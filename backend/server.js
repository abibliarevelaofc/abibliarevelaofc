const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const Activity = require("./models/Activity");
const ReadingSession = require("./models/ReadingSession");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


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

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB conectado com sucesso!");
    })
    .catch((error) => {
        console.error("Erro ao conectar ao MongoDB:");
        console.error(error.message);
    });

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

        return res.status(201).json({
            sucesso: true,
            mensagem: "Usuário cadastrado com sucesso!",
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

        const usuario = await User
            .findById(req.usuarioId)
            .select("-senha");

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Usuário não encontrado."
            });
        }

        const progresso = calcularProgressoNivel(
            usuario.xp || 0
        );

        return res.status(200).json({
            sucesso: true,
            usuario: {
                id: usuario._id,
                nome: usuario.nome,
                email: usuario.email,
                foto: usuario.foto,

                // Evolução
                xp: usuario.xp || 0,
                nivel: progresso.nivel,
                xpNoNivel: progresso.xpNoNivel,
                xpNecessario: progresso.xpNecessario,
                progressoNivel: progresso.progressoNivel,

                // Pontos e atividade
                pontos: usuario.pontos,
                diasLogados: usuario.diasLogados,
                ultimoCheckin: usuario.ultimoCheckin,
                capitulosBibliaLidos: usuario.capitulosBibliaLidos,
                missoesConcluidas: usuario.missoesConcluidas,

                criadoEm: usuario.criadoEm
            }
        });

    } catch (error) {

        console.error("ERRO AO BUSCAR USUARIO LOGADO:");
        console.error(error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao buscar usuário."
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
        const usuario = await User.findById(req.usuarioId);

        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Usuário não encontrado."
            });
        }

        const agora = new Date();

        // Verifica se já fez check-in hoje
        if (usuario.ultimoCheckin) {
            const ultimo = new Date(usuario.ultimoCheckin);

            const mesmoDia =
                ultimo.getFullYear() === agora.getFullYear() &&
                ultimo.getMonth() === agora.getMonth() &&
                ultimo.getDate() === agora.getDate();

            if (mesmoDia) {
                return res.status(200).json({
                    sucesso: true,
                    jaFezHoje: true,
                    mensagem: "Você já fez seu check-in hoje!",
                    usuario: {
                        id: usuario._id,
                        nome: usuario.nome,
                        xp: usuario.xp || 0,
                        pontos: usuario.pontos,
                        nivel: usuario.nivel,
                        diasLogados: usuario.diasLogados,
                        ultimoCheckin: usuario.ultimoCheckin
                    }
                });
            }
        }

        // =========================================
        // PRIMEIRO CHECK-IN DO DIA
        // =========================================
usuario.diasLogados += 1;

// Recompensa do check-in
const progresso = await adicionarRecompensa(
    usuario,
    10,
    5,
    "checkin",
    "Check-in diário"
);

usuario.ultimoCheckin = agora;

        await usuario.save();

        return res.status(200).json({
            sucesso: true,
            jaFezHoje: false,
            mensagem: "Check-in realizado! +10 XP e +5 pontos.",
            usuario: {
                id: usuario._id,
                nome: usuario.nome,
                xp: usuario.xp,
                pontos: usuario.pontos,
                nivel: usuario.nivel,
                diasLogados: usuario.diasLogados,
                ultimoCheckin: usuario.ultimoCheckin,
                xpNoNivel: progresso.xpNoNivel,
                xpNecessario: progresso.xpNecessario,
                progressoNivel: progresso.progressoNivel
            }
        });

    } catch (error) {

        console.error("ERRO AO REALIZAR CHECK-IN:");
        console.error(error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao realizar check-in."
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

        const resultado = await ReadingSession.aggregate([
            {
                $match: {
                    usuarioId: new mongoose.Types.ObjectId(req.usuarioId)
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

        return res.status(200).json({
            sucesso: true,

            biblia: {
                tempoTotalSegundos,
                tempoTotalMinutos
            }
        });

    } catch (error) {

        console.error("ERRO AO BUSCAR PROGRESSO DA BÍBLIA:");
        console.error(error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao buscar progresso da Bíblia."
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

/* =========================================
   ROTA PRINCIPAL
========================================= */

app.get("/", (req, res) => {
    res.json({
        sucesso: true,
        mensagem: "Backend A Bíblia Revela está funcionando!",
        mongodb: mongoose.connection.readyState === 1
            ? "conectado"
            : "desconectado"
    });
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

app.listen(PORT, () => {
    console.log(`Backend rodando na porta ${PORT}`);
});