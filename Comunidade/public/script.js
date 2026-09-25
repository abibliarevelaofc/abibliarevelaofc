

// ===== CONFIG =====

let comentariosAtuais = [];



// ===== CONTADOR =====
async function pegarInscritos(){

try{

let res = await fetch("/api/youtube");

let data = await res.json();


document.getElementById("contador").innerHTML =
Number(data.inscritos).toLocaleString("pt-BR");


}catch(error){

console.log(error);

document.getElementById("contador").innerHTML="Erro";

}

}

// ===== VÍDEOS AUTOMÁTICOS =====

async function criarVideos(){

try{


const [recentes,populares] = await Promise.all([

fetch("/api/videos"),

fetch("/api/populares")

]);


const listaRecentes = await recentes.json();

const listaPopulares = await populares.json();



montarCarrossel(
"recentes",
listaRecentes
);


montarCarrossel(
"maisVistos",
listaPopulares
);



}catch(error){

console.log("ERRO VIDEOS:", error);

}

}

function baixarFigurinhas() {
    registrarFluxo("baixarFigurinhas");

    window.open("/baixar-figurinhas", "_blank");
}

function copiarPix() {
    const pix = "00020126360014br.gov.bcb.pix0114+55219824996985204000053039865802BR5925MATHEUS LUCAS VIEIRA MASC6014RIO DE JANEIRO62170513ABIBLIAREVELA63047380";

    navigator.clipboard.writeText(pix)
        .then(() => {
            mostrarToastPix("PIX Copia e Cola copiado!");
        })
        .catch(() => {
            mostrarToastPix("Não foi possível copiar o PIX.", true);
        });
}



function copiarChavePix() {

    const chavePix = "21982499698";

    if (!navigator.clipboard) {

        mostrarToastPix(
            "Seu navegador não permite copiar automaticamente."
        );

        return;

    }

    navigator.clipboard.writeText(chavePix)

        .then(() => {

            registrarFluxo("copiarChavePix");

            mostrarToastPix(
                "A chave PIX foi copiada para sua área de transferência."
            );

        })

        .catch(() => {

            mostrarToastPix(
                "Não foi possível copiar a chave PIX.",
                true
            );

        });

}


function mostrarToastPix(mensagem, erro = false) {

    // Remove toast anterior
    const antigo = document.querySelector(".toast-pix");

    if (antigo) {
        antigo.remove();
    }

    // Cria o toast
    const toast = document.createElement("div");

    toast.className = "toast-pix";

    toast.innerHTML = `
        <div class="toast-pix-icone ${erro ? "erro" : ""}">
            <i class="fas ${erro ? "fa-times" : "fa-check"}"></i>
        </div>

        <div class="toast-pix-texto">
            <strong>${erro ? "ERRO AO COPIAR" : "PIX COPIADO"}</strong>
            <span>${mensagem}</span>
        </div>

        <button class="toast-pix-fechar" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(toast);

    // Entrada
    requestAnimationFrame(() => {
        toast.classList.add("mostrar");
    });

    // Saída automática
    setTimeout(() => {

        if (!toast.isConnected) return;

        toast.classList.remove("mostrar");

        setTimeout(() => {
            if (toast.isConnected) {
                toast.remove();
            }
        }, 400);

    }, 3500);
}

// =========================
// CONTROLE DE FLUXO
// =========================

async function registrarFluxo(tipo) {

    try {

        await fetch("/api/fluxo", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                tipo: tipo
            })

        });

        carregarFluxo();

    } catch (erro) {

        console.log("Erro ao registrar fluxo:", erro);

    }

}

async function carregarFluxo() {

    try {

        const resposta = await fetch("/api/fluxo");

        if (!resposta.ok) return;

        const dados = await resposta.json();

        document.getElementById("fluxoAcessos").textContent =
            dados.acessos || 0;

        document.getElementById("fluxoFigurinhas").textContent =
            dados.baixarFigurinhas || 0;

        document.getElementById("fluxoPix").textContent =
            dados.copiarPix || 0;

        document.getElementById("fluxoChave").textContent =
            dados.copiarChavePix || 0;

        document.getElementById("fluxoYoutube").textContent =
            dados.youtube || 0;

        document.getElementById("fluxoInstagram").textContent =
            dados.instagram || 0;

        document.getElementById("fluxoFacebook").textContent =
            dados.facebook || 0;

        document.getElementById("fluxoTiktok").textContent =
            dados.tiktok || 0;

        document.getElementById("fluxoCurso").textContent =
            dados.curso || 0;

    } catch (erro) {

        console.log(
            "Erro carregando fluxo:",
            erro
        );

    }

}

function montarCarrossel(id, videos){

const area=document.getElementById(id);


area.innerHTML="";


videos.forEach(video=>{


const div=document.createElement("div");


div.className="short";


div.innerHTML=`

<div class="imagem-video">

<img src="${video.imagem}">

<button class="assistir">
▶ Assistir
</button>

</div>


<p>
${video.titulo.substring(0,55)}...
</p>


<div class="views">

👁 ${video.views || "Muitas"} visualizações

</div>

`;



div.onclick=()=>{

window.open(
`https://youtube.com/watch?v=${video.id}`,
"_blank"
);

};



area.appendChild(div);


});


}

function moverCarrossel(id, direcao){

const area=document.getElementById(id);


area.scrollBy({

left: direcao * 300,

behavior:"smooth"

});

}

function tempoComentario(data){


const agora = new Date();


const publicado = new Date(data);



const segundos = Math.floor(
(agora - publicado) / 1000
);



const minutos = Math.floor(
segundos / 60
);



const horas = Math.floor(
minutos / 60
);



const dias = Math.floor(
horas / 24
);



const semanas = Math.floor(
dias / 7
);



const meses = Math.floor(
dias / 30
);



if(segundos < 60){

return "há poucos segundos";

}


if(minutos < 60){

return `há ${minutos} minuto${minutos>1?"s":""}`;

}


if(horas < 24){

return `há ${horas} hora${horas>1?"s":""}`;

}


if(dias < 7){

return `há ${dias} dia${dias>1?"s":""}`;

}


if(semanas < 5){

return `há ${semanas} semana${semanas>1?"s":""}`;

}


return `há ${meses} mês${meses>1?"es":""}`;


}


async function carregarComentarios(){


try{


const resposta = await fetch(
"/api/comentarios"
);


const comentarios =
await resposta.json();

const novos = comentarios.filter(c =>
    !comentariosAtuais.some(
        antigo =>
            antigo.nome === c.nome &&
            antigo.texto === c.texto &&
            antigo.data === c.data
    )
);

if(novos.length){

const aviso = document.getElementById("novoComentario");

aviso.innerHTML="✨ Novo comentário recebido";

aviso.style.opacity=1;

setTimeout(()=>{

aviso.style.opacity=0;

},2500);

}

comentariosAtuais = comentarios;

const area =
document.getElementById("comentarios");



area.innerHTML="";



comentarios.forEach(c=>{

const novo = novos.some(n =>
    n.nome === c.nome &&
    n.texto === c.texto &&
    n.data === c.data
);



area.innerHTML += `


<div class="comentario ${novo ? "novo" : ""}">


<img src="${c.foto}"
style="
width:35px;
height:35px;
border-radius:50%;
vertical-align:middle;
margin-right:10px;
">


<b>${c.nome}</b>


<p>
${c.texto}
</p>

<span class="data-comentario">
${tempoComentario(c.data)}
</span>


</div>


`;


});





}catch(error){

console.log(
"ERRO COMENTARIOS:",
error
);


}


}



// ===== INIT =====


pegarInscritos();

criarVideos();

carregarComentarios();

carregarFluxo();

registrarFluxo("acessos");

// inscritos a cada 5 minutos

setInterval(()=>{

pegarInscritos();

},300000);




// vídeos a cada 3 horas

setInterval(()=>{

criarVideos();

},10800000);




// comentários a cada 30 segundos

setInterval(()=>{

carregarComentarios();

},30000);


let atual = 0;

const figurinhas = document.querySelectorAll(".figurinha");


function trocarFigurinha(){


figurinhas.forEach(fig=>{

fig.classList.remove("ativa");

});



figurinhas[atual].classList.add("ativa");



atual++;


if(atual >= figurinhas.length){

atual = 0;

}


}



trocarFigurinha();


setInterval(()=>{

trocarFigurinha();

},4000);



function abrirAbaComunidade(aba) {

    // Esconde todas as abas
    document.querySelectorAll('.aba-comunidade').forEach(function(secao) {
        secao.classList.remove('ativa');
    });

    // Remove o ativo de todos os botões
    document.querySelectorAll('.menu-comunidade-btn').forEach(function(botao) {
        botao.classList.remove('ativo');
    });

    // Abre a aba escolhida
    const secao = document.getElementById('aba-' + aba);

    if (secao) {
        secao.classList.add('ativa');
    }

    // Ativa o botão correspondente
    document.querySelectorAll('.menu-comunidade-btn').forEach(function(botao) {

        const onclick = botao.getAttribute('onclick');

        if (onclick && onclick.includes("'" + aba + "'")) {
            botao.classList.add('ativo');
        }

    });

    // Volta para o topo da comunidade
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
abrirAbaComunidade('posts');

    console.log("ABA CLICADA:", aba);
    console.log("ELEMENTO:", document.getElementById('aba-' + aba));


    console.log("ABA CLICADA:", aba);
    console.log("ELEMENTO:", document.getElementById('aba-' + aba));

let versiculoAtual = null;
function carregarVersiculoDoDia() {

    const versiculos = [
    {
        texto: "O Senhor é a minha força e o meu escudo; nele o meu coração confia.",
        referencia: "Salmos 28:7"
    },
    {
        texto: "Tudo posso naquele que me fortalece.",
        referencia: "Filipenses 4:13"
    },
    {
        texto: "O Senhor é o meu pastor; nada me faltará.",
        referencia: "Salmos 23:1"
    },
    {
        texto: "Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.",
        referencia: "Salmos 37:5"
    },
    {
        texto: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.",
        referencia: "Isaías 41:10"
    },
    {
        texto: "Buscai primeiro o Reino de Deus e a sua justiça, e todas estas coisas vos serão acrescentadas.",
        referencia: "Mateus 6:33"
    },
    {
        texto: "O Senhor pelejará por vós, e vós vos calareis.",
        referencia: "Êxodo 14:14"
    },
    {
        texto: "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.",
        referencia: "Provérbios 3:5"
    },
    {
        texto: "A minha graça te basta, porque o meu poder se aperfeiçoa na fraqueza.",
        referencia: "2 Coríntios 12:9"
    },
    {
        texto: "Sede fortes e corajosos; não temais, nem vos atemorizeis.",
        referencia: "Deuteronômio 31:6"
    },
    {
        texto: "Clama a mim, e responder-te-ei e anunciar-te-ei coisas grandes e firmes.",
        referencia: "Jeremias 33:3"
    },
    {
        texto: "Aquietai-vos e sabei que eu sou Deus.",
        referencia: "Salmos 46:10"
    },
    {
        texto: "O Senhor é bom, uma fortaleza no dia da angústia; e conhece os que nele confiam.",
        referencia: "Naum 1:7"
    },
    {
        texto: "Em paz me deito e logo adormeço, porque só tu, Senhor, me fazes repousar seguro.",
        referencia: "Salmos 4:8"
    },
    {
        texto: "O choro pode durar uma noite, mas a alegria vem pela manhã.",
        referencia: "Salmos 30:5"
    },
    {
        texto: "Deleita-te também no Senhor, e ele te concederá o que deseja o teu coração.",
        referencia: "Salmos 37:4"
    },
    {
        texto: "Porque para Deus nada será impossível.",
        referencia: "Lucas 1:37"
    },
    {
        texto: "Eu sou o caminho, e a verdade, e a vida.",
        referencia: "João 14:6"
    },
    {
        texto: "Permanecei em mim, e eu permanecerei em vós.",
        referencia: "João 15:4"
    },
    {
        texto: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.",
        referencia: "Mateus 11:28"
    },
    {
        texto: "Bem-aventurados os que têm fome e sede de justiça, porque serão fartos.",
        referencia: "Mateus 5:6"
    },
    {
        texto: "O Senhor firma os passos do homem bom e no seu caminho se compraz.",
        referencia: "Salmos 37:23"
    },
    {
        texto: "Lança o teu cuidado sobre o Senhor, e ele te susterá.",
        referencia: "Salmos 55:22"
    },
    {
        texto: "Aquele que habita no esconderijo do Altíssimo, à sombra do Onipotente descansará.",
        referencia: "Salmos 91:1"
    },
    {
        texto: "Mil cairão ao teu lado, e dez mil à tua direita, mas tu não serás atingido.",
        referencia: "Salmos 91:7"
    },
    {
        texto: "O Senhor te guardará de todo mal; ele guardará a tua alma.",
        referencia: "Salmos 121:7"
    },
    {
        texto: "O Senhor guardará a tua entrada e a tua saída, desde agora e para sempre.",
        referencia: "Salmos 121:8"
    },
    {
        texto: "Não andeis ansiosos por coisa alguma; antes, em tudo sejam conhecidas diante de Deus as vossas petições.",
        referencia: "Filipenses 4:6"
    },
    {
        texto: "E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos pensamentos.",
        referencia: "Filipenses 4:7"
    },
    {
        texto: "Sede firmes, inabaláveis e sempre abundantes na obra do Senhor.",
        referencia: "1 Coríntios 15:58"
    }
];

    // Cria um número baseado na data atual
    const hoje = new Date();

    const numeroDoDia =
        hoje.getFullYear() * 10000 +
        (hoje.getMonth() + 1) * 100 +
        hoje.getDate();

    // Escolhe o versículo do dia
    const indice = numeroDoDia % versiculos.length;

    const versiculo = versiculos[indice];
     versiculoAtual = versiculo;

    // Atualiza o texto na tela
    const textoElemento = document.getElementById('versiculoDoDia');
    const referenciaElemento = document.getElementById('referenciaVersiculo');

    if (textoElemento) {
        textoElemento.textContent = versiculo.texto;
    }

    if (referenciaElemento) {
        referenciaElemento.textContent = versiculo.referencia;
    }
}

function abrirCompartilharVersiculo() {

    const modal = document.getElementById(
        'modalCompartilharVersiculo'
    );

    if (modal) {
        modal.classList.add('aberto');

        document.body.style.overflow = 'hidden';
    }
}


function fecharCompartilharVersiculo() {

    const modal = document.getElementById(
        'modalCompartilharVersiculo'
    );

    if (modal) {
        modal.classList.remove('aberto');

        document.body.style.overflow = '';
    }
}


  function selecionarTemplateVersiculo(numero) {

    if (!versiculoAtual) {
        carregarVersiculoDoDia();
    }

    console.log("Modelo escolhido:", numero);
    console.log("Versículo:", versiculoAtual.texto);
    console.log("Referência:", versiculoAtual.referencia);

    fecharCompartilharVersiculo();

    abrirPreviewVersiculo(numero);
}

function abrirPreviewVersiculo(numero) {

    const modal = document.getElementById(
        'modalPreviewVersiculo'
    );

    const texto = document.getElementById(
        'previewVersiculoTexto'
    );

    const referencia = document.getElementById(
        'previewVersiculoReferencia'
    );

    const arte = document.getElementById(
        'previewArteVersiculo'
    );

    if (!modal || !texto || !referencia || !arte) {
        console.error("Elementos da prévia não encontrados.");
        return;
    }

    texto.textContent = versiculoAtual.texto;
    referencia.textContent = versiculoAtual.referencia;

    // Remove templates anteriores
    arte.classList.remove(
        'preview-template-1',
        'preview-template-2',
        'preview-template-3'
    );

    // Aplica o template escolhido
    arte.classList.add(
        'preview-template-' + numero
    );

    modal.classList.add('aberto');

    document.body.style.overflow = 'hidden';
}

function fecharPreviewVersiculo() {

    const modal = document.getElementById(
        'modalPreviewVersiculo'
    );

    if (modal) {
        modal.classList.remove('aberto');

        document.body.style.overflow = '';
    }
}
