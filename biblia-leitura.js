 /* =====================================================
    BÍBLIA — CONTROLE DE LEITURA
 ===================================================== */

(function () {

    const INTERVALO_ATIVIDADE = 10000; // 10 segundos

    let sessaoIniciada = false;

    // Só permite iniciar a leitura depois do clique
    // no botão "Abrir Bíblia"
    let leituraAutorizada = false;

    let intervaloHeartbeat = null;

    let sessaoPausando = false;

    let retomandoPorConfirmacao = false;

    const TEMPO_INATIVIDADE = 300000; // 5 minutos

    let ultimaAtividadeUsuario = Date.now();

    let usuarioInativo = false;

    let aguardandoConfirmacao = false;

    let intervaloInatividade = null;


    // =====================================================
    // BUSCA O TOKEN JWT
    // =====================================================

    function obterToken() {

        const procurar = (storage) => {

            for (let i = 0; i < storage.length; i++) {

                const chave = storage.key(i);

                const valor = storage.getItem(chave);

                if (
                    typeof valor === "string" &&
                    /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/.test(valor)
                ) {
                    return valor;
                }
            }

            return null;
        };

        return (
            procurar(localStorage) ||
            procurar(sessionStorage)
        );
    }


    // =====================================================
    // VERIFICA SE A BÍBLIA ESTÁ VISÍVEL
    // =====================================================

    function bibliaEstaVisivel() {

        const bibliaView =
            document.getElementById("bibliaView");

        if (!bibliaView) {
            return false;
        }

        const estilo =
            window.getComputedStyle(bibliaView);

        return (
            document.visibilityState === "visible" &&
            estilo.display !== "none" &&
            estilo.visibility !== "hidden"
        );
    }


    // =====================================================
    // INICIA SESSÃO
    // =====================================================

    async function iniciarSessao() {

        // NÃO inicia antes do clique em "Abrir Bíblia"
        if (!leituraAutorizada) {
            return;
        }

        if (sessaoIniciada) {
            return;
        }

        const token = obterToken();

        if (!token) {

            console.warn(
                "Bíblia: token de autenticação não encontrado."
            );

            return;
        }

        try {

            const resposta = await fetch(
                "http://localhost:3000/api/biblia/iniciar",
                {
                    method: "POST",

                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            const dados = await resposta.json();

            if (!dados.sucesso) {

                console.warn(
                    "Bíblia:",
                    dados.mensagem
                );

                return;
            }

            sessaoIniciada = true;

            ultimaAtividadeUsuario = Date.now();

            usuarioInativo = false;

            console.log(
                "Bíblia: sessão de leitura iniciada.",
                dados
            );

            // Garante que uma sessão existente seja retomada
            retomarSessao();

        } catch (error) {

            console.error(
                "Bíblia: erro ao iniciar sessão.",
                error
            );
        }
    }


    // =====================================================
    // ENVIA SINAL DE ATIVIDADE
    // =====================================================

    async function enviarAtividade() {

        if (!sessaoIniciada) {
            return;
        }

        if (sessaoPausando) {
            return;
        }

        if (!bibliaEstaVisivel()) {
            return;
        }

        const token = obterToken();

        if (!token) {
            return;
        }

        try {

            const resposta = await fetch(
                "http://localhost:3000/api/biblia/atividade",
                {
                    method: "POST",

                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            const dados = await resposta.json();

            if (dados.sucesso) {

                console.log(
                    "Bíblia:",
                    dados.tempoAtivoSegundos,
                    "segundos contabilizados."
                );
            }

        } catch (error) {

            console.error(
                "Bíblia: erro ao registrar atividade.",
                error
            );
        }
    }


    // =====================================================
    // HEARTBEAT
    // =====================================================

    function iniciarHeartbeat() {

        if (intervaloHeartbeat) {
            return;
        }

        intervaloHeartbeat = setInterval(() => {

            if (
                !sessaoPausando &&
                bibliaEstaVisivel()
            ) {
                enviarAtividade();
            }

        }, INTERVALO_ATIVIDADE);
    }


    // =====================================================
    // PAUSAR SESSÃO
    // =====================================================

    async function pausarSessao() {

        if (retomandoPorConfirmacao) {
            return;
        }

        // Bloqueia imediatamente novos heartbeats
        sessaoPausando = true;

        // Para o intervalo imediatamente
        if (intervaloHeartbeat) {

            clearInterval(intervaloHeartbeat);

            intervaloHeartbeat = null;
        }

        if (!sessaoIniciada) {
            return;
        }

        const token = obterToken();

        if (!token) {
            return;
        }

        try {

            const resposta = await fetch(
                "http://localhost:3000/api/biblia/pausar",
                {
                    method: "POST",

                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            const dados = await resposta.json();

            if (dados.sucesso) {

                console.log(
                    "Bíblia: sessão pausada.",
                    dados
                );
            }

        } catch (error) {

            console.error(
                "Bíblia: erro ao pausar sessão.",
                error
            );
        }
    }


    // =====================================================
    // RETOMAR SESSÃO
    // =====================================================

    async function retomarSessao() {

        if (!sessaoIniciada) {
            return;
        }

        const token = obterToken();

        if (!token) {
            return;
        }

        // Enquanto retoma, nenhum heartbeat pode passar
        sessaoPausando = true;

        if (intervaloHeartbeat) {

            clearInterval(intervaloHeartbeat);

            intervaloHeartbeat = null;
        }

        try {

            const resposta = await fetch(
                "http://localhost:3000/api/biblia/retomar",
                {
                    method: "POST",

                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            const dados = await resposta.json();

            if (dados.sucesso) {

                console.log(
                    "Bíblia: sessão retomada.",
                    dados
                );

                // Reinicia completamente o relógio de inatividade
                ultimaAtividadeUsuario = Date.now();

                usuarioInativo = false;

                // Libera novamente os heartbeats
                sessaoPausando = false;

                iniciarHeartbeat();
            }

        } catch (error) {

            console.error(
                "Bíblia: erro ao retomar sessão.",
                error
            );

            sessaoPausando = false;
        }
    }


    // =====================================================
    // DETECTA MUDANÇA DA ABA
    // =====================================================

    document.addEventListener(
        "visibilitychange",
        () => {

            if (bibliaEstaVisivel()) {

                // Só inicia/retoma se o usuário
                // já tiver clicado em "Abrir Bíblia"
                if (leituraAutorizada) {

                    if (sessaoIniciada) {

                        retomarSessao();

                    } else {

                        iniciarSessao();
                    }
                }

            } else {

                console.log(
                    "Bíblia: página não está visível. Pausando..."
                );

                pausarSessao();
            }
        }
    );


    // =====================================================
    // OBSERVA O bibliaView
    // Detecta quando o site mostra/esconde a Bíblia
    // =====================================================

    function observarBiblia() {

        const bibliaView =
            document.getElementById("bibliaView");

        if (!bibliaView) {
            return;
        }

        let estadoAnterior =
            bibliaEstaVisivel();

        const observer =
            new MutationObserver(() => {

                const estadoAtual =
                    bibliaEstaVisivel();

                // Só faz alguma coisa quando o estado realmente mudou
                if (estadoAtual === estadoAnterior) {
                    return;
                }

                estadoAnterior = estadoAtual;

                if (estadoAtual) {

                    console.log(
                        "Bíblia: tela ficou visível."
                    );

                    // IMPORTANTE:
                    // apenas inicia se o usuário já clicou
                    // em "Abrir Bíblia"
                    if (leituraAutorizada) {

                        if (sessaoIniciada) {

                            retomarSessao();

                        } else {

                            iniciarSessao();
                        }
                    }

                } else {

                    console.log(
                        "Bíblia: tela ficou invisível."
                    );

                    if (sessaoIniciada) {
                        pausarSessao();
                    }
                }
            });

        observer.observe(
            bibliaView,
            {
                attributes: true,

                attributeFilter: [
                    "style",
                    "class"
                ]
            }
        );
    }


    // =====================================================
    // DETECTOR DE INATIVIDADE DO USUÁRIO
    // =====================================================

    function registrarAtividadeUsuario() {

        if (!bibliaEstaVisivel()) {
            return;
        }

        // Enquanto aguarda confirmação, movimento
        // do usuário não retoma a leitura automaticamente
        if (aguardandoConfirmacao) {
            return;
        }

        ultimaAtividadeUsuario = Date.now();

        if (usuarioInativo) {

            usuarioInativo = false;

            console.log(
                "Bíblia: usuário voltou a ficar ativo."
            );
        }
    }


    function verificarInatividade() {

        if (!bibliaEstaVisivel()) {
            return;
        }

        // Se o usuário ainda nem clicou em "Abrir Bíblia",
        // não existe leitura para controlar
        if (!leituraAutorizada || !sessaoIniciada) {
            return;
        }

        const agora = Date.now();

        const tempoSemAtividade =
            agora - ultimaAtividadeUsuario;

        if (
            !usuarioInativo &&
            !aguardandoConfirmacao &&
            tempoSemAtividade >= TEMPO_INATIVIDADE
        ) {

            usuarioInativo = true;

            aguardandoConfirmacao = true;

            console.log(
                "Bíblia: usuário está inativo há 5 minutos. Pausando leitura..."
            );

            pausarSessao();

            mostrarAvisoInatividade();
        }
    }


    function iniciarDetectorInatividade() {

        if (intervaloInatividade) {
            return;
        }

        // Movimentos/interações considerados atividade

        document.addEventListener(
            "mousemove",
            registrarAtividadeUsuario
        );

        document.addEventListener(
            "mousedown",
            registrarAtividadeUsuario
        );

        document.addEventListener(
            "keydown",
            registrarAtividadeUsuario
        );

        document.addEventListener(
            "touchstart",
            registrarAtividadeUsuario
        );

        document.addEventListener(
            "scroll",
            registrarAtividadeUsuario,
            true
        );

        intervaloInatividade = setInterval(
            verificarInatividade,
            1000
        );
    }


    // =====================================================
    // AVISO DE INATIVIDADE
    // =====================================================

    function mostrarAvisoInatividade() {

        if (
            document.getElementById(
                "avisoInatividadeBiblia"
            )
        ) {
            return;
        }

        const aviso =
            document.createElement("div");

        aviso.id =
            "avisoInatividadeBiblia";

        aviso.innerHTML = `

            <div style="
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.65);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                padding: 20px;
            ">

                <div style="
                    width: min(420px, 100%);
                    background: #f5f2ea;
                    color: #201a15;
                    border-radius: 20px;
                    padding: 28px;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0,0,0,.35);
                ">

                    <div style="
                        font-size: 34px;
                        margin-bottom: 12px;
                    ">
                        📖
                    </div>

                    <h2 style="
                        margin: 0 0 10px;
                        font-size: 22px;
                    ">
                        Você ainda está lendo?
                    </h2>

                    <p style="
                        margin: 0 0 22px;
                        font-size: 15px;
                        line-height: 1.5;
                    ">
                        A leitura foi pausada porque não detectamos
                        atividade há 5 minutos.
                    </p>

                    <button
                        id="confirmarLeituraBiblia"
                        type="button"
                        style="
                            width: 100%;
                            border: 0;
                            border-radius: 12px;
                            padding: 13px 18px;
                            font-size: 15px;
                            font-weight: 700;
                            cursor: pointer;
                        "
                    >
                        Sim, estou lendo
                    </button>

                </div>

            </div>
        `;

        document.body.appendChild(aviso);

        const botao =
            document.getElementById(
                "confirmarLeituraBiblia"
            );

        botao.addEventListener(
            "click",
            confirmarLeitura
        );
    }


    // =====================================================
    // CONFIRMA LEITURA
    // =====================================================

    function confirmarLeitura() {

        const aviso =
            document.getElementById(
                "avisoInatividadeBiblia"
            );

        if (aviso) {
            aviso.remove();
        }

        aguardandoConfirmacao = false;

        usuarioInativo = false;

        ultimaAtividadeUsuario = Date.now();

        retomandoPorConfirmacao = true;

        console.log(
            "Bíblia: leitura confirmada pelo usuário."
        );

        retomarSessao();

        setTimeout(() => {

            retomandoPorConfirmacao = false;

        }, 1000);
    }


    // =====================================================
    // AUTORIZAR LEITURA
    // =====================================================
    // Esta função será chamada pelo botão
    // "Abrir Bíblia".

    window.autorizarLeituraBiblia = function () {

        leituraAutorizada = true;

        ultimaAtividadeUsuario = Date.now();

        usuarioInativo = false;

        aguardandoConfirmacao = false;

        console.log(
            "Bíblia: usuário clicou em Abrir Bíblia."
        );

        // Se a tela já estiver visível,
        // inicia a sessão imediatamente.
        if (bibliaEstaVisivel()) {

            if (sessaoIniciada) {

                retomarSessao();

            } else {

                iniciarSessao();
            }
        }
    };


    // =====================================================
    // INICIALIZAÇÃO
    // =====================================================

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            observarBiblia();

            iniciarDetectorInatividade();

            // NÃO iniciar sessão aqui.
            //
            // A sessão só começa depois que
            // autorizarLeituraBiblia() for chamada
            // pelo botão "Abrir Bíblia".
        }
    );

})();