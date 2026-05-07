export const renderHeader = (user, usuarioDados) => {
    document.getElementById("secao-login").style.display = "none";
    document.getElementById("secao-app").style.display = "block";
    document.getElementById("usuario-logado").innerText = `Olá, ${user.email}`;
    
    const plano = usuarioDados?.plano || "FREE";
    document.getElementById("plano-usuario").innerText = plano.toUpperCase();
    document.getElementById("select-modo").value = usuarioDados?.modo || "solteiro";
    document.getElementById("txt-modo-atual").innerText = usuarioDados?.modo === "casal" ? "💑 Modo Casal" : "👤 Modo Solteiro";

    const areaConvite = document.getElementById("area-convite");
    areaConvite.style.display = (usuarioDados?.modo === "casal" && !usuarioDados?.groupId) ? "block" : "none";
    document.getElementById("container-sync-manual").style.display = plano === "free" ? "block" : "none";
};

export const toggleBotaoLoading = (botaoId, isLoading, textoNormal) => {
    const btn = document.getElementById(botaoId);
    if (!btn) return;
    btn.disabled = isLoading;
    if (btn.tagName !== "SELECT") btn.innerText = isLoading ? "..." : textoNormal;
};

export const atualizarDashboard = (receita, despesa) => {
    document.getElementById("dinheiro").innerText = receita.toFixed(2);
    document.getElementById("contas").innerText = despesa.toFixed(2);
    document.getElementById("falta").innerText = (receita - despesa).toFixed(2);
};