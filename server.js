const express = require("express");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

console.log("=================================");
console.log("🔎 TESTE DAS VARIÁVEIS");
console.log("CHANNEL_ID:", process.env.CHANNEL_ID);
console.log("API KEY EXISTE:", !!process.env.YOUTUBE_API_KEY);
console.log("PORT:", PORT);
console.log("=================================");

// =====================================================
// CONFIGURAÇÕES
// =====================================================

app.use(express.json());

// Arquivos públicos do site
app.use(express.static(path.join(__dirname, "public")));

// =====================================================
// PROTEÇÃO DE COTA DO YOUTUBE
// =====================================================

let API_BLOQUEADA = false;

// =====================================================
// CACHE
// =====================================================

const CACHE_FILE = path.join(__dirname, "cache.json");

let cache = {
    youtube: null,
    videos: null,
    populares: null,
    comentarios: null,

    fluxo: {
        acessos: 0,
        copiarPix: 0,
        copiarChavePix: 0,
        facebook: 0,
        youtube: 0,
        instagram: 0,
        tiktok: 0,
        curso: 0
    }
};

// =====================================================
// CARREGAR CACHE
// =====================================================

if (fs.existsSync(CACHE_FILE)) {
    try {
        const conteudo = fs.readFileSync(CACHE_FILE, "utf8");

        if (conteudo.trim()) {
            const cacheSalvo = JSON.parse(conteudo);

            cache = {
                ...cache,
                ...cacheSalvo,

                fluxo: {
                    ...cache.fluxo,
                    ...(cacheSalvo.fluxo || {})
                }
            };
        }

        console.log("📂 Cache carregado do arquivo");

    } catch (error) {
        console.log("⚠️ Erro lendo cache:", error.message);
    }
}

// =====================================================
// TEMPO DO CACHE
// =====================================================

const cacheTime = {
    youtube: 0,
    videos: 0,
    populares: 0,
    comentarios: 0,
    fluxo: 0
};

const TEMPO_CACHE = {
    youtube: 5 * 60 * 1000,
    videos: 60 * 60 * 1000,
    populares: 24 * 60 * 60 * 1000,
    comentarios: 15 * 1000,
    fluxo: 0
};

// =====================================================
// VERIFICAR CACHE
// =====================================================

function possuiCache(tipo) {

    if (!cache[tipo]) {
        return false;
    }

    const tempo = TEMPO_CACHE[tipo];

    if (!tempo) {
        return false;
    }

    const agora = Date.now();

    const passouTempo = agora - cacheTime[tipo];

    return passouTempo < tempo;
}

// =====================================================
// SALVAR CACHE
// =====================================================

function salvarCache(tipo, dados) {

    cache[tipo] = dados;

    cacheTime[tipo] = Date.now();

    try {

        fs.writeFileSync(
            CACHE_FILE,
            JSON.stringify(cache, null, 2),
            "utf8"
        );

        console.log(`💾 Cache salvo: ${tipo}`);

    } catch (error) {

        console.log(
            "⚠️ Erro salvando cache:",
            error.message
        );

    }
}

// =====================================================
// VERIFICAR CONFIGURAÇÃO DO YOUTUBE
// =====================================================

function youtubeConfigurado() {

    return !!(
        process.env.CHANNEL_ID &&
        process.env.YOUTUBE_API_KEY
    );
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});

// =====================================================
// CONTADOR DO YOUTUBE
// =====================================================

app.get("/api/youtube", async (req, res) => {

    try {

        if (API_BLOQUEADA) {

            return res.json(
                cache.youtube || {
                    inscritos: 0,
                    visualizacoes: 0,
                    videos: 0
                }
            );

        }

        if (possuiCache("youtube")) {

            console.log("📦 Contador usando cache");

            return res.json(cache.youtube);

        }

        if (!youtubeConfigurado()) {

            console.log(
                "❌ CHANNEL_ID ou YOUTUBE_API_KEY não configurados"
            );

            return res.status(500).json({
                erro: "Configuração do YouTube ausente"
            });

        }

        console.log("📊 Atualizando contador do YouTube");

        const resposta = await axios.get(
            "https://www.googleapis.com/youtube/v3/channels",
            {
                params: {
                    part: "statistics",
                    id: process.env.CHANNEL_ID,
                    key: process.env.YOUTUBE_API_KEY
                }
            }
        );

        const item = resposta.data?.items?.[0];

        if (!item?.statistics) {

            throw new Error(
                "YouTube não retornou estatísticas do canal"
            );

        }

        const stats = item.statistics;

        const dados = {
            inscritos: stats.subscriberCount || "0",
            visualizacoes: stats.viewCount || "0",
            videos: stats.videoCount || "0"
        };

        salvarCache("youtube", dados);

        return res.json(dados);

    } catch (error) {

        if (error.response?.status === 403) {

            console.log("⚠️ COTA DO YOUTUBE ACABOU");

            API_BLOQUEADA = true;

            if (cache.youtube) {
                return res.json(cache.youtube);
            }
        }

        console.log(
            "❌ Erro /api/youtube:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            erro: "Erro contador"
        });

    }

});

// =====================================================
// VÍDEOS RECENTES
// =====================================================

app.get("/api/videos", async (req, res) => {

    try {

        if (API_BLOQUEADA) {

            return res.json(
                Array.isArray(cache.videos)
                    ? cache.videos
                    : []
            );

        }

        if (possuiCache("videos")) {

            console.log(
                "📦 Vídeos recentes usando cache"
            );

            return res.json(cache.videos);

        }

        if (!youtubeConfigurado()) {

            console.log(
                "❌ CHANNEL_ID ou YOUTUBE_API_KEY não configurados"
            );

            return res.status(500).json({
                erro: "Configuração do YouTube ausente"
            });

        }

        console.log(
            "🔄 Atualizando vídeos recentes"
        );

        // ---------------------------------------------
        // BUSCAR PLAYLIST DE UPLOADS
        // ---------------------------------------------

        const canal = await axios.get(
            "https://www.googleapis.com/youtube/v3/channels",
            {
                params: {
                    part: "contentDetails",
                    id: process.env.CHANNEL_ID,
                    key: process.env.YOUTUBE_API_KEY
                }
            }
        );

        const playlist =
            canal.data?.items?.[0]
                ?.contentDetails
                ?.relatedPlaylists
                ?.uploads;

        if (!playlist) {

            throw new Error(
                "Playlist de uploads não encontrada"
            );

        }

        // ---------------------------------------------
        // BUSCAR ÚLTIMOS VÍDEOS
        // ---------------------------------------------

        const videos = await axios.get(
            "https://www.googleapis.com/youtube/v3/playlistItems",
            {
                params: {
                    part: "snippet",
                    playlistId: playlist,
                    maxResults: 8,
                    key: process.env.YOUTUBE_API_KEY
                }
            }
        );

        const itens = Array.isArray(videos.data?.items)
            ? videos.data.items
            : [];

        if (!itens.length) {

            console.log(
                "⚠️ Nenhum vídeo encontrado"
            );

            return res.json([]);
        }

        const ids = itens
            .map(video =>
                video?.snippet?.resourceId?.videoId
            )
            .filter(Boolean);

        if (!ids.length) {
            return res.json([]);
        }

        // ---------------------------------------------
        // ESTATÍSTICAS
        // ---------------------------------------------

        const estatisticas = await axios.get(
            "https://www.googleapis.com/youtube/v3/videos",
            {
                params: {
                    part: "statistics",
                    id: ids.join(","),
                    key: process.env.YOUTUBE_API_KEY
                }
            }
        );

        const estatisticasItens =
            Array.isArray(estatisticas.data?.items)
                ? estatisticas.data.items
                : [];

        // ---------------------------------------------
        // MONTAR LISTA
        // ---------------------------------------------

        const lista = itens
            .map(video => {

                const id =
                    video?.snippet
                        ?.resourceId
                        ?.videoId;

                if (!id) {
                    return null;
                }

                const stats =
                    estatisticasItens.find(
                        item => item.id === id
                    );

                const thumbnail =
                    video?.snippet?.thumbnails?.high?.url ||
                    video?.snippet?.thumbnails?.medium?.url ||
                    video?.snippet?.thumbnails?.default?.url ||
                    "";

                return {

                    id,

                    titulo:
                        video?.snippet?.title ||
                        "Vídeo sem título",

                    imagem: thumbnail,

                    views: stats
                        ? Number(
                            stats.statistics?.viewCount || 0
                        ).toLocaleString("pt-BR")
                        : "0"
                };

            })
            .filter(Boolean);

        salvarCache(
            "videos",
            lista
        );

        return res.json(lista);

    } catch (error) {

        if (error.response?.status === 403) {

            console.log(
                "⚠️ COTA DO YOUTUBE ACABOU"
            );

            API_BLOQUEADA = true;

            if (Array.isArray(cache.videos)) {
                return res.json(cache.videos);
            }
        }

        console.log(
            "❌ Erro /api/videos:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            erro: "Erro ao buscar vídeos"
        });

    }

});

// =====================================================
// VÍDEOS POPULARES
// =====================================================

app.get("/api/populares", async (req, res) => {

    try {

        if (API_BLOQUEADA) {

            return res.json(
                Array.isArray(cache.populares)
                    ? cache.populares
                    : []
            );

        }

        if (possuiCache("populares")) {

            console.log(
                "📦 Populares usando cache"
            );

            return res.json(cache.populares);

        }

        if (!youtubeConfigurado()) {

            return res.status(500).json({
                erro: "Configuração do YouTube ausente"
            });

        }

        console.log(
            "🔥 Atualizando vídeos populares"
        );

        // ---------------------------------------------
        // BUSCAR VÍDEOS MAIS VISTOS
        // ---------------------------------------------

        const resposta = await axios.get(
            "https://www.googleapis.com/youtube/v3/search",
            {
                params: {
                    part: "snippet",
                    channelId: process.env.CHANNEL_ID,
                    maxResults: 10,
                    order: "viewCount",
                    type: "video",
                    key: process.env.YOUTUBE_API_KEY
                }
            }
        );

        const itens = Array.isArray(
            resposta.data?.items
        )
            ? resposta.data.items
            : [];

        if (!itens.length) {

            return res.json([]);
        }

        const ids = itens
            .map(video => video?.id?.videoId)
            .filter(Boolean);

        if (!ids.length) {
            return res.json([]);
        }

        // ---------------------------------------------
        // ESTATÍSTICAS
        // ---------------------------------------------

        const estatisticas = await axios.get(
            "https://www.googleapis.com/youtube/v3/videos",
            {
                params: {
                    part: "statistics",
                    id: ids.join(","),
                    key: process.env.YOUTUBE_API_KEY
                }
            }
        );

        const estatisticasItens =
            Array.isArray(estatisticas.data?.items)
                ? estatisticas.data.items
                : [];

        // ---------------------------------------------
        // MONTAR LISTA
        // ---------------------------------------------

        const lista = itens
            .map(video => {

                const id =
                    video?.id?.videoId;

                if (!id) {
                    return null;
                }

                const stats =
                    estatisticasItens.find(
                        item => item.id === id
                    );

                const thumbnail =
                    video?.snippet?.thumbnails?.high?.url ||
                    video?.snippet?.thumbnails?.medium?.url ||
                    video?.snippet?.thumbnails?.default?.url ||
                    "";

                return {

                    id,

                    titulo:
                        video?.snippet?.title ||
                        "Vídeo sem título",

                    imagem: thumbnail,

                    views: stats
                        ? Number(
                            stats.statistics?.viewCount || 0
                        ).toLocaleString("pt-BR")
                        : "0"
                };

            })
            .filter(Boolean);

        salvarCache(
            "populares",
            lista
        );

        return res.json(lista);

    } catch (error) {

        if (error.response?.status === 403) {

            console.log(
                "⚠️ COTA DO YOUTUBE ACABOU"
            );

            API_BLOQUEADA = true;

            if (Array.isArray(cache.populares)) {
                return res.json(cache.populares);
            }
        }

        console.log(
            "❌ Erro /api/populares:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            erro: "Erro ao buscar populares"
        });

    }

});

// =====================================================
// COMENTÁRIOS RECENTES
// =====================================================

app.get("/api/comentarios", async (req, res) => {

    try {

        if (API_BLOQUEADA) {

            return res.json(
                Array.isArray(cache.comentarios)
                    ? cache.comentarios
                    : []
            );

        }

        if (possuiCache("comentarios")) {

            console.log(
                "💬 Comentários usando cache"
            );

            return res.json(cache.comentarios);

        }

        if (!youtubeConfigurado()) {

            return res.status(500).json({
                erro: "Configuração do YouTube ausente"
            });

        }

        console.log(
            "🔴 Atualizando comentários"
        );

        console.log(
            "🔎 CHANNEL_ID:",
            process.env.CHANNEL_ID
        );

        console.log(
            "🔑 API KEY EXISTE:",
            !!process.env.YOUTUBE_API_KEY
        );

        // ---------------------------------------------
        // BUSCAR COMENTÁRIOS
        // ---------------------------------------------

        const resposta = await axios.get(
            "https://www.googleapis.com/youtube/v3/commentThreads",
            {
                params: {
                    part: "snippet",
                    allThreadsRelatedToChannelId:
                        process.env.CHANNEL_ID,
                    maxResults: 20,
                    order: "time",
                    key: process.env.YOUTUBE_API_KEY
                }
            }
        );

        const itens = Array.isArray(
            resposta.data?.items
        )
            ? resposta.data.items
            : [];

        // ---------------------------------------------
        // TRANSFORMAR COMENTÁRIOS
        // ---------------------------------------------

        const lista = itens
            .map(item => {

                const c =
                    item?.snippet
                        ?.topLevelComment
                        ?.snippet;

                if (!c) {
                    return null;
                }

                return {

                    nome:
                        c.authorDisplayName ||
                        "Usuário",

                    foto:
                        c.authorProfileImageUrl ||
                        "",

                    texto:
                        c.textDisplay ||
                        "",

                    data:
                        c.publishedAt ||
                        ""
                };

            })
            .filter(Boolean);

        salvarCache(
            "comentarios",
            lista
        );

        console.log(
            `💬 ${lista.length} comentários encontrados`
        );

        return res.json(lista);

    } catch (error) {

        if (error.response?.status === 403) {

            console.log(
                "⚠️ COTA DO YOUTUBE ACABOU"
            );

            API_BLOQUEADA = true;

            if (Array.isArray(cache.comentarios)) {
                return res.json(cache.comentarios);
            }
        }

        console.log(
            "❌ Erro /api/comentarios:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            erro: "Erro ao buscar comentários"
        });

    }

});

// =====================================================
// CONTROLE DE FLUXO
// =====================================================

app.get("/api/fluxo", (req, res) => {

    if (!cache.fluxo) {
        cache.fluxo = {};
    }

    const tipos = [

        "acessos",
        "copiarPix",
        "copiarChavePix",
        "youtube",
        "instagram",
        "facebook",
        "tiktok",
        "curso"

    ];

    tipos.forEach(tipo => {

        if (
            typeof cache.fluxo[tipo] !== "number" ||
            Number.isNaN(cache.fluxo[tipo])
        ) {

            cache.fluxo[tipo] = 0;

        }

    });

    return res.json(cache.fluxo);

});

// =====================================================
// REGISTRAR FLUXO
// =====================================================

app.post("/api/fluxo", (req, res) => {

    const { tipo } = req.body;

    const tiposPermitidos = [

        "acessos",
        "copiarPix",
        "copiarChavePix",
        "youtube",
        "instagram",
        "facebook",
        "tiktok",
        "curso"

    ];

    if (!tiposPermitidos.includes(tipo)) {

        return res.status(400).json({

            erro: "Tipo de fluxo inválido"

        });

    }

    if (!cache.fluxo) {
        cache.fluxo = {};
    }

    if (
        typeof cache.fluxo[tipo] !== "number" ||
        Number.isNaN(cache.fluxo[tipo])
    ) {

        cache.fluxo[tipo] = 0;

    }

    cache.fluxo[tipo] += 1;

    salvarCache(
        "fluxo",
        cache.fluxo
    );

    console.log(
        `📊 Fluxo: ${tipo} = ${cache.fluxo[tipo]}`
    );

    return res.json(cache.fluxo);

});

// =====================================================
// ROTA 404 DA API
// =====================================================

app.use("/api", (req, res) => {

    return res.status(404).json({
        erro: "Endpoint da API não encontrado"
    });

});

// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(PORT, () => {

    console.log(
        `🚀 Servidor rodando na porta ${PORT}`
    );

});