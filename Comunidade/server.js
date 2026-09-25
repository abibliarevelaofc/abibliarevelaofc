const express = require("express");
const path = require("path");
require("dotenv").config();

console.log("=================================");
console.log("🔎 TESTE DAS VARIÁVEIS DO RENDER");
console.log("CHANNEL_ID:", process.env.CHANNEL_ID);
console.log("API KEY EXISTE:", !!process.env.YOUTUBE_API_KEY);
console.log("PORT:", process.env.PORT);
console.log("=================================");



const axios = require("axios");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;


// =========================
// CONFIGURAÇÕES
// =========================

app.use(express.json());

// =========================
// PROTEÇÃO DE COTA YOUTUBE
// =========================

let API_BLOQUEADA = false;


// arquivos do site
app.use(express.static(path.join(__dirname, "public")));



// =========================
// SISTEMA DE CACHE
// =========================


// arquivo permanente de cache

const CACHE_FILE = "./cache.json";

// dados guardados temporariamente

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



// carregar cache salvo ao iniciar

if(fs.existsSync(CACHE_FILE)){


try{


cache = JSON.parse(
fs.readFileSync(CACHE_FILE)
);


console.log("📂 Cache carregado do arquivo");


}catch(error){


console.log("⚠️ Erro lendo cache");


}


}



// horário da última atualização

const cacheTime = {

    youtube: 0,

    videos: 0,

    populares: 0,

    comentarios: 0,

    fluxo: 0

};



// tempos de atualização


const TEMPO_CACHE = {


    // inscritos
    youtube: 5 * 60 * 1000,
    

    // vídeos recentes
    videos: 60 * 60 * 1000,


    // populares
    populares: 24 * 60 * 60 * 1000,


    // comentários
    comentarios: 15 * 1000


};





// verifica se existe cache válido


function possuiCache(tipo){


    if(!cache[tipo]){

        return false;

    }



    const agora = Date.now();



    const passouTempo =

    agora - cacheTime[tipo];



    return passouTempo < TEMPO_CACHE[tipo];


}





// salva no cache


function salvarCache(tipo,dados){


    cache[tipo] = dados;


    cacheTime[tipo] = Date.now();



    try{


        fs.writeFileSync(

            CACHE_FILE,

            JSON.stringify(cache,null,2)

        );


        console.log("💾 Cache salvo no arquivo");


    }catch(error){


        console.log(
            "⚠️ Erro salvando cache:",
            error.message
        );


    }


}




// =========================
// PÁGINA PRINCIPAL
// =========================


app.get("/",(req,res)=>{


    res.sendFile(

        path.join(
            __dirname,
            "public",
            "index.html"
        )

    );


});


// =========================
// CONTADOR YOUTUBE
// =========================

app.get("/api/youtube", async(req,res)=>{


try{


if(API_BLOQUEADA){

return res.json(cache.youtube || {

inscritos:0,
visualizacoes:0,
videos:0

});

}



if(possuiCache("youtube")){


console.log("📦 Contador usando cache");


return res.json(cache.youtube);


}



console.log("📊 Atualizando contador");



const resposta = await axios.get(

"https://www.googleapis.com/youtube/v3/channels",

{

params:{

part:"statistics",

id:process.env.CHANNEL_ID,

key:process.env.YOUTUBE_API_KEY

}

}

);



const stats = resposta.data.items[0].statistics;



const dados = {


inscritos:stats.subscriberCount,

visualizacoes:stats.viewCount,

videos:stats.videoCount


};



salvarCache(
"youtube",
dados
);



res.json(dados);



}catch(error){


if(error.response?.status === 403){

console.log("⚠️ COTA DO YOUTUBE ACABOU");

API_BLOQUEADA = true;

}


console.log(
error.response?.data || error.message
);



res.status(500).json({

erro:"Erro contador"

});


}


});


// =========================
// VÍDEOS RECENTES
// =========================

app.get("/api/videos", async (req,res)=>{


try{

// PROTEÇÃO DE COTA
if(API_BLOQUEADA){

return res.json(cache.videos || []);

}


// verifica cache

if(possuiCache("videos")){


console.log("📦 Vídeos recentes usando cache");


return res.json(cache.videos);


}




console.log("🔄 Atualizando vídeos recentes");




// pega playlist de uploads


const canal = await axios.get(

"https://www.googleapis.com/youtube/v3/channels",

{

params:{

part:"contentDetails",

id:process.env.CHANNEL_ID,

key:process.env.YOUTUBE_API_KEY

}

}

);




const playlist =

canal.data.items[0]
.contentDetails
.relatedPlaylists
.uploads;





// últimos vídeos


const videos = await axios.get(

"https://www.googleapis.com/youtube/v3/playlistItems",

{

params:{

part:"snippet",

playlistId:playlist,

maxResults:8,

key:process.env.YOUTUBE_API_KEY

}

}

);





const ids = videos.data.items.map(video=>

video.snippet.resourceId.videoId

);





// estatísticas


const estatisticas = await axios.get(

"https://www.googleapis.com/youtube/v3/videos",

{

params:{

part:"statistics",

id:ids.join(","),

key:process.env.YOUTUBE_API_KEY

}

}

);





const lista = videos.data.items.map(video=>{


const stats =

estatisticas.data.items.find(

item=>item.id === video.snippet.resourceId.videoId

);





return {


id:
video.snippet.resourceId.videoId,


titulo:
video.snippet.title,


imagem:
video.snippet.thumbnails.high.url,


views:

stats

?

Number(
stats.statistics.viewCount
)
.toLocaleString("pt-BR")

:

"0"


};


});





// salva cache

salvarCache(
"videos",
lista
);




res.json(lista);



}catch(error){


if(error.response?.status === 403){

console.log("⚠️ COTA DO YOUTUBE ACABOU");

API_BLOQUEADA = true;

}


console.log(
error.response?.data || error.message
);


res.status(500).json({

erro:"Erro ao buscar vídeos"

});


}


});








// =========================
// VÍDEOS POPULARES
// =========================


app.get("/api/populares", async(req,res)=>{


try{

if(API_BLOQUEADA){

return res.json(cache.populares || []);

}


// cache

if(possuiCache("populares")){


console.log("📦 Populares usando cache");


return res.json(cache.populares);


}





console.log("🔥 Atualizando populares");





const resposta = await axios.get(

"https://www.googleapis.com/youtube/v3/search",

{

params:{


part:"snippet",


channelId:
process.env.CHANNEL_ID,


maxResults:10,


order:"viewCount",


type:"video",


key:process.env.YOUTUBE_API_KEY


}

}

);






const ids = resposta.data.items.map(video=>

video.id.videoId

);







const estatisticas = await axios.get(

"https://www.googleapis.com/youtube/v3/videos",

{

params:{


part:"statistics",


id:ids.join(","),


key:process.env.YOUTUBE_API_KEY


}

}

);







const lista = resposta.data.items.map(video=>{


const stats =

estatisticas.data.items.find(

item=>item.id === video.id.videoId

);





return {


id:
video.id.videoId,


titulo:
video.snippet.title,


imagem:
video.snippet.thumbnails.high.url,



views:

stats

?

Number(
stats.statistics.viewCount
)
.toLocaleString("pt-BR")

:

"0"


};


});







// salva cache

salvarCache(

"populares",

lista

);






res.json(lista);






}catch(error){


if(error.response?.status === 403){

console.log("⚠️ COTA DO YOUTUBE ACABOU");

API_BLOQUEADA = true;

}


console.log(
error.response?.data || error.message
);


res.status(500).json({

erro:"Erro ao buscar populares"

});


}


});

// =========================
// COMENTÁRIOS RECENTES
// =========================


app.get("/api/comentarios", async(req,res)=>{


try{

if(API_BLOQUEADA){

return res.json(cache.comentarios || []);

}


// usa cache

if(possuiCache("comentarios")){


console.log("💬 Comentários usando cache");


return res.json(cache.comentarios);


}




console.log("🔴 Atualizando comentários");


console.log("🔎 CHANNEL_ID:", process.env.CHANNEL_ID);
console.log("🔑 API KEY EXISTE:", !!process.env.YOUTUBE_API_KEY);


// busca comentários recentes do canal
const comentarios = await axios.get(
"https://www.googleapis.com/youtube/v3/commentThreads",
{
params: {
part: "snippet",
allThreadsRelatedToChannelId: process.env.CHANNEL_ID,
maxResults: 20,
order: "time",
key: process.env.YOUTUBE_API_KEY
}
}
);



const lista = comentarios.data.items.map(item=>{


const c =

item.snippet
.topLevelComment
.snippet;





return {


nome:
c.authorDisplayName,


foto:
c.authorProfileImageUrl,


texto:
c.textDisplay,


data:
c.publishedAt


};


});







// salva cache


salvarCache(

"comentarios",

lista

);







res.json(lista);







}catch(error){


if(error.response?.status === 403){

console.log("⚠️ COTA DO YOUTUBE ACABOU");

API_BLOQUEADA = true;

}


console.log(
error.response?.data || error.message
);


res.status(500).json({

erro:"Erro ao buscar comentários"

});


}


});


// =========================
// CONTROLE DE FLUXO
// =========================

app.get("/api/fluxo", (req, res) => {

    // garante que fluxo exista
    if (!cache.fluxo) {

        cache.fluxo = {};

    }


    // garante que todos os contadores existam

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


    // SOMENTE LE
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


    // cria o objeto caso ainda não exista
    if (!cache.fluxo) {

        cache.fluxo = {};

    }


    // MUITO IMPORTANTE:
    // se não existir ou estiver NaN, começa em zero

    if (
        typeof cache.fluxo[tipo] !== "number" ||
        Number.isNaN(cache.fluxo[tipo])
    ) {

        cache.fluxo[tipo] = 0;

    }


    // soma 1

    cache.fluxo[tipo] += 1;


    // salva

    salvarCache(
        "fluxo",
        cache.fluxo
    );


    console.log(
        `📊 Fluxo: ${tipo} = ${cache.fluxo[tipo]}`
    );


    res.json(cache.fluxo);

});


// =========================
// DOWNLOAD DAS FIGURINHAS
// =========================

app.get("/baixar-figurinhas", (req, res) => {
    res.redirect(
        "https://drive.google.com/uc?export=download&id=1WPlYTl2Fd7mYwtiVFxnqBzZsFjXBOPUZ"
    );
});

// =========================
// INICIAR SERVIDOR
// =========================


app.listen(PORT,()=>{


console.log(

`🚀 Servidor rodando em http://localhost:${PORT}`

);


});