/**
 * Atualiza os elementos visuais do cabeçalho e perfil
 * @param {Object} user - Objeto do Firebase Auth
 * @param {Object} usuarioDados - Dados do Firestore
 */
export const renderHeader = (user, usuarioDados) => {
    const secaoLogin = document.getElementById("secao-login");
    const secaoApp = document.getElementById("secao-app");
    if (secaoLogin) secaoLogin.style.display = "none";
    if (secaoApp) secaoApp.style.display = "block";

    const campoUsuario = document.getElementById("usuario-logado");
    if (campoUsuario && user) campoUsuario.innerText = `Olá, ${user.email}`;

    const campoPlano = document.getElementById("plano-usuario");
    if (campoPlano) {
        const plano = (usuarioDados && usuarioDados.plano) ? usuarioDados.plano : "FREE";
        campoPlano.innerText = plano.toUpperCase();
    }

    // SINCRONIZA O SELETOR DE MODO
    const selectModo = document.getElementById("select-modo");
    if (selectModo && usuarioDados) {
        selectModo.value = usuarioDados.modo || "solteiro";
    }

    const txtModo = document.getElementById("txt-modo-atual");
    if (txtModo) {
        const modoAtual = (usuarioDados && usuarioDados.modo === "casal") ? "💑 Modo Casal" : "👤 Modo Solteiro";
        txtModo.innerText = modoAtual;
    }

    const areaConvite = document.getElementById("area-convite");
    if (areaConvite) {
        // MOSTRA convite apenas se: estiver no modo 'casal' MAS ainda não tiver um parceiro vinculado (groupId vazio)
        const querCasalSemParceiro = usuarioDados && usuarioDados.modo === "casal" && !usuarioDados.groupId;
        areaConvite.style.display = querCasalSemParceiro ? "block" : "none";
    }

    const syncBox = document.getElementById("container-sync-manual");
    if (syncBox) {
        const exibirSync = (usuarioDados && usuarioDados.plano === "free") ? "block" : "none";
        syncBox.style.display = exibirSync;
    }
};

export const toggleBotaoLoading = (botaoId, isLoading, textoNormal) => {
    const btn = document.getElementById(botaoId);
    if (!btn) return;
    btn.disabled = isLoading;
    // Se for um select, não mudamos o texto, apenas desabilitamos
    if (btn.tagName !== "SELECT") {
        btn.innerText = isLoading ? "Processando..." : textoNormal;
    }
};

export const atualizarDashboard = (receita, despesa) => {
    const dinheiroElem = document.getElementById("dinheiro");
    const contasElem = document.getElementById("contas");
    const faltaElem = document.getElementById("falta");

    if (dinheiroElem) dinheiroElem.innerText = receita.toFixed(2);
    if (contasElem) contasElem.innerText = despesa.toFixed(2);
    if (faltaElem) faltaElem.innerText = (receita - despesa).toFixed(2);
};