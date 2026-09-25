const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(express.json());

let API_BLOQUEADA = false;

let cache = {
  youtube: null,
  videos: null,
  populares: null,
  comentarios: null,
  fluxo: {
    acessos: 0,
    baixarFigurinhas: 0,
    copiarPix: 0,
    copiarChavePix: 0,
    facebook: 0,
    youtube: 0,
    instagram: 0,
    tiktok: 0,
    curso: 0
  }
};

const cacheTime = {
  youtube: 0,
  videos: 0,
  populares: 0,
  comentarios: 0
};

const TEMPO_CACHE = {
  youtube: 5 * 60 * 1000,
  videos: 60 * 60 * 1000,
  populares: 24 * 60 * 60 * 1000,
  comentarios: 15 * 1000
};

function possuiCache(tipo) {
  if (!cache[tipo]) return false;

  const agora = Date.now();
  const passouTempo = agora - cacheTime[tipo];

  return passouTempo < TEMPO_CACHE[tipo];
}

function salvarCache(tipo, dados) {
  cache[tipo] = dados;
  cacheTime[tipo] = Date.now();
}


/* =========================
   YOUTUBE
========================= */

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
      return res.json(cache.youtube);
    }

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

    const stats = resposta.data.items[0].statistics;

    const dados = {
      inscritos: stats.subscriberCount,
      visualizacoes: stats.viewCount,
      videos: stats.videoCount
    };

    salvarCache("youtube", dados);

    res.json(dados);

  } catch (error) {

    if (error.response?.status === 403) {
      API_BLOQUEADA = true;
    }

    console.log(error.response?.data || error.message);

    res.status(500).json({
      erro: "Erro contador"
    });
  }
});


/* =========================
   VÍDEOS
========================= */

app.get("/api/videos", async (req, res) => {
  try {

    if (API_BLOQUEADA) {
      return res.json(cache.videos || []);
    }

    if (possuiCache("videos")) {
      return res.json(cache.videos);
    }

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
      canal.data.items[0].contentDetails.relatedPlaylists.uploads;

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

    const ids = videos.data.items.map(
      video => video.snippet.resourceId.videoId
    );

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

    const lista = videos.data.items.map(video => {

      const stats = estatisticas.data.items.find(
        item => item.id === video.snippet.resourceId.videoId
      );

      return {
        id: video.snippet.resourceId.videoId,
        titulo: video.snippet.title,
        imagem: video.snippet.thumbnails.high.url,
        views: stats
          ? Number(stats.statistics.viewCount).toLocaleString("pt-BR")
          : "0"
      };

    });

    salvarCache("videos", lista);

    res.json(lista);

  } catch (error) {

    if (error.response?.status === 403) {
      API_BLOQUEADA = true;
    }

    console.log(error.response?.data || error.message);

    res.status(500).json({
      erro: "Erro ao buscar vídeos"
    });
  }
});


/* =========================
   POPULARES
========================= */

app.get("/api/populares", async (req, res) => {

  try {

    if (API_BLOQUEADA) {
      return res.json(cache.populares || []);
    }

    if (possuiCache("populares")) {
      return res.json(cache.populares);
    }

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

    const ids = resposta.data.items.map(
      video => video.id.videoId
    );

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

    const lista = resposta.data.items.map(video => {

      const stats = estatisticas.data.items.find(
        item => item.id === video.id.videoId
      );

      return {
        id: video.id.videoId,
        titulo: video.snippet.title,
        imagem: video.snippet.thumbnails.high.url,
        views: stats
          ? Number(stats.statistics.viewCount).toLocaleString("pt-BR")
          : "0"
      };

    });

    salvarCache("populares", lista);

    res.json(lista);

  } catch (error) {

    if (error.response?.status === 403) {
      API_BLOQUEADA = true;
    }

    console.log(error.response?.data || error.message);

    res.status(500).json({
      erro: "Erro ao buscar populares"
    });
  }

});


/* =========================
   COMENTÁRIOS
========================= */

app.get("/api/comentarios", async (req, res) => {

  try {

    if (API_BLOQUEADA) {
      return res.json(cache.comentarios || []);
    }

    if (possuiCache("comentarios")) {
      return res.json(cache.comentarios);
    }

    const comentarios = await axios.get(
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

    const lista = comentarios.data.items.map(item => {

      const c =
        item.snippet.topLevelComment.snippet;

      return {
        nome: c.authorDisplayName,
        foto: c.authorProfileImageUrl,
        texto: c.textDisplay,
        data: c.publishedAt
      };

    });

    salvarCache("comentarios", lista);

    res.json(lista);

  } catch (error) {

    if (error.response?.status === 403) {
      API_BLOQUEADA = true;
    }

    console.log(error.response?.data || error.message);

    res.status(500).json({
      erro: "Erro ao buscar comentários"
    });
  }

});


/* =========================
   FLUXO
========================= */

app.get("/api/fluxo", (req, res) => {

  const tipos = [
    "acessos",
    "baixarFigurinhas",
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

  res.json(cache.fluxo);
});


app.post("/api/fluxo", (req, res) => {

  const { tipo } = req.body;

  const tiposPermitidos = [
    "acessos",
    "baixarFigurinhas",
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

  if (
    typeof cache.fluxo[tipo] !== "number" ||
    Number.isNaN(cache.fluxo[tipo])
  ) {
    cache.fluxo[tipo] = 0;
  }

  cache.fluxo[tipo] += 1;

  res.json(cache.fluxo);
});


/* =========================
   DOWNLOAD FIGURINHAS
========================= */

app.get("/baixar-figurinhas", (req, res) => {

  res.redirect(
    "https://drive.google.com/uc?export=download&id=1WPlYTl2Fd7mYwtiVFxnqBzZsFjXBOPUZ"
  );

});


/* =========================
   EXPORTAÇÃO PARA VERCEL
========================= */

module.exports = app;