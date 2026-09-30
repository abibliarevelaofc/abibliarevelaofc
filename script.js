document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTOS DE NAVEGAÇÃO
    ===================================================== */

    const lojaView = document.getElementById("lojaView");
    const lojaLinks = document.querySelectorAll(".nav-loja");
    const storeBack = document.getElementById("storeBack");

    const cursosView = document.getElementById("cursosView");
    const cursoLinks = document.querySelectorAll(".nav-cursos");
    const courseBack = document.getElementById("courseBack");

   const comunidadeView = document.getElementById("comunidadeView");
const comunidadeLinks = document.querySelectorAll(
    '[data-page="comunidade"]'
);

const bibleBackButton = document.getElementById(
    "bibleBackButton"
);

/* =====================================================
   BÍBLIA
===================================================== */

/* =====================================================
   VELOCIDADE DA ANIMAÇÃO DA BÍBLIA
   1.0 = velocidade normal
   0.5 = metade da velocidade
   1.5 = 50% mais rápida
   2.0 = duas vezes mais rápida
===================================================== */

const BIBLE_ANIMATION_SPEED = 1.0;

const bibliaView = document.getElementById("bibliaView");

const bibliaLinks = document.querySelectorAll(
    'a[href="#biblia"]'
);

const bibleSearchButton = document.getElementById(
    "bibleSearchButton"
);

const bibleSearchPanel = document.getElementById(
    "bibleSearchPanel"
);

const bibleSearchClose = document.getElementById(
    "bibleSearchClose"
);

const bibleSearchInput = document.getElementById(
    "bibleSearchInput"
);

const bibleSearchSubmit = document.getElementById(
    "bibleSearchSubmit"
);

const bibleSearchResults = document.getElementById(
    "bibleSearchResults"
);

const bibleOpenButton = document.getElementById(
    "bibleOpenButton"
);

const bibleOpeningAnimation = document.getElementById(
    "bibleOpeningAnimation"
);

const bibleVideoDesktop = document.getElementById(
    "bibleVideoDesktop"
);

const bibleVideoMobile = document.getElementById(
    "bibleVideoMobile"
);

const bibleOpeningFlash = document.getElementById(
    "bibleOpeningFlash"
);
    
const bibleReaderFullscreen =
    document.getElementById("bibleReaderFullscreen");

if (bibleReaderFullscreen) {

    bibleReaderFullscreen.addEventListener("click", () => {

        const reader =
            document.getElementById("bibleReader");

        if (!reader) return;

        const immersive =
            reader.classList.toggle("immersive");

        if (immersive) {

            bibleReaderFullscreen.innerHTML = `
                <i data-lucide="minimize"></i>
            `;

            bibleReaderFullscreen.setAttribute(
                "aria-label",
                "Voltar para leitura normal"
            );

        } else {

            bibleReaderFullscreen.innerHTML = `
                <i data-lucide="maximize"></i>
            `;

            bibleReaderFullscreen.setAttribute(
                "aria-label",
                "Entrar no modo imersivo"
            );

        }

        if (window.lucide) {
            lucide.createIcons();
        }

    });

}

/* =====================================================
   ABRIR A BÍBLIA
===================================================== */

if (bibleOpenButton) {

    bibleOpenButton.addEventListener("click", () => {

        // Autoriza o início do contador de leitura
        autorizarLeituraBiblia();

        if (!bibleOpeningAnimation) return;

        const video =
            window.innerWidth <= 600
                ? bibleVideoMobile
                : bibleVideoDesktop;


        if (!video) return;


        /* ATIVA A ANIMAÇÃO */

        bibleOpeningAnimation.classList.add("active");


        /* REMOVE O BOTÃO DA CENA */

        bibleOpenButton.style.opacity = "0";
        bibleOpenButton.style.pointerEvents = "none";


        /* DEFINE A VELOCIDADE */

        video.playbackRate = BIBLE_ANIMATION_SPEED;


        /* GARANTE QUE COMEÇA DO ZERO */

        video.currentTime = 0;


        /* REPRODUZ */

        video.play().catch(error => {

            console.error(
                "Erro ao reproduzir animação da Bíblia:",
                error
            );

        });

    });

}
/* =====================================================
   FINAL DA ANIMAÇÃO
===================================================== */

/* =====================================================
   LEITOR DA BÍBLIA — API
===================================================== */

const bibleReader = document.getElementById(
    "bibleReader"
);

const bibleVerses = document.getElementById(
    "bibleVerses"
);

const bibleCurrentBook = document.getElementById(
    "bibleCurrentBook"
);

const bibleChapterTitle = document.getElementById(
    "bibleChapterTitle"
);

const bibleChapterBook = document.getElementById(
    "bibleChapterBook"
);

const bibleCurrentReference = document.getElementById(
    "bibleCurrentReference"
);

const bibleLoading = document.getElementById(
    "bibleLoading"
);

/* =====================================================
   66 LIVROS DA BÍBLIA
===================================================== */

const BIBLE_BOOKS = [

    /* ANTIGO TESTAMENTO */

    {
        id: "genesis",
        name: "Gênesis",
        chapters: 50,
        apiId: "GEN"
    },

    {
        id: "exodus",
        name: "Êxodo",
        chapters: 40,
        apiId: "EXO"
    },

    {
        id: "leviticus",
        name: "Levítico",
        chapters: 27,
        apiId: "LEV"
    },

    {
        id: "numbers",
        name: "Números",
        chapters: 36,
        apiId: "NUM"
    },

    {
        id: "deuteronomy",
        name: "Deuteronômio",
        chapters: 34,
        apiId: "DEU"
    },

    {
        id: "joshua",
        name: "Josué",
        chapters: 24,
        apiId: "JOS"
    },

    {
        id: "judges",
        name: "Juízes",
        chapters: 21,
        apiId: "JDG"
    },

    {
        id: "ruth",
        name: "Rute",
        chapters: 4,
        apiId: "RUT"
    },

    {
        id: "1-samuel",
        name: "1 Samuel",
        chapters: 31,
        apiId: "1SA"
    },

    {
        id: "2-samuel",
        name: "2 Samuel",
        chapters: 24,
        apiId: "2SA"
    },

    {
        id: "1-kings",
        name: "1 Reis",
        chapters: 22,
        apiId: "1KI"
    },

    {
        id: "2-kings",
        name: "2 Reis",
        chapters: 25,
        apiId: "2KI"
    },

    {
        id: "1-chronicles",
        name: "1 Crônicas",
        chapters: 29,
        apiId: "1CH"
    },

    {
        id: "2-chronicles",
        name: "2 Crônicas",
        chapters: 36,
        apiId: "2CH"
    },

    {
        id: "ezra",
        name: "Esdras",
        chapters: 10,
        apiId: "EZR"
    },

    {
        id: "nehemiah",
        name: "Neemias",
        chapters: 13,
        apiId: "NEH"
    },

    {
        id: "esther",
        name: "Ester",
        chapters: 10,
        apiId: "EST"
    },

    {
        id: "job",
        name: "Jó",
        chapters: 42,
        apiId: "JOB"
    },

    {
        id: "psalms",
        name: "Salmos",
        chapters: 150,
        apiId: "PSA"
    },

    {
        id: "proverbs",
        name: "Provérbios",
        chapters: 31,
        apiId: "PRO"
    },

    {
        id: "ecclesiastes",
        name: "Eclesiastes",
        chapters: 12,
        apiId: "ECC"
    },

    {
        id: "song-of-solomon",
        name: "Cânticos",
        chapters: 8,
        apiId: "SNG"
    },

    {
        id: "isaiah",
        name: "Isaías",
        chapters: 66,
        apiId: "ISA"
    },

    {
        id: "jeremiah",
        name: "Jeremias",
        chapters: 52,
        apiId: "JER"
    },

    {
        id: "lamentations",
        name: "Lamentações",
        chapters: 5,
        apiId: "LAM"
    },

    {
        id: "ezekiel",
        name: "Ezequiel",
        chapters: 48,
        apiId: "EZK"
    },

    {
        id: "daniel",
        name: "Daniel",
        chapters: 12,
        apiId: "DAN"
    },

    {
        id: "hosea",
        name: "Oséias",
        chapters: 14,
        apiId: "HOS"
    },

    {
        id: "joel",
        name: "Joel",
        chapters: 3,
        apiId: "JOL"
    },

    {
        id: "amos",
        name: "Amós",
        chapters: 9,
        apiId: "AMO"
    },

    {
        id: "obadiah",
        name: "Obadias",
        chapters: 1,
        apiId: "OBA"
    },

    {
        id: "jonah",
        name: "Jonas",
        chapters: 4,
        apiId: "JON"
    },

    {
        id: "micah",
        name: "Miquéias",
        chapters: 7,
        apiId: "MIC"
    },

    {
        id: "nahum",
        name: "Naum",
        chapters: 3,
        apiId: "NAM"
    },

    {
        id: "habakkuk",
        name: "Habacuque",
        chapters: 3,
        apiId: "HAB"
    },

    {
        id: "zephaniah",
        name: "Sofonias",
        chapters: 3,
        apiId: "ZEP"
    },

    {
        id: "haggai",
        name: "Ageu",
        chapters: 2,
        apiId: "HAG"
    },

    {
        id: "zechariah",
        name: "Zacarias",
        chapters: 14,
        apiId: "ZEC"
    },

    {
        id: "malachi",
        name: "Malaquias",
        chapters: 4,
        apiId: "MAL"
    },


    /* NOVO TESTAMENTO */

    {
        id: "matthew",
        name: "Mateus",
        chapters: 28,
        apiId: "MAT"
    },

    {
        id: "mark",
        name: "Marcos",
        chapters: 16,
        apiId: "MRK"
    },

    {
        id: "luke",
        name: "Lucas",
        chapters: 24,
        apiId: "LUK"
    },

    {
        id: "john",
        name: "João",
        chapters: 21,
        apiId: "JHN"
    },

    {
        id: "acts",
        name: "Atos",
        chapters: 28,
        apiId: "ACT"
    },

    {
        id: "romans",
        name: "Romanos",
        chapters: 16,
        apiId: "ROM"
    },

    {
        id: "1-corinthians",
        name: "1 Coríntios",
        chapters: 16,
        apiId: "1CO"
    },

    {
        id: "2-corinthians",
        name: "2 Coríntios",
        chapters: 13,
        apiId: "2CO"
    },

    {
        id: "galatians",
        name: "Gálatas",
        chapters: 6,
        apiId: "GAL"
    },

    {
        id: "ephesians",
        name: "Efésios",
        chapters: 6,
        apiId: "EPH"
    },

    {
        id: "philippians",
        name: "Filipenses",
        chapters: 4,
        apiId: "PHP"
    },

    {
        id: "colossians",
        name: "Colossenses",
        chapters: 4,
        apiId: "COL"
    },

    {
        id: "1-thessalonians",
        name: "1 Tessalonicenses",
        chapters: 5,
        apiId: "1TH"
    },

    {
        id: "2-thessalonians",
        name: "2 Tessalonicenses",
        chapters: 3,
        apiId: "2TH"
    },

    {
        id: "1-timothy",
        name: "1 Timóteo",
        chapters: 6,
        apiId: "1TI"
    },

    {
        id: "2-timothy",
        name: "2 Timóteo",
        chapters: 4,
        apiId: "2TI"
    },

    {
        id: "titus",
        name: "Tito",
        chapters: 3,
        apiId: "TIT"
    },

    {
        id: "philemon",
        name: "Filemom",
        chapters: 1,
        apiId: "PHM"
    },

    {
        id: "hebrews",
        name: "Hebreus",
        chapters: 13,
        apiId: "HEB"
    },

    {
        id: "james",
        name: "Tiago",
        chapters: 5,
        apiId: "JAS"
    },

    {
        id: "1-peter",
        name: "1 Pedro",
        chapters: 5,
        apiId: "1PE"
    },

    {
        id: "2-peter",
        name: "2 Pedro",
        chapters: 3,
        apiId: "2PE"
    },

    {
        id: "1-john",
        name: "1 João",
        chapters: 5,
        apiId: "1JN"
    },

    {
        id: "2-john",
        name: "2 João",
        chapters: 1,
        apiId: "2JN"
    },

    {
        id: "3-john",
        name: "3 João",
        chapters: 1,
        apiId: "3JN"
    },

    {
        id: "jude",
        name: "Judas",
        chapters: 1,
        apiId: "JUD"
    },

    {
        id: "revelation",
        name: "Apocalipse",
        chapters: 22,
        apiId: "REV"
    }

];

/* =====================================================
   SELETORES DA BÍBLIA
===================================================== */

const bibleBookSelect = document.getElementById(
    "bibleBookSelect"
);

const bibleChapterSelect = document.getElementById(
    "bibleChapterSelect"
);



/* =====================================================
   BÍBLIA — MARCAR CAPÍTULO COMO LIDO
===================================================== */

const bibleMarkRead =
    document.getElementById("bibleMarkRead");

const BIBLE_PROGRESS_KEY =
    "bibleReadingProgress";

    // =====================================================
// BÍBLIA — DESTAQUES DE VERSÍCULOS
// =====================================================

let destaquesBiblia = [];

const CORES_DESTAQUE_BIBLIA = {
    amarelo: "#f4d35e",
    azul: "#63a8ff",
    verde: "#6fd08c",
    roxo: "#b58cff"
};

function obterDestaqueBiblia(capitulo, versiculo) {
    return destaquesBiblia.find(
        destaque =>
            destaque.capitulo === capitulo &&
            Number(destaque.versiculo) === Number(versiculo)
    );
}

// =====================================================
// CARREGAR DESTAQUES DA BÍBLIA
// =====================================================

async function carregarDestaquesBiblia() {

    const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

    if (!token) {
        console.warn(
            "Bíblia: usuário não está autenticado para carregar destaques."
        );
        return;
    }

    try {

        const resposta = await fetch(
            "http://localhost:3000/api/biblia/destaques",
            {
                method: "GET",

                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const dados = await resposta.json();

        if (!dados.sucesso) {
            console.warn(
                "Bíblia: não foi possível carregar os destaques.",
                dados.mensagem
            );
            return;
        }

        destaquesBiblia =
            Array.isArray(dados.destaquesBiblia)
                ? dados.destaquesBiblia
                : [];

        console.log(
            "Bíblia: destaques carregados do MongoDB.",
            destaquesBiblia
        );

    } catch (error) {

        console.error(
            "Bíblia: erro ao carregar destaques:",
            error
        );
    }
}

// =====================================================
// PALETA DE DESTAQUE DO VERSÍCULO
// =====================================================

let versiculoSelecionadoDestaque = null;

function fecharPaletaDestaque() {
    const paletaExistente =
        document.querySelector(
            ".bible-highlight-palette"
        );

    if (paletaExistente) {
        paletaExistente.remove();
    }

    versiculoSelecionadoDestaque = null;
}


function abrirPaletaDestaque(article, capitulo, versiculo) {

    fecharPaletaDestaque();

    versiculoSelecionadoDestaque = {
        article,
        capitulo,
        versiculo
    };

    const paleta =
        document.createElement("div");

    paleta.className =
        "bible-highlight-palette";

    paleta.style.cssText = `
        position: absolute;
        left: 50%;
        top: calc(100% + 8px);
        transform: translateX(-50%);

        display: flex;
        align-items: center;
        gap: 8px;

        width: max-content;
        padding: 8px 10px;

        background: rgba(28, 25, 22, 0.98);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 14px;

        box-shadow: 0 10px 30px rgba(0,0,0,0.5);

        z-index: 9999;
    `;

    const cores = [
        {
            nome: "amarelo",
            cor: "#f4d35e"
        },
        {
            nome: "azul",
            cor: "#63a8ff"
        },
        {
            nome: "verde",
            cor: "#6fd08c"
        },
        {
            nome: "roxo",
            cor: "#b58cff"
        }
    ];

    cores.forEach(item => {

        const botao =
            document.createElement("button");

        botao.type = "button";

        botao.className =
            "bible-highlight-color";

        botao.dataset.cor =
            item.nome;

        botao.style.cssText = `
            width: 28px;
            height: 28px;

            padding: 0;

            border: 2px solid rgba(255,255,255,0.65);
            border-radius: 50%;

            background: ${item.cor};

            cursor: pointer;

            flex-shrink: 0;
        `;

        botao.setAttribute(
            "aria-label",
            `Destacar de ${item.nome}`
        );

        botao.addEventListener(
            "click",
            async event => {

                event.stopPropagation();

                const corSelecionada =
                    event.currentTarget.dataset.cor;

                const token =
                    localStorage.getItem("token") ||
                    sessionStorage.getItem("token");

                if (!token) {

                    console.warn(
                        "Bíblia: usuário não está autenticado."
                    );

                    return;
                }

                try {

                    const resposta =
                        await fetch(
                            "http://localhost:3000/api/biblia/destaque",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        `Bearer ${token}`
                                },

                                body: JSON.stringify({
                                    capitulo:
                                        capitulo,

                                    versiculo:
                                        Number(versiculo),

                                    cor:
                                        corSelecionada
                                })
                            }
                        );

                    const dados =
                        await resposta.json();

                    if (!dados.sucesso) {

                        console.warn(
                            "Bíblia:",
                            dados.mensagem
                        );

                        return;
                    }

                    destaquesBiblia =
                        Array.isArray(
                            dados.destaquesBiblia
                        )
                            ? dados.destaquesBiblia
                            : [];

                    article.classList.add(
                        "is-highlighted"
                    );

                    article.dataset.highlightColor =
                        corSelecionada;

                    fecharPaletaDestaque();

                    console.log(
                        "Bíblia: destaque salvo no MongoDB.",
                        {
                            capitulo,
                            versiculo,
                            cor: corSelecionada
                        }
                    );

                } catch (error) {

                    console.error(
                        "Bíblia: erro ao salvar destaque:",
                        error
                    );
                }

            }
        );

        paleta.appendChild(botao);

    });


    const remover =
        document.createElement("button");

    remover.type = "button";

    remover.className =
        "bible-highlight-remove";

    remover.style.cssText = `
        width: 28px;
        height: 28px;

        padding: 0;

        margin-left: 3px;

        border-radius: 50%;
        border: 1px solid rgba(255,255,255,0.18);

        background: rgba(255,255,255,0.10);
        color: white;

        display: flex;
        align-items: center;
        justify-content: center;

        cursor: pointer;
    `;

    remover.innerHTML =
        `<i data-lucide="eraser"></i>`;

    remover.setAttribute(
        "aria-label",
        "Remover destaque"
    );

    paleta.appendChild(remover);

    article.appendChild(paleta);

    if (window.lucide) {
        lucide.createIcons();
    }

}

/* =====================================================
   RECUPERAR PROGRESSO
===================================================== */

function obterProgressoBiblia() {

    try {

        return JSON.parse(
            localStorage.getItem(
                BIBLE_PROGRESS_KEY
            )
        ) || [];

    } catch (error) {

        console.error(
            "Erro ao recuperar progresso da Bíblia:",
            error
        );

        return [];

    }

}


/* =====================================================
   SALVAR PROGRESSO
===================================================== */

function salvarProgressoBiblia(
    capitulosLidos
)


{
console.log("CAPÍTULOS LIDOS DEPOIS:", capitulosLidos);

    localStorage.setItem(
        BIBLE_PROGRESS_KEY,
        JSON.stringify(capitulosLidos)
    );

}



/* =====================================================
   IDENTIFICAR CAPÍTULO ATUAL
===================================================== */

function obterCapituloAtualBiblia() {

    if (
        !bibleBookSelect ||
        !bibleChapterSelect
    ) {
        return null;
    }


    const livro =
        bibleBookSelect.value;

    const capitulo =
        Number(
            bibleChapterSelect.value
        );


    if (
        !livro ||
        !capitulo
    ) {
        return null;
    }


    /*
       Exemplo:

       genesis-1
       genesis-2
       john-3
       psalms-23
    */

    return `${livro}-${capitulo}`;

}


/* =====================================================
   ATUALIZAR BOTÃO
===================================================== */

function atualizarBotaoMarcarLido() {

    if (!bibleMarkRead) return;


    const capituloAtual =
        obterCapituloAtualBiblia();


    if (!capituloAtual) return;


    const capitulosLidos =
        obterProgressoBiblia();


    const span =
        bibleMarkRead.querySelector("span");


    const estaLido =
        capitulosLidos.includes(
            capituloAtual
        );


    if (estaLido) {

        bibleMarkRead.classList.add(
            "is-read"
        );


        if (span) {

            span.textContent =
                "LIDO";

        }


        bibleMarkRead.setAttribute(
            "aria-label",
            "Capítulo marcado como lido"
        );


    } else {

        bibleMarkRead.classList.remove(
            "is-read"
        );


        if (span) {

            span.textContent =
                "MARCAR COMO LIDO";

        }


        bibleMarkRead.setAttribute(
            "aria-label",
            "Marcar capítulo como lido"
        );

    }


    if (window.lucide) {

        lucide.createIcons();

    }

}

/* =====================================================
   ATUALIZAR PORCENTAGEM
===================================================== */

function atualizarProgressoLeituraBiblia() {

    const capitulosLidos =
        obterProgressoBiblia();


    const totalCapitulos =
        BIBLE_BOOKS.reduce(
            (total, livro) =>
                total + livro.chapters,
            0
        );


    const porcentagem =
        Math.min(
            100,
            Math.round(
                (
                    capitulosLidos.length /
                    totalCapitulos
                ) * 100
            )
        );


    console.log(
        `Progresso da Bíblia: ${porcentagem}%`
    );


    /* =================================================
       TEXTO DA PORCENTAGEM
    ================================================= */

    const progressoTexto =
        document.getElementById(
            "bibleProgressText"
        );


    if (progressoTexto) {

        progressoTexto.textContent =
            `${porcentagem}%`;

    }


    /* =================================================
       PREENCHIMENTO DA BARRA
    ================================================= */

    const progressoFill =
        document.getElementById(
            "bibleProgressFill"
        );


    if (progressoFill) {

        progressoFill.style.width =
            `${porcentagem}%`;

    }

}


/* =====================================================
   CLIQUE — MARCAR COMO LIDO
===================================================== */

if (bibleMarkRead) {

    bibleMarkRead.addEventListener(
        "click",
        async () => {

            const capituloAtual =
                obterCapituloAtualBiblia();

            if (!capituloAtual) return;

            const token =
                localStorage.getItem("token") ||
                sessionStorage.getItem("token");

            if (!token) {

                console.warn(
                    "Bíblia: usuário não está autenticado."
                );

                return;
            }

            try {

                const resposta =
                    await fetch(
                        "http://localhost:3000/api/biblia/marcar-lido",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: JSON.stringify({
                                capitulo:
                                    capituloAtual
                            })
                        }
                    );

                const dados =
                    await resposta.json();

                if (!dados.sucesso) {

                    console.warn(
                        "Bíblia:",
                        dados.mensagem
                    );

                    return;
                }

                console.log(
                    "Bíblia: capítulo sincronizado com MongoDB.",
                    dados
                );

                /*
                   Atualiza o progresso local
                   usando o que veio do servidor.
                */

                salvarProgressoBiblia(
                    dados.capitulosBiblia
                );

                /*
                   Atualiza botão
                */

                atualizarBotaoMarcarLido();

                /*
                   Atualiza porcentagem
                */

                atualizarProgressoLeituraBiblia();

            } catch (error) {

                console.error(
                    "Bíblia: erro ao sincronizar capítulo:",
                    error
                );
            }

        }
    );

}


/* =====================================================
   INICIALIZAR PROGRESSO
===================================================== */

atualizarBotaoMarcarLido();

atualizarProgressoLeituraBiblia();


/* =====================================================
   PREENCHER LIVROS
===================================================== */

function preencherLivrosBiblia() {

    if (!bibleBookSelect) return;

    bibleBookSelect.innerHTML = "";

    BIBLE_BOOKS.forEach(book => {

        const option =
            document.createElement("option");

        option.value = book.id;

        option.textContent = book.name;

        bibleBookSelect.appendChild(option);

    });

}


/* =====================================================
   PREENCHER CAPÍTULOS
===================================================== */

function preencherCapitulosBiblia(livroId) {

    if (!bibleChapterSelect) return;

    const livro =
        BIBLE_BOOKS.find(
            book => book.id === livroId
        );

    if (!livro) return;

    bibleChapterSelect.innerHTML = "";

    for (
        let numero = 1;
        numero <= livro.chapters;
        numero++
    ) {

        const option =
            document.createElement("option");

        option.value = numero;

        option.textContent = numero;

        bibleChapterSelect.appendChild(
            option
        );

    }

}


/* =====================================================
   INICIALIZAR SELETORES
===================================================== */

preencherLivrosBiblia();

preencherCapitulosBiblia("genesis");

carregarDestaquesBiblia();


/* =====================================================
   TROCAR LIVRO
===================================================== */

if (bibleBookSelect) {

    bibleBookSelect.addEventListener(
        "change",
        () => {

            const livroId =
                bibleBookSelect.value;

            preencherCapitulosBiblia(
                livroId
            );

            bibleChapterSelect.value = "1";

            carregarCapituloBiblia(
                livroId,
                1
            );

        }
    );

}


/* =====================================================
   TROCAR CAPÍTULO
===================================================== */

if (bibleChapterSelect) {

    bibleChapterSelect.addEventListener(
        "change",
        () => {

            const livroId =
                bibleBookSelect.value;

            const capitulo =
                Number(
                    bibleChapterSelect.value
                );

            carregarCapituloBiblia(
                livroId,
                capitulo
            );

            atualizarBotaoMarcarLido();

        }
    );

}

/* =====================================================
   NAVEGAÇÃO ENTRE CAPÍTULOS
===================================================== */

const biblePreviousChapter =
    document.getElementById(
        "biblePreviousChapter"
    );

const bibleNextChapter =
    document.getElementById(
        "bibleNextChapter"
    );


/* =====================================================
   ATUALIZAR ESTADO DOS BOTÕES
===================================================== */

function atualizarNavegacaoBiblia() {

    if (
        !bibleBookSelect ||
        !bibleChapterSelect
    ) {
        return;
    }


    const livroAtual =
        BIBLE_BOOKS.find(
            book =>
                book.id ===
                bibleBookSelect.value
        );


    if (!livroAtual) {
        return;
    }


    const capituloAtual =
        Number(
            bibleChapterSelect.value
        );


    const indiceLivro =
        BIBLE_BOOKS.findIndex(
            book =>
                book.id ===
                livroAtual.id
        );


    /* =================================================
       PRIMEIRO CAPÍTULO DA BÍBLIA
    ================================================= */

    const primeiroCapitulo =
        indiceLivro === 0 &&
        capituloAtual === 1;


    /* =================================================
       ÚLTIMO CAPÍTULO DA BÍBLIA
    ================================================= */

    const ultimoCapitulo =
        indiceLivro ===
            BIBLE_BOOKS.length - 1 &&
        capituloAtual ===
            livroAtual.chapters;


    if (biblePreviousChapter) {

        biblePreviousChapter.disabled =
            primeiroCapitulo;

    }


    if (bibleNextChapter) {

        bibleNextChapter.disabled =
            ultimoCapitulo;

    }

}


/* =====================================================
   PRÓXIMO CAPÍTULO
===================================================== */

if (bibleNextChapter) {

    bibleNextChapter.addEventListener(
        "click",
        () => {

            if (
                !bibleBookSelect ||
                !bibleChapterSelect
            ) {
                return;
            }


            const livroAtual =
                BIBLE_BOOKS.find(
                    book =>
                        book.id ===
                        bibleBookSelect.value
                );


            if (!livroAtual) {
                return;
            }


            const indiceLivro =
                BIBLE_BOOKS.findIndex(
                    book =>
                        book.id ===
                        livroAtual.id
                );


            const capituloAtual =
                Number(
                    bibleChapterSelect.value
                );


            /* =============================================
               PRÓXIMO CAPÍTULO DO MESMO LIVRO
            ============================================= */

            if (
                capituloAtual <
                livroAtual.chapters
            ) {

                const proximoCapitulo =
                    capituloAtual + 1;

                bibleChapterSelect.value =
                    String(
                        proximoCapitulo
                    );

                carregarCapituloBiblia(
                    livroAtual.id,
                    proximoCapitulo
                );
atualizarBotaoMarcarLido();
            }

            /* =============================================
               PRÓXIMO LIVRO
            ============================================= */

            else if (
                indiceLivro <
                BIBLE_BOOKS.length - 1
            ) {

                const proximoLivro =
                    BIBLE_BOOKS[
                        indiceLivro + 1
                    ];


                bibleBookSelect.value =
                    proximoLivro.id;


                preencherCapitulosBiblia(
                    proximoLivro.id
                );


                bibleChapterSelect.value =
                    "1";


                carregarCapituloBiblia(
                    proximoLivro.id,
                    1
                );

            }


            atualizarNavegacaoBiblia();
            atualizarBotaoMarcarLido();
        }
    );

}


/* =====================================================
   CAPÍTULO ANTERIOR
===================================================== */

if (biblePreviousChapter) {

    biblePreviousChapter.addEventListener(
        "click",
        () => {

            if (
                !bibleBookSelect ||
                !bibleChapterSelect
            ) {
                return;
            }


            const livroAtual =
                BIBLE_BOOKS.find(
                    book =>
                        book.id ===
                        bibleBookSelect.value
                );


            if (!livroAtual) {
                return;
            }


            const indiceLivro =
                BIBLE_BOOKS.findIndex(
                    book =>
                        book.id ===
                        livroAtual.id
                );


            const capituloAtual =
                Number(
                    bibleChapterSelect.value
                );


            /* =============================================
               CAPÍTULO ANTERIOR DO MESMO LIVRO
            ============================================= */

            if (
                capituloAtual > 1
            ) {

                const capituloAnterior =
                    capituloAtual - 1;


                bibleChapterSelect.value =
                    String(
                        capituloAnterior
                    );


                carregarCapituloBiblia(
                    livroAtual.id,
                    capituloAnterior
                );
atualizarBotaoMarcarLido();
            }

            /* =============================================
               LIVRO ANTERIOR
            ============================================= */

            else if (
                indiceLivro > 0
            ) {

                const livroAnterior =
                    BIBLE_BOOKS[
                        indiceLivro - 1
                    ];


                bibleBookSelect.value =
                    livroAnterior.id;


                preencherCapitulosBiblia(
                    livroAnterior.id
                );


                bibleChapterSelect.value =
                    String(
                        livroAnterior.chapters
                    );


                carregarCapituloBiblia(
                    livroAnterior.id,
                    livroAnterior.chapters
                );

            }

atualizarNavegacaoBiblia();
atualizarBotaoMarcarLido();

        }
    );

}
/* =====================================================
   CARREGAR CAPÍTULO
===================================================== */

/* =====================================================
   AVISO ELEGANTE DA BÍBLIA
===================================================== */

function mostrarAvisoBiblia(
    titulo,
    mensagem
) {

    const avisoExistente =
        document.getElementById(
            "bibleApiNotice"
        );

    if (avisoExistente) {
        avisoExistente.remove();
    }

    const aviso =
        document.createElement("div");

    aviso.id = "bibleApiNotice";

    aviso.innerHTML = `
        <div class="bible-api-notice-icon">
            <i data-lucide="wifi-off"></i>
        </div>

        <div class="bible-api-notice-content">
            <strong>${titulo}</strong>
            <span>${mensagem}</span>
        </div>

        <button
            type="button"
            aria-label="Fechar aviso"
            onclick="this.parentElement.remove()"
        >
            <i data-lucide="x"></i>
        </button>
    `;

    document.body.appendChild(aviso);

    if (window.lucide) {
        lucide.createIcons();
    }

    requestAnimationFrame(() => {
        aviso.classList.add("show");
    });

    setTimeout(() => {

        aviso.classList.remove("show");

        setTimeout(() => {

            if (aviso.parentElement) {
                aviso.remove();
            }

        }, 400);

    }, 4500);
}

async function carregarCapituloBiblia(
    livro = "genesis",
    capitulo = 1
) {

    if (!bibleVerses) return;


    /* =====================================================
       LOADING
    ===================================================== */

    if (bibleLoading) {
        bibleLoading.classList.add("active");
    }

    


    try {

        /* =================================================
           ENCONTRAR LIVRO
        ================================================= */

        const livroSelecionado =
            BIBLE_BOOKS.find(
                book => book.id === livro
            );

        if (!livroSelecionado) {
            throw new Error(
                "Livro da Bíblia não encontrado."
            );
        }


        /* =================================================
           ID DA API
        ================================================= */

        const bibleApiBookId =
            livroSelecionado.apiId;


        if (!bibleApiBookId) {
            throw new Error(
                `O livro "${livroSelecionado.name}" não possui ID da API.`
            );
        }


        /* =================================================
           URL ESTRUTURADA
        ================================================= */

        const url =
            `https://bible-api.com/data/almeida/${bibleApiBookId}/${capitulo}`;


        console.log(
            "Carregando Bíblia:",
            livroSelecionado.name,
            capitulo,
            bibleApiBookId
        );


        /* =================================================
           BUSCAR CAPÍTULO
        ================================================= */

        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                `Erro HTTP: ${response.status}`
            );

        }


        /* =================================================
           CONVERTER RESPOSTA
        ================================================= */

        const data =
            await response.json();


        /* =================================================
           VERIFICAR VERSÍCULOS
        ================================================= */

        if (
            !data.verses ||
            !Array.isArray(data.verses) ||
            data.verses.length === 0
        ) {

            throw new Error(
                "Nenhum versículo encontrado."
            );

        }


        /* =================================================
           ATUALIZAR CABEÇALHO
        ================================================= */

        const nomeLivro =
            livroSelecionado.name;


        if (bibleCurrentBook) {

            bibleCurrentBook.textContent =
                nomeLivro.toUpperCase();

        }

        if (bibleChapterBook) {

    bibleChapterBook.textContent =
        nomeLivro.toUpperCase();

}

        if (bibleChapterTitle) {

            bibleChapterTitle.textContent =
                capitulo;

        }


        if (bibleCurrentReference) {

            bibleCurrentReference.textContent =
                `${nomeLivro} ${capitulo}`;

        }

/* =================================================
   LIMPAR SOMENTE APÓS SUCESSO DA API
================================================= */

bibleVerses.innerHTML = "";
        /* =================================================
           RENDERIZAR VERSÍCULOS
        ================================================= */

        data.verses.forEach(
            versiculo => {

                const article =
                    document.createElement(
                        "article"
                    );

                article.className =
                    "bible-verse";

                    const capituloAtual =
    `${livro}-${capitulo}`;

const destaque =
    obterDestaqueBiblia(
        capituloAtual,
        versiculo.verse
    );

if (destaque) {
    article.classList.add(
        "is-highlighted"
    );

    article.dataset.highlightColor =
        destaque.cor;
}


                /* NÚMERO */

                const number =
                    document.createElement(
                        "span"
                    );

                number.className =
                    "bible-verse-number";

                number.textContent =
                    versiculo.verse;


                /* TEXTO */

                const text =
                    document.createElement(
                        "span"
                    );

                text.className =
                    "bible-verse-text";

                text.textContent =
                    (versiculo.text || "").trim();


                /* MONTAR VERSÍCULO */

                article.appendChild(
                    number
                );

                article.appendChild(
                    text
                );


                bibleVerses.appendChild(
                    article
                );

article.addEventListener(
    "click",
    event => {

        if (
            event.target.closest(
                ".bible-highlight-palette"
            )
        ) {
            return;
        }

        abrirPaletaDestaque(
            article,
            capituloAtual,
            Number(versiculo.verse)
        );
    }
);

            }
        );


        /* =================================================
           VOLTAR PARA O TOPO
        ================================================= */

        const textContent =
            document.getElementById(
                "bibleTextContent"
            );

        if (textContent) {

            textContent.scrollTop = 0;

        }


        /* =================================================
           ATUALIZAR ÍCONES
        ================================================= */

        if (window.lucide) {

            lucide.createIcons();

        }

atualizarNavegacaoBiblia();

} catch (error) {

    console.error(
        "Erro ao carregar Bíblia:",
        error
    );

    /* =====================================================
       MENSAGEM ELEGANTE DA API
    ===================================================== */

    mostrarAvisoBiblia(
        "Você está trocando de capítulo rápido demais.",
        "Aguarde 30 segundos antes de continuar."
    );

}

finally {

        if (bibleLoading) {

            bibleLoading.classList.remove(
                "active"
            );

        }

    }

}

/* =====================================================
   FINAL DA ANIMAÇÃO
===================================================== */

function finalizarAberturaBiblia() {

    if (!bibleOpeningAnimation) return;


    /* FLASH */

    bibleOpeningAnimation.classList.add("flash");


    /*
       Esperamos o brilho começar
       antes de revelar o leitor.
    */

    setTimeout(() => {

        /*
           Esconde a animação
        */

        bibleOpeningAnimation.classList.remove(
            "active"
        );


        /*
           Remove flash para
           poder reutilizar depois
        */

        bibleOpeningAnimation.classList.remove(
            "flash"
        );


        /*
           Esconde a Bíblia fechada
        */

        const bibleClosed =
            document.querySelector(
                ".bible-closed"
            );

        if (bibleClosed) {
            bibleClosed.style.display =
                "none";
        }


        /*
           Mostra o leitor
        */

        if (bibleReader) {
            bibleReader.classList.add(
                "active"
            );
        }


        /*
           Carrega Gênesis 1
        */

        carregarCapituloBiblia(
            "genesis",
            1
        );


        /*
           Recria os ícones
        */

        if (window.lucide) {
            lucide.createIcons();
        }

    }, 750);

}


/* =====================================================
   DESKTOP
===================================================== */

if (bibleVideoDesktop) {

    bibleVideoDesktop.addEventListener(
        "ended",
        finalizarAberturaBiblia
    );

}


/* =====================================================
   MOBILE
===================================================== */

if (bibleVideoMobile) {

    bibleVideoMobile.addEventListener(
        "ended",
        finalizarAberturaBiblia
    );

}

/* =====================================================
   BÍBLIA — VOLTAR PARA O INÍCIO
===================================================== */

if (bibleBackButton) {

    bibleBackButton.addEventListener("click", () => {

        fecharTelas();

        document
            .querySelectorAll(".main-nav a")
            .forEach(item => {
                item.classList.remove("active");
            });

        const inicioLink = document.querySelector(
            '.main-nav a[href="#inicio"]'
        );

        if (inicioLink) {
            inicioLink.classList.add("active");
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        if (window.lucide) {
            lucide.createIcons();
        }

    });

}
/* =====================================================
   FECHAR TELAS ESPECIAIS
===================================================== */

function fecharTelas() {

    document.body.classList.remove("store-open");
    document.body.classList.remove("course-open");
    document.body.classList.remove("community-open");
    document.body.classList.remove("bible-open");

    if (lojaView) {
        lojaView.classList.remove("active");
    }

    if (cursosView) {
        cursosView.classList.remove("active");
    }

    if (comunidadeView) {
        comunidadeView.classList.remove("active");
    }

    if (bibliaView) {
        bibliaView.classList.remove("active");
    }

    if (bibleSearchPanel) {
        bibleSearchPanel.classList.remove("active");
    }

}

    /* =====================================================
       INÍCIO
    ===================================================== */

    document
        .querySelectorAll('.main-nav a[href="#inicio"], .nav-inicio, [href="#inicio"]')
        .forEach(link => {

            link.addEventListener("click", event => {

                event.preventDefault();

                fecharTelas();

                document
                    .querySelectorAll(".main-nav a")
                    .forEach(item => {
                        item.classList.remove("active");
                    });

                const inicio = document.querySelector(
                    '.main-nav a[href="#inicio"]'
                );

                if (inicio) {
                    inicio.classList.add("active");
                }

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            });

        });


    /* =====================================================
       ABRIR LOJA
    ===================================================== */

    lojaLinks.forEach(link => {

        link.addEventListener("click", event => {

            event.preventDefault();

            fecharTelas();

            document.body.classList.add("store-open");

            if (lojaView) {

                void lojaView.offsetWidth;

                lojaView.classList.add("active");

            }

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    });


    /* =====================================================
       ABRIR CURSOS
    ===================================================== */

    cursoLinks.forEach(link => {

        link.addEventListener("click", event => {

            event.preventDefault();

            fecharTelas();

            document.body.classList.add("course-open");

            if (cursosView) {

                void cursosView.offsetWidth;

                cursosView.classList.add("active");

            }

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

            if (window.lucide) {
                lucide.createIcons();
            }

        });

    });


    /* =====================================================
   ABRIR COMUNIDADE
===================================================== */

comunidadeLinks.forEach(link => {

    link.addEventListener("click", event => {

        event.preventDefault();
        event.stopPropagation();

        fecharTelas();

        document.body.classList.add("community-open");

        if (comunidadeView) {
            comunidadeView.classList.add("active");
        }

        document
            .querySelectorAll(".main-nav a")
            .forEach(item => {
                item.classList.remove("active");
            });

        document
            .querySelectorAll('[data-page="comunidade"]')
            .forEach(item => {
                item.classList.add("active");
            });

        window.scrollTo(0, 0);

        if (window.lucide) {
            lucide.createIcons();
        }

    });

});

/* =====================================================
   ABRIR BÍBLIA
===================================================== */

bibliaLinks.forEach(link => {

    link.addEventListener("click", event => {

        event.preventDefault();

        fecharTelas();

        document.body.classList.add("bible-open");

        if (bibliaView) {

            void bibliaView.offsetWidth;

            bibliaView.classList.add("active");

        }

        document
            .querySelectorAll(".main-nav a")
            .forEach(item => {

                item.classList.remove("active");

            });

        document
            .querySelectorAll('a[href="#biblia"]')
            .forEach(item => {

                item.classList.add("active");

            });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        if (window.lucide) {
            lucide.createIcons();
        }

    });

});

/* =====================================================
   PESQUISA — ABRIR
===================================================== */

if (bibleSearchButton) {

    bibleSearchButton.addEventListener("click", () => {

        if (!bibleSearchPanel) return;

        bibleSearchPanel.classList.add("active");

        setTimeout(() => {

            if (bibleSearchInput) {
                bibleSearchInput.focus();
            }

        }, 300);

    });

}


/* =====================================================
   PESQUISA — FECHAR
===================================================== */

if (bibleSearchClose) {

    bibleSearchClose.addEventListener("click", () => {

        if (!bibleSearchPanel) return;

        bibleSearchPanel.classList.remove("active");

    });

}


/* =====================================================
   PESQUISA — ESC
===================================================== */

document.addEventListener("keydown", event => {

    if (
        event.key === "Escape" &&
        bibleSearchPanel &&
        bibleSearchPanel.classList.contains("active")
    ) {

        bibleSearchPanel.classList.remove("active");

    }

});


    /* =====================================================
       VOLTAR DA LOJA
    ===================================================== */

    if (storeBack) {

        storeBack.addEventListener("click", () => {

            fecharTelas();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    }


    /* =====================================================
       VOLTAR DOS CURSOS
    ===================================================== */

    if (courseBack) {

        courseBack.addEventListener("click", () => {

            fecharTelas();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    }

});


/* =====================================================
   LOJA — PRODUTOS
===================================================== */

const produtosLoja = {

    roupas: [

        {
            id: 1,

            nome: "Camiseta A Bíblia Revela",

            categoria: "ROUPAS",

            preco: "R$ 79,90",

            descricao:
                "Camiseta oficial A Bíblia Revela, criada para levar a identidade da Palavra com você.",

            imagens: [
                "assets/camiseta-1.jpg",
                "assets/camiseta-2.jpg",
                "assets/camiseta-3.jpg"
            ],

            cores: [
                {
                    nome: "Preto",
                    codigo: "#080808"
                },
                {
                    nome: "Branco",
                    codigo: "#f5f5f5"
                }
            ],

            tamanhos: [
                "P",
                "M",
                "G",
                "GG"
            ],

            link:
                "#"
        },


        {
            id: 2,

            nome: "Camiseta Fé",

            categoria: "ROUPAS",

            preco: "R$ 79,90",

            descricao:
                "Uma peça minimalista inspirada na fé, com identidade visual exclusiva.",

            imagens: [
                "assets/camiseta-fe-1.jpg",
                "assets/camiseta-fe-2.jpg"
            ],

            cores: [
                {
                    nome: "Preto",
                    codigo: "#080808"
                }
            ],

            tamanhos: [
                "P",
                "M",
                "G",
                "GG"
            ],

            link:
                "#"
        },


        {
            id: 3,

            nome: "Camiseta Palavra",

            categoria: "ROUPAS",

            preco: "R$ 79,90",

            descricao:
                "Design exclusivo A Bíblia Revela para quem deseja carregar uma mensagem de fé.",

            imagens: [
                "assets/camiseta-palavra-1.jpg",
                "assets/camiseta-palavra-2.jpg"
            ],

            cores: [
                {
                    nome: "Preto",
                    codigo: "#080808"
                },
                {
                    nome: "Branco",
                    codigo: "#f5f5f5"
                }
            ],

            tamanhos: [
                "P",
                "M",
                "G",
                "GG"
            ],

            link:
                "#"
        }

    ],


    livros: [

        {
            id: 4,

            nome: "A Bíblia Revela",

            categoria: "LIVRO",

            preco: "R$ 49,90",

            descricao:
                "Um conteúdo especial para aprofundar seu conhecimento das Escrituras.",

            imagens: [
                "assets/livro-1.jpg",
                "assets/livro-2.jpg"
            ],

            cores: [],

            tamanhos: [],

            link:
                "#"
        },


        {
            id: 5,

            nome: "Estudos Bíblicos",

            categoria: "LIVRO",

            preco: "R$ 39,90",

            descricao:
                "Material desenvolvido para quem deseja estudar a Palavra com mais profundidade.",

            imagens: [
                "assets/estudos-1.jpg",
                "assets/estudos-2.jpg"
            ],

            cores: [],

            tamanhos: [],

            link:
                "#"
        }

    ]

};


/* =====================================================
   ELEMENTOS
===================================================== */

const storeProducts =
    document.getElementById("storeProducts");

const categoryButtons =
    document.querySelectorAll(".store-category");


/* =====================================================
   RENDERIZAR PRODUTOS
===================================================== */

function renderProdutos(categoria = "roupas") {

    if (!storeProducts) return;

    const produtos =
        produtosLoja[categoria] || [];

    storeProducts.innerHTML = "";


    produtos.forEach(produto => {

        const card =
            document.createElement("article");

        card.className =
            "store-product";


        const imagem =
            produto.imagens[0];


        card.innerHTML = `

            <div class="store-product-image">

                <img
                    src="${imagem}"
                    alt="${produto.nome}"
                    loading="lazy"
                >

            </div>


            <div class="store-product-info">

                <span class="store-category-label">
                    ${produto.categoria}
                </span>

                <h2>
                    ${produto.nome}
                </h2>

                <p>
                    ${produto.descricao}
                </p>


                <div class="store-product-bottom">

                    <strong class="store-product-price">
                        ${produto.preco}
                    </strong>


                    <button
                        class="store-product-button"
                        type="button"
                        data-product-id="${produto.id}"
                    >

                        VER PRODUTO

                        <i data-lucide="arrow-up-right"></i>

                    </button>

                </div>

            </div>

        `;


        storeProducts.appendChild(card);

    });


    if (window.lucide) {
        lucide.createIcons();
    }

}


/* =====================================================
   TROCA DE CATEGORIA
===================================================== */

categoryButtons.forEach(button => {

    button.addEventListener("click", () => {

        categoryButtons.forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");


        const categoria =
            button.dataset.category;


        renderProdutos(categoria);

    });

});


/* =====================================================
   ABRIR PRODUTO
===================================================== */

document.addEventListener("click", event => {

    const button =
        event.target.closest(
            ".store-product-button"
        );


    if (!button) return;


    const id =
        Number(button.dataset.productId);


    const todosProdutos = [
        ...produtosLoja.roupas,
        ...produtosLoja.livros
    ];


    const produto =
        todosProdutos.find(
            item => item.id === id
        );


    if (!produto) return;


    abrirProduto(produto);

});


/* =====================================================
   MODAL
===================================================== */

const productModal =
    document.getElementById("productModal");

const productModalClose =
    document.getElementById(
        "productModalClose"
    );

const productModalOverlay =
    document.querySelector(
        ".product-modal-overlay"
    );


function abrirProduto(produto) {

    if (!productModal) return;


    document.getElementById(
        "productCategory"
    ).textContent =
        produto.categoria;


    document.getElementById(
        "productTitle"
    ).textContent =
        produto.nome;


    document.getElementById(
        "productPrice"
    ).textContent =
        produto.preco;


    document.getElementById(
        "productDescription"
    ).textContent =
        produto.descricao;


    /* ================================================
       IMAGEM PRINCIPAL
    ================================================= */

    const mainImage =
        document.getElementById(
            "productMainImage"
        );


    mainImage.innerHTML = `

        <img
            src="${produto.imagens[0]}"
            alt="${produto.nome}"
        >

    `;


    /* ================================================
       MINIATURAS
    ================================================= */

    const thumbnails =
        document.getElementById(
            "productThumbnails"
        );


    thumbnails.innerHTML = "";


    produto.imagens.forEach(
        (imagem, index) => {

            const thumbnail =
                document.createElement("button");

            thumbnail.className =
                "product-thumbnail" +
                (index === 0
                    ? " active"
                    : "");

            thumbnail.type =
                "button";


            thumbnail.innerHTML = `

                <img
                    src="${imagem}"
                    alt="${produto.nome}"
                >

            `;


            thumbnail.addEventListener(
                "click",
                () => {

                    mainImage.innerHTML = `

                        <img
                            src="${imagem}"
                            alt="${produto.nome}"
                        >

                    `;


                    document
                        .querySelectorAll(
                            ".product-thumbnail"
                        )
                        .forEach(item =>
                            item.classList.remove(
                                "active"
                            )
                        );


                    thumbnail.classList.add(
                        "active"
                    );

                }
            );


            thumbnails.appendChild(
                thumbnail
            );

        }
    );


    /* ================================================
       CORES
    ================================================= */

    const colors =
        document.getElementById(
            "productColors"
        );

    const colorsWrapper =
        document.getElementById(
            "productColorsWrapper"
        );


    colors.innerHTML = "";


    if (produto.cores.length === 0) {

        colorsWrapper.style.display =
            "none";

    } else {

        colorsWrapper.style.display =
            "block";


        produto.cores.forEach(
            (cor, index) => {

                const color =
                    document.createElement(
                        "button"
                    );

                color.className =
                    "product-color" +
                    (index === 0
                        ? " active"
                        : "");

                color.type =
                    "button";

                color.title =
                    cor.nome;

                color.style.background =
                    cor.codigo;


                color.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".product-color"
                            )
                            .forEach(item =>
                                item.classList.remove(
                                    "active"
                                )
                            );


                        color.classList.add(
                            "active"
                        );

                    }
                );


                colors.appendChild(
                    color
                );

            }
        );

    }


    /* ================================================
       TAMANHOS
    ================================================= */

    const sizes =
        document.getElementById(
            "productSizes"
        );

    const sizesWrapper =
        document.getElementById(
            "productSizesWrapper"
        );


    sizes.innerHTML = "";


    if (produto.tamanhos.length === 0) {

        sizesWrapper.style.display =
            "none";

    } else {

        sizesWrapper.style.display =
            "block";


        produto.tamanhos.forEach(
            (tamanho, index) => {

                const size =
                    document.createElement(
                        "button"
                    );

                size.className =
                    "product-size" +
                    (index === 0
                        ? " active"
                        : "");

                size.type =
                    "button";

                size.textContent =
                    tamanho;


                size.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".product-size"
                            )
                            .forEach(item =>
                                item.classList.remove(
                                    "active"
                                )
                            );


                        size.classList.add(
                            "active"
                        );

                    }
                );


                sizes.appendChild(
                    size
                );

            }
        );

    }


    /* ================================================
       LINK DE COMPRA
    ================================================= */

    document.getElementById(
        "productBuy"
    ).href =
        produto.link;


    /* ================================================
       ABRIR MODAL
    ================================================= */

    productModal.classList.add(
        "active"
    );

    productModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";


    if (window.lucide) {
        lucide.createIcons();
    }

}


/* =====================================================
   FECHAR MODAL
===================================================== */

function fecharProduto() {

    if (!productModal) return;


    productModal.classList.remove(
        "active"
    );

    productModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";

}


if (productModalClose) {

    productModalClose.addEventListener(
        "click",
        fecharProduto
    );

}


if (productModalOverlay) {

    productModalOverlay.addEventListener(
        "click",
        fecharProduto
    );

}


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            productModal &&
            productModal.classList.contains(
                "active"
            )
        ) {

            fecharProduto();

        }

    }
);


/* =====================================================
   PRODUTOS INICIAIS
===================================================== */

renderProdutos("roupas");

/* =====================================================
   MENU MOBILE — ABRIR / FECHAR
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const mobileMenuButton = document.querySelector(".mobile-menu");
    const mobileMenuPanel = document.getElementById("mobileMenuPanel");

    if (!mobileMenuButton || !mobileMenuPanel) return;


    /* ABRIR / FECHAR */

    mobileMenuButton.addEventListener("click", (event) => {

        event.stopPropagation();

        mobileMenuPanel.classList.toggle("show");

    });


    /* NÃO FECHAR AO CLICAR DENTRO */

    mobileMenuPanel.addEventListener("click", (event) => {

        event.stopPropagation();

    });


    /* FECHAR AO CLICAR FORA */

    document.addEventListener("click", () => {

        mobileMenuPanel.classList.remove("show");

    });


    /* FECHAR AO ESCOLHER UMA OPÇÃO */

    mobileMenuPanel.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            mobileMenuPanel.classList.remove("show");

        });

    });

});

// =====================================================
// LOOP CONTÍNUO PREMIUM - CROSSFADE DO VÍDEO
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    const video1 = document.querySelector(".hero-video-1");
    const video2 = document.querySelector(".hero-video-2");

    if (!video1 || !video2) return;

    let ativo = video1;
    let proximo = video2;
    let trocando = false;

    video1.style.opacity = "1";
    video2.style.opacity = "0";

    video1.play().catch(() => {});

    function prepararProximo() {

        if (!ativo.duration || trocando) return;

        const tempoRestante = ativo.duration - ativo.currentTime;

        // Começa a troca 3 segundos antes do final
        if (tempoRestante <= 3) {

            trocando = true;

            proximo.currentTime = 0;

            proximo.play().then(() => {

                // Crossfade verdadeiro
                proximo.style.opacity = "1";
                ativo.style.opacity = "0";

                setTimeout(() => {

                    ativo.pause();

                    const antigo = ativo;

                    ativo = proximo;
                    proximo = antigo;

                    proximo.currentTime = 0;
                    proximo.style.opacity = "0";

                    trocando = false;

                }, 3000);

            }).catch(() => {
                trocando = false;
            });
        }
    }

    video1.addEventListener("timeupdate", prepararProximo);
    video2.addEventListener("timeupdate", prepararProximo);

});


/* =====================================================
   MISSÕES — ABRIR / FECHAR
===================================================== */

const memberMissionsButton =
    document.getElementById("memberMissionsButton");

const missionsClose =
    document.getElementById("missionsClose");


/* =====================================================
   ABRIR MISSÕES
===================================================== */

if (memberMissionsButton) {

    memberMissionsButton.addEventListener("click", () => {

        document.body.classList.add("missions-open");

    });

}


/* =====================================================
   FECHAR MISSÕES
===================================================== */

if (missionsClose) {

    missionsClose.addEventListener("click", () => {

        document.body.classList.remove("missions-open");

    });

}

/* =====================================================
   MISSÃO — CARROSSEL DE NÍVEIS
===================================================== */

const missionLevelPrev =
    document.getElementById("missionLevelPrev");

const missionLevelNext =
    document.getElementById("missionLevelNext");

const missionLevel =
    document.getElementById("missionLevel");

const missionReward =
    document.getElementById("missionReward");

const bibleMissionProgress =
    document.getElementById("bibleMissionProgress");

const bibleMissionProgressText =
    document.getElementById("bibleMissionProgressText");


/* =====================================================
   NÍVEIS DA MISSÃO
===================================================== */

const bibleMissionLevels = [

    {
        level: 1,
        minutes: 10,
        reward: 15,
        label: "10 minutos"
    },

    {
        level: 2,
        minutes: 30,
        reward: 35,
        label: "30 minutos"
    },

    {
        level: 3,
        minutes: 60,
        reward: 70,
        label: "60 minutos"
    }

];


/* =====================================================
   ESTADO DA MISSÃO
===================================================== */

let currentBibleMissionLevel = 1;


/*
    Por enquanto estamos usando 0.

    Depois vamos substituir pelo tempo real
    vindo do backend.
*/
let bibleMissionMinutes = 0;
let bibleMissionCompleted = {

    nivel1: false,
    nivel2: false,
    nivel3: false

};


/* =====================================================
   CARREGAR PROGRESSO REAL DA BÍBLIA
===================================================== */

/* =====================================================
   CARREGAR PROGRESSO REAL DA BÍBLIA
===================================================== */

async function carregarProgressoMissaoBiblia() {

    try {

        const token =
            localStorage.getItem("token");


        if (!token) {

            console.log(
                "Usuário não autenticado."
            );

            return;

        }


        const resposta = await fetch(
            "http://localhost:3000/api/biblia/progresso",
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar o progresso da Bíblia."
            );

        }


        const dados =
            await resposta.json();


        console.log(
            "Progresso da Bíblia:",
            dados
        );


        // =========================================
        // TEMPO TOTAL
        // =========================================

        bibleMissionMinutes =
            dados.biblia?.tempoTotalMinutos || 0;


        // =========================================
        // MISSÕES CONCLUÍDAS
        // =========================================

        const missoesBiblia =
            dados.biblia?.missoesBiblia || {};


        bibleMissionCompleted = {

            nivel1:
                !!missoesBiblia.nivel1,

            nivel2:
                !!missoesBiblia.nivel2,

            nivel3:
                !!missoesBiblia.nivel3

        };


        console.log(
            "Minutos:",
            bibleMissionMinutes
        );


        console.log(
            "Missões concluídas:",
            bibleMissionCompleted
        );


        // =========================================
        // ATUALIZAR CARD
        // =========================================

        atualizarMissaoBiblia();


/* =====================================================
   MISSÃO — CHECK-IN DIÁRIO
===================================================== */

const checkinLevelPrev =
    document.getElementById(
        "checkinLevelPrev"
    );

const checkinLevelNext =
    document.getElementById(
        "checkinLevelNext"
    );

const checkinLevel =
    document.getElementById(
        "checkinLevel"
    );

const checkinMissionReward =
    document.getElementById(
        "checkinMissionReward"
    );

const checkinMissionProgress =
    document.getElementById(
        "checkinMissionProgress"
    );

const checkinMissionProgressText =
    document.getElementById(
        "checkinMissionProgressText"
    );

const missionCheckinButton =
    document.getElementById(
        "missionCheckinButton"
    );

const checkinMissionCard =
    document.getElementById(
        "checkinMissionCard"
    );


/* =====================================================
   NÍVEIS DO CHECK-IN
===================================================== */

const checkinLevels = [

    {
        level: 1,
        pontos: 5,
        xp: 10
    },

    {
        level: 2,
        pontos: 15,
        xp: 20
    },

    {
        level: 3,
        pontos: 20,
        xp: 30
    },

    {
        level: 4,
        pontos: 35,
        xp: 40
    },

    {
        level: 5,
        pontos: 35,
        xp: 50
    },

    {
        level: 6,
        pontos: 50,
        xp: 60
    },

    {
        level: 7,
        pontos: 70,
        xp: 70
    }

];


/* =====================================================
   ESTADO
===================================================== */

let currentCheckinLevel = 1;

let checkinDiaConcluido = 0;

let checkinJaFezHoje = false;


/* =====================================================
   ATUALIZAR VISUAL DA MISSÃO
===================================================== */

function atualizarMissaoCheckin() {

    if (!checkinLevel) {
        return;
    }

    const nivel =
        checkinLevels[
            currentCheckinLevel - 1
        ];

    if (!nivel) {
        return;
    }


    /* =================================================
       NÚMERO DO DIA
    ================================================= */

    checkinLevel.textContent =
        nivel.level;


    /* =================================================
       RECOMPENSA
    ================================================= */

    if (checkinMissionReward) {

        checkinMissionReward.innerHTML = `

            +${nivel.pontos}

            <small>
                PONTOS DA FÉ
            </small>

            <small>
                +${nivel.xp} XP
            </small>

        `;

    }


    /* =================================================
       PROGRESSO
    ================================================= */

    if (checkinMissionProgress) {

        const progresso =
            Math.min(
                (
                    checkinDiaConcluido /
                    nivel.level
                ) * 100,
                100
            );

        checkinMissionProgress.style.width =
            `${progresso}%`;

    }


    /* =================================================
       TEXTO
    ================================================= */

    if (checkinMissionProgressText) {

        if (
            checkinDiaConcluido >=
            nivel.level
        ) {

            checkinMissionProgressText.textContent =
                `Dia ${nivel.level} — CONCLUÍDO`;

        }

        else if (
            checkinDiaConcluido + 1 ===
            nivel.level
        ) {

            if (checkinJaFezHoje) {

                checkinMissionProgressText.textContent =
                    `Dia ${nivel.level} — CHECK-IN REALIZADO HOJE`;

            } else {

                checkinMissionProgressText.textContent =
                    `Dia ${nivel.level} — Faça seu check-in hoje`;

            }

        }

        else {

            checkinMissionProgressText.textContent =
                `Dia ${nivel.level} — BLOQUEADO`;

        }

    }


    /* =================================================
       SETA ESQUERDA
    ================================================= */

    if (checkinLevelPrev) {

        checkinLevelPrev.disabled =
            currentCheckinLevel <= 1;

    }


    /* =================================================
       SETA DIREITA
    ================================================= */

    if (checkinLevelNext) {

        const maiorDiaDisponivel =
            Math.min(
                checkinDiaConcluido + 1,
                7
            );

        checkinLevelNext.disabled =
            currentCheckinLevel >=
            maiorDiaDisponivel;

    }


    /* =================================================
       BOTÃO CHECK-IN
    ================================================= */

    if (missionCheckinButton) {

        const diaDisponivel =
            checkinDiaConcluido + 1;

        const podeFazerCheckin =
            currentCheckinLevel ===
            diaDisponivel &&
            !checkinJaFezHoje;


        if (podeFazerCheckin) {

            missionCheckinButton.disabled =
                false;

            missionCheckinButton.innerHTML = `

                <i data-lucide="flame"></i>

                <span>
                    FAZER CHECK-IN
                </span>

            `;

        } else {

            missionCheckinButton.disabled =
                true;

            if (checkinJaFezHoje) {

                missionCheckinButton.innerHTML = `

                    <i data-lucide="check"></i>

                    <span>
                        CHECK-IN REALIZADO
                    </span>

                `;

            } else {

                missionCheckinButton.innerHTML = `

                    <i data-lucide="lock"></i>

                    <span>
                        DIA BLOQUEADO
                    </span>

                `;

            }

        }


        /*
         * Recria os ícones Lucide
         */
        if (
            typeof lucide !== "undefined"
        ) {

            lucide.createIcons();

        }

    }

}


/* =====================================================
   SETA — DIA ANTERIOR
===================================================== */

if (checkinLevelPrev) {

    checkinLevelPrev.addEventListener(
        "click",
        () => {

            if (
                currentCheckinLevel <= 1
            ) {

                return;

            }

            currentCheckinLevel--;

            atualizarMissaoCheckin();

        }
    );

}


/* =====================================================
   SETA — PRÓXIMO DIA
===================================================== */

if (checkinLevelNext) {

    checkinLevelNext.addEventListener(
        "click",
        () => {

            const maiorDiaDisponivel =
                Math.min(
                    checkinDiaConcluido + 1,
                    7
                );


            if (
                currentCheckinLevel >=
                maiorDiaDisponivel
            ) {

                return;

            }

            currentCheckinLevel++;

            atualizarMissaoCheckin();

        }
    );

}


/* =====================================================
   REALIZAR CHECK-IN
===================================================== */

async function realizarCheckin() {

    if (!missionCheckinButton) {
        return;
    }


    const token =
        localStorage.getItem("token");


    if (!token) {

        alert(
            "Você precisa estar conectado para fazer o check-in."
        );

        return;

    }


    /*
     * Impede clique duplicado
     */

    if (
        missionCheckinButton.disabled
    ) {

        return;

    }


    missionCheckinButton.disabled =
        true;


    missionCheckinButton.innerHTML = `

        <i data-lucide="loader-circle"></i>

        <span>
            REGISTRANDO...
        </span>

    `;


    if (
        typeof lucide !== "undefined"
    ) {

        lucide.createIcons();

    }


    try {

        const resposta =
            await fetch(
                "http://localhost:3000/api/users/checkin",
                {
                    method: "POST",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    }
                }
            );


        const dados =
            await resposta.json();


        console.log(
            "Resposta do check-in:",
            dados
        );


        if (!resposta.ok) {

            throw new Error(
                dados.mensagem ||
                "Não foi possível realizar o check-in."
            );

        }


        /* =================================================
           JÁ FEZ HOJE
        ================================================= */

        if (
            dados.jaFezHoje
        ) {

            checkinJaFezHoje =
                true;

            atualizarMissaoCheckin();

            return;

        }


        /* =================================================
           CHECK-IN REALIZADO
        ================================================= */

        const diaRealizado =
            Number(
                dados.diaCheckin || 1
            );


        /*
         * O backend informa o dia que acabou
         * de ser concluído.
         */

        checkinDiaConcluido =
            diaRealizado;


        checkinJaFezHoje =
            true;


        /*
         * Mantém o card no dia realizado
         */

        currentCheckinLevel =
            diaRealizado;


        atualizarMissaoCheckin();


        /* =================================================
           MENSAGEM DE RECOMPENSA
        ================================================= */

        if (
            dados.recompensa
        ) {

            const pontos =
                dados.recompensa.pontos || 0;

            const xp =
                dados.recompensa.xp || 0;


            console.log(
                `Check-in concluído! +${pontos} Pontos da Fé e +${xp} XP.`
            );

        }


    } catch (erro) {

        console.error(
            "Erro ao realizar check-in:",
            erro
        );


        /*
         * Reativa o botão caso tenha ocorrido erro
         */

        missionCheckinButton.disabled =
            false;


        missionCheckinButton.innerHTML = `

            <i data-lucide="flame"></i>

            <span>
                FAZER CHECK-IN
            </span>

        `;


        if (
            typeof lucide !== "undefined"
        ) {

            lucide.createIcons();

        }


        alert(
            erro.message ||
            "Erro ao realizar check-in."
        );

    }

}


/* =====================================================
   EVENTO DO BOTÃO
===================================================== */

if (missionCheckinButton) {

    missionCheckinButton.addEventListener(
        "click",
        realizarCheckin
    );

}


/* =====================================================
   CARREGAR DADOS DO USUÁRIO
===================================================== */

async function carregarMissaoCheckin() {

    try {

        const token =
            localStorage.getItem("token");


        if (!token) {

            console.log(
                "Usuário não autenticado."
            );

            atualizarMissaoCheckin();

            return;

        }


        const resposta =
            await fetch(
                "http://localhost:3000/api/users/me",
                {
                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar o check-in."
            );

        }


        const dados =
            await resposta.json();


        console.log(
            "Dados do check-in:",
            dados
        );


        /*
         * Quantos dias da sequência já foram
         * concluídos.
         */

        checkinDiaConcluido =
            Number(
                dados.usuario?.checkinDia || 0
            );


        /*
         * Segurança para nunca ultrapassar 7.
         */

        if (
            checkinDiaConcluido > 7
        ) {

            checkinDiaConcluido = 7;

        }


        /* =================================================
           VERIFICAR SE JÁ FEZ CHECK-IN HOJE
        ================================================= */

        checkinJaFezHoje = false;


        if (
            dados.usuario?.ultimoCheckin
        ) {

            const ultimoCheckin =
                new Date(
                    dados.usuario.ultimoCheckin
                );

            const agora =
                new Date();


            const mesmoDia =
                ultimoCheckin.getFullYear() ===
                    agora.getFullYear() &&

                ultimoCheckin.getMonth() ===
                    agora.getMonth() &&

                ultimoCheckin.getDate() ===
                    agora.getDate();


            checkinJaFezHoje =
                mesmoDia;

        }


        /* =================================================
           DEFINIR DIA EXIBIDO
        ================================================= */

        let proximoDia;


        /*
         * Se o Dia 7 foi concluído,
         * o próximo ciclo começa no Dia 1.
         */

        if (
            checkinDiaConcluido >= 7
        ) {

            proximoDia = 1;

            checkinDiaConcluido = 0;

        } else {

            proximoDia =
                checkinDiaConcluido + 1;

        }


        /*
         * Se já fez o check-in hoje,
         * permanece mostrando o dia realizado.
         */

        if (
            checkinJaFezHoje &&
            dados.usuario?.checkinDia > 0
        ) {

            currentCheckinLevel =
                Number(
                    dados.usuario.checkinDia
                );

        } else {

            currentCheckinLevel =
                Math.min(
                    proximoDia,
                    7
                );

        }


        atualizarMissaoCheckin();


    } catch (erro) {

        console.error(
            "Erro ao carregar missão de check-in:",
            erro
        );

    }

}


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

atualizarMissaoCheckin();

carregarMissaoCheckin();



    } catch (erro) {

        console.error(
            "Erro ao carregar missão da Bíblia:",
            erro
        );

    }

}

/* =====================================================
   DESCOBRIR O MAIOR NÍVEL DESBLOQUEADO
===================================================== */

/* =====================================================
   DESCOBRIR O MAIOR NÍVEL DESBLOQUEADO
===================================================== */

function obterMaiorNivelBiblia() {

    // =========================================
    // NÍVEL 3 CONCLUÍDO
    // =========================================

    if (bibleMissionCompleted.nivel3) {
        return 3;
    }


    // =========================================
    // NÍVEL 2 CONCLUÍDO
    // =========================================

    if (bibleMissionCompleted.nivel2) {
        return 3;
    }


    // =========================================
    // NÍVEL 1 CONCLUÍDO
    // =========================================

    if (bibleMissionCompleted.nivel1) {
        return 2;
    }


    // =========================================
    // COMEÇA NO NÍVEL 1
    // =========================================

    return 1;

}


/* =====================================================
   ATUALIZAR MISSÃO
===================================================== */

function atualizarMissaoBiblia() {

    if (!missionLevel) return;


    const maiorNivelDesbloqueado =
        obterMaiorNivelBiblia();


    /*
       Impede o usuário de navegar
       para um nível ainda bloqueado.
    */

    if (
        currentBibleMissionLevel >
        maiorNivelDesbloqueado
    ) {

        currentBibleMissionLevel =
            maiorNivelDesbloqueado;

    }


    const nivel =
        bibleMissionLevels[
            currentBibleMissionLevel - 1
        ];

    if (!nivel) return;


    /* =================================================
       NÚMERO DO NÍVEL
    ================================================= */

    missionLevel.textContent =
        nivel.level;


    /* =================================================
       RECOMPENSA
    ================================================= */

    if (missionReward) {

        missionReward.innerHTML = `
            +${nivel.reward}
            <small>PONTOS</small>
        `;

    }


    /* =================================================
       PROGRESSO
    ================================================= */

    if (bibleMissionProgress) {

        const progresso =
            Math.min(
                (bibleMissionMinutes /
                nivel.minutes) * 100,
                100
            );

        bibleMissionProgress.style.width =
            `${progresso}%`;

    }


    /* =================================================
       TEXTO
    ================================================= */
const nivelConcluido =
    bibleMissionCompleted[
        `nivel${nivel.level}`
    ];


if (nivelConcluido) {

    bibleMissionProgressText.textContent =
        `Nível ${nivel.level} — CONCLUÍDO`;

} else {

    bibleMissionProgressText.textContent =
        `Nível ${nivel.level} — ${bibleMissionMinutes} / ${nivel.minutes} minutos`;

}

    

    /* =================================================
       SETA ESQUERDA
    ================================================= */

    if (missionLevelPrev) {

        missionLevelPrev.disabled =
            currentBibleMissionLevel <= 1;

    }


    /* =================================================
       SETA DIREITA
    ================================================= */

    if (missionLevelNext) {

        missionLevelNext.disabled =
            currentBibleMissionLevel >=
            maiorNivelDesbloqueado;

    }

}


/* =====================================================
   NÍVEL ANTERIOR
===================================================== */

if (missionLevelPrev) {

    missionLevelPrev.addEventListener(
        "click",
        () => {

            if (
                currentBibleMissionLevel <= 1
            ) {

                return;

            }

            currentBibleMissionLevel--;

           atualizarMissaoBiblia();

           carregarProgressoMissaoBiblia();

        }
    );

}


/* =====================================================
   PRÓXIMO NÍVEL
===================================================== */

if (missionLevelNext) {

    missionLevelNext.addEventListener(
        "click",
        () => {

            const maiorNivelDesbloqueado =
                obterMaiorNivelBiblia();


            /*
               Não permite avançar
               além do que foi desbloqueado.
            */

            if (
                currentBibleMissionLevel >=
                maiorNivelDesbloqueado
            ) {

                return;

            }


            currentBibleMissionLevel++;

            atualizarMissaoBiblia();

        }
    );

}


/* =====================================================
   INICIAR
===================================================== */

atualizarMissaoBiblia();
carregarProgressoMissaoBiblia(); 


/* =====================================================
   PRÓXIMO NÍVEL
===================================================== */

if (missionLevelNext) {

    missionLevelNext.addEventListener(
        "click",
        () => {

            if (
                currentBibleMissionLevel >=
                bibleMissionLevels.length
            ) {
                return;
            }

            currentBibleMissionLevel++;

            atualizarMissaoBiblia();

        }
    );

}


/* =====================================================
   INICIAR
===================================================== */

atualizarMissaoBiblia();


    // =====================================================
    // TEMA DA BÍBLIA
    // =====================================================

    const bibleThemeDots =
        document.querySelectorAll(".bible-theme-dot");

    const BIBLE_THEME_KEY =
        "bibleTheme";

    function aplicarTemaBiblia(tema) {

        const bibliaView =
            document.getElementById("bibliaView");

        if (!bibliaView) {
            return;
        }

        if (tema === "light") {

            bibliaView.classList.add(
                "bible-light-theme"
            );

        } else {

            bibliaView.classList.remove(
                "bible-light-theme"
            );

            tema = "dark";
        }

        bibleThemeDots.forEach(dot => {

            dot.classList.toggle(
                "active",
                dot.dataset.theme === tema
            );

        });

        localStorage.setItem(
            BIBLE_THEME_KEY,
            tema
        );
    }


    bibleThemeDots.forEach(dot => {

        dot.addEventListener(
            "click",
            () => {

                const tema =
                    dot.dataset.theme;

                aplicarTemaBiblia(tema);

            }
        );

    });


    // Recupera o último tema escolhido
    const temaSalvo =
        localStorage.getItem(BIBLE_THEME_KEY) || "dark";

    aplicarTemaBiblia(temaSalvo);



// =====================================================
// MENU DO PERFIL + MODAL DE LOGIN
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    const profileButton =
        document.getElementById("profileButton");

    const profileDropdown =
        document.getElementById("profileDropdown");

    const loginButton =
        document.getElementById("loginButton");

    const loginModal =
        document.getElementById("loginModal");

    const loginClose =
        document.getElementById("loginClose");


    // =================================================
    // VERIFICAR MENU
    // =================================================

    if (!profileButton || !profileDropdown) {

        console.warn(
            "Menu do perfil: elementos não encontrados."
        );

        return;
    }


    // =================================================
    // ABRIR / FECHAR MENU DO PERFIL
    // =================================================

    profileButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            profileDropdown.classList.toggle(
                "active"
            );

        }
    );


    // =================================================
    // CLIQUE DENTRO DO MENU
    // =================================================

    profileDropdown.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

        }
    );


    // =================================================
    // BOTÃO ENTRAR
    // =================================================

    if (loginButton && loginModal) {

        loginButton.addEventListener(
            "click",
            () => {

                profileDropdown.classList.remove(
                    "active"
                );

                loginModal.classList.add(
                    "active"
                );

                document.body.style.overflow =
                    "hidden";

            }
        );

    }


    // =================================================
    // FECHAR MODAL PELO X
    // =================================================

    if (loginClose && loginModal) {

        loginClose.addEventListener(
            "click",
            () => {

                loginModal.classList.remove(
                    "active"
                );

                document.body.style.overflow =
                    "";

            }
        );

    }


    // =================================================
    // CLICAR FORA DO MENU
    // =================================================

    document.addEventListener(
        "click",
        () => {

            profileDropdown.classList.remove(
                "active"
            );

        }
    );


    // =================================================
    // CLICAR NO FUNDO DO MODAL
    // =================================================

    if (loginModal) {

        loginModal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target === loginModal
                ) {

                    loginModal.classList.remove(
                        "active"
                    );

                    document.body.style.overflow =
                        "";

                }

            }
        );

    }

});


// =====================================================
// AUTENTICAÇÃO — LOGIN + CADASTRO + JWT
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    // =================================================
    // ELEMENTOS
    // =================================================

    const loginForm =
        document.getElementById("loginForm");

    const loginEmail =
        document.getElementById("loginEmail");

    const loginSenha =
        document.getElementById("loginSenha");

    const registerNome =
        document.getElementById("registerNome");

    const registerNameField =
        document.getElementById("registerNameField");

    const loginMessage =
        document.getElementById("loginMessage");

    const loginSubmit =
        document.getElementById("loginSubmit");

    const loginModal =
        document.getElementById("loginModal");

    const authTitle =
        document.getElementById("authTitle");

    const authSubtitle =
        document.getElementById("authSubtitle");

    const authSwitchText =
        document.getElementById("authSwitchText");

    const authSwitchButton =
        document.getElementById("authSwitchButton");


    // =================================================
    // VERIFICAR FORMULÁRIO
    // =================================================

    if (!loginForm) {

        console.warn(
            "Autenticação: formulário não encontrado."
        );

        return;
    }


    // =================================================
    // MODO
    // false = LOGIN
    // true  = CADASTRO
    // =================================================

    let modoCadastro = false;


    // =================================================
    // MENSAGEM
    // =================================================

    function mostrarMensagem(
        mensagem,
        sucesso = false
    ) {

        if (!loginMessage) {
            return;
        }

        loginMessage.textContent =
            mensagem;

        loginMessage.style.color =
            sucesso
                ? "#6ee7a0"
                : "#ff7676";

    }


    function limparMensagem() {

        if (!loginMessage) {
            return;
        }

        loginMessage.textContent = "";

        loginMessage.style.color = "";

    }


    // =================================================
    // ATUALIZAR ÍCONES
    // =================================================

    function atualizarIcones() {

        if (
            typeof lucide !== "undefined"
        ) {

            lucide.createIcons();

        }

    }


    // =================================================
    // ATUALIZAR BOTÃO PRINCIPAL
    // =================================================

    function atualizarBotao() {

        if (!loginSubmit) {
            return;
        }

        loginSubmit.innerHTML = `
            <span class="login-submit-text">
                ${modoCadastro
                    ? "Criar conta"
                    : "Entrar"
                }
            </span>

            <i
                data-lucide="arrow-right"
                class="login-submit-icon"
            ></i>
        `;

        atualizarIcones();

    }


    // =================================================
    // ALTERAR LOGIN / CADASTRO
    // =================================================

    function atualizarModo() {

        limparMensagem();

        loginForm.reset();


        // =================================================
        // CADASTRO
        // =================================================

        if (modoCadastro) {

            authTitle.textContent =
                "Criar conta";

            authSubtitle.textContent =
                "Crie sua conta para participar.";

            registerNameField.classList.add(
                "auth-visible"
            );

            registerNome.required =
                true;

            authSwitchText.textContent =
                "Já possui uma conta?";

            authSwitchButton.textContent =
                "Entrar";

            loginSenha.setAttribute(
                "autocomplete",
                "new-password"
            );


        // =================================================
        // LOGIN
        // =================================================

        } else {

            authTitle.textContent =
                "Entrar";

            authSubtitle.textContent =
                "Entre na sua conta para continuar.";

            registerNameField.classList.remove(
                "auth-visible"
            );

            registerNome.required =
                false;

            authSwitchText.textContent =
                "Ainda não tem uma conta?";

            authSwitchButton.textContent =
                "Criar conta";

            loginSenha.setAttribute(
                "autocomplete",
                "current-password"
            );

        }


        atualizarBotao();

    }


    // =================================================
    // BOTÃO ALTERNAR LOGIN / CADASTRO
    // =================================================

    if (authSwitchButton) {

        authSwitchButton.addEventListener(
            "click",
            () => {

                modoCadastro =
                    !modoCadastro;

                atualizarModo();

            }
        );

    }


    // =================================================
    // FECHAR MODAL
    // =================================================

    function fecharModal() {

        if (loginModal) {

            loginModal.classList.remove(
                "active"
            );

        }

        document.body.style.overflow =
            "";

        loginForm.reset();

        limparMensagem();

        modoCadastro = false;

        atualizarModo();

    }


    // =================================================
    // ENVIO DO FORMULÁRIO
    // =================================================

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            limparMensagem();


            // =============================================
            // DADOS
            // =============================================

            const email =
                loginEmail.value.trim();

            const senha =
                loginSenha.value;

            let nome = "";


            // =============================================
            // VALIDAR EMAIL
            // =============================================

            if (!email) {

                mostrarMensagem(
                    "Digite seu email."
                );

                loginEmail.focus();

                return;

            }


            // =============================================
            // VALIDAR SENHA
            // =============================================

            if (!senha) {

                mostrarMensagem(
                    "Digite sua senha."
                );

                loginSenha.focus();

                return;

            }


            // =============================================
            // VALIDAR CADASTRO
            // =============================================

            if (modoCadastro) {

                nome =
                    registerNome.value.trim();


                if (!nome) {

                    mostrarMensagem(
                        "Digite seu nome."
                    );

                    registerNome.focus();

                    return;

                }


                if (nome.length < 2) {

                    mostrarMensagem(
                        "Digite um nome válido."
                    );

                    registerNome.focus();

                    return;

                }


                if (senha.length < 6) {

                    mostrarMensagem(
                        "A senha deve ter pelo menos 6 caracteres."
                    );

                    loginSenha.focus();

                    return;

                }

            }


            // =============================================
            // BLOQUEAR BOTÃO
            // =============================================

            loginSubmit.disabled =
                true;

            loginSubmit.innerHTML = `
                <span class="login-submit-text">
                    ${modoCadastro
                        ? "Criando conta..."
                        : "Entrando..."
                    }
                </span>
            `;


          try {

    // =========================================
    // ROTA
    // =========================================

    const API_URL = "https://abibliarevelaofc.vercel.app";

    const rota =
        modoCadastro
            ? `${API_URL}/api/users/register`
            : `${API_URL}/api/users/login`;
                // =========================================
                // CORPO
                // =========================================

                const corpo =
                    modoCadastro
                        ? {
                            nome: nome,
                            email: email,
                            senha: senha
                        }
                        : {
                            email: email,
                            senha: senha
                        };


                // =========================================
                // REQUEST
                // =========================================

                const resposta =
                    await fetch(
                        rota,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    corpo
                                )
                        }
                    );


                // =========================================
                // RESPOSTA
                // =========================================

                let dados = {};

                try {

                    dados =
                        await resposta.json();

                } catch (erro) {

                    console.error(
                        "Resposta não é JSON:",
                        erro
                    );

                }


                // =========================================
                // ERRO HTTP
                // =========================================

                if (!resposta.ok) {

                    mostrarMensagem(
                        dados.mensagem ||
                        dados.message ||
                        (
                            modoCadastro
                                ? "Não foi possível criar a conta."
                                : "Email ou senha incorretos."
                        )
                    );

                    return;

                }


                // =================================================
                // CADASTRO
                // =================================================

                if (modoCadastro) {

                    if (!dados.token) {

                        mostrarMensagem(
                            dados.mensagem ||
                            "Conta criada, mas o servidor não retornou o token."
                        );

                        return;

                    }


                    salvarSessao(
                        dados.token,
                        dados.usuario
                    );


                    mostrarMensagem(
                        "Conta criada com sucesso!",
                        true
                    );


                    setTimeout(
                        () => {

                            fecharModal();

                            atualizarPerfilLogado(
                                dados.usuario
                            );

                        },
                        700
                    );


                    return;

                }


                // =================================================
                // LOGIN
                // =================================================

                if (!dados.token) {

                    mostrarMensagem(
                        "O servidor não retornou o token."
                    );

                    return;

                }


                // =============================================
                // SALVAR JWT
                // =============================================

                salvarSessao(
                    dados.token,
                    dados.usuario
                );


                mostrarMensagem(
                    "Login realizado com sucesso!",
                    true
                );


                // =============================================
                // FECHAR MODAL
                // =============================================

                setTimeout(
                    () => {

                        fecharModal();

                        atualizarPerfilLogado(
                            dados.usuario
                        );

                    },
                    700
                );


            } catch (erro) {

                console.error(
                    "ERRO DE AUTENTICAÇÃO:",
                    erro
                );

                mostrarMensagem(
                    "Não foi possível conectar ao servidor."
                );


            } finally {

                setTimeout(
                    () => {

                        loginSubmit.disabled =
                            false;

                        atualizarBotao();

                    },
                    700
                );

            }

        }
    );


    // =================================================
    // SALVAR SESSÃO
    // =================================================

    function salvarSessao(
        token,
        usuario
    ) {

        if (!token) {

            console.warn(
                "Tentativa de salvar sessão sem token."
            );

            return;
        }


        localStorage.setItem(
            "token",
            token
        );


        if (usuario) {

            localStorage.setItem(
                "usuario",
                JSON.stringify(
                    usuario
                )
            );

        }

    }


    // =================================================
    // ATUALIZAR PERFIL LOGADO
    // =================================================

    function atualizarPerfilLogado(
        usuario
    ) {

        if (!usuario) {
            return;
        }


        const profileButton =
            document.getElementById(
                "profileButton"
            );


        if (!profileButton) {
            return;
        }


        // =============================================
        // NOME
        // =============================================

        const profileName =
            profileButton.querySelector(
                ".profile-text strong"
            );


        if (profileName) {

            profileName.textContent =
                usuario.nome ||
                usuario.name ||
                "Usuário";

        }


        // =============================================
        // FOTO
        // =============================================

        const profilePhoto =
            profileButton.querySelector(
                ".profile-photo"
            );


        if (
            profilePhoto &&
            usuario.foto
        ) {

            profilePhoto.innerHTML = `
                <img
                    src="${usuario.foto}"
                    alt="${usuario.nome || "Usuário"}"
                >
            `;


            profilePhoto.classList.remove(
                "image-placeholder"
            );

        }


        atualizarIcones();

    }


    // =================================================
    // RESTAURAR SESSÃO
    // =================================================

    async function restaurarSessao() {

        const token =
            localStorage.getItem(
                "token"
            );

        const usuarioSalvo =
            localStorage.getItem(
                "usuario"
            );


        // =============================================
        // USUÁRIO SALVO
        // =============================================

        if (usuarioSalvo) {

            try {

                const usuario =
                    JSON.parse(
                        usuarioSalvo
                    );

                atualizarPerfilLogado(
                    usuario
                );

            } catch (erro) {

                localStorage.removeItem(
                    "usuario"
                );

            }

        }


        // =============================================
        // SEM TOKEN
        // =============================================

        if (!token) {
            return;
        }


        // =============================================
        // VALIDAR JWT
        // =============================================

        try {

            const resposta =
                await fetch(
                    "http://localhost:3000/api/users/me",
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }

                    }
                );


            // =========================================
            // TOKEN INVÁLIDO
            // =========================================

            if (!resposta.ok) {

                console.warn(
                    "Sessão expirada ou inválida."
                );

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "usuario"
                );

                return;

            }


            // =========================================
            // DADOS DO USUÁRIO
            // =========================================

            const dados =
                await resposta.json();


            if (dados.usuario) {

                localStorage.setItem(
                    "usuario",
                    JSON.stringify(
                        dados.usuario
                    )
                );


                atualizarPerfilLogado(
                    dados.usuario
                );

            }


        } catch (erro) {

            console.error(
                "Erro ao restaurar sessão:",
                erro
            );

        }

    }


    // =================================================
    // INICIALIZAR
    // =================================================

    atualizarModo();

    restaurarSessao();

});

