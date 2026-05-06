export const renderHeader = (user, usuarioDados) => {
    document.getElementById("secao-login").style.display = "none";
    document.getElementById("secao-app").style.display = "block";
    document.getElementById("usuario-logado").innerText = user.email;
    document.getElementById("plano-usuario").innerText = (usuarioDados.plano || "FREE").toUpperCase();
    
    const syncBox = document.getElementById("container-sync-manual");
    syncBox.style.display = usuarioDados.plano === "free" ? "block" : "none";
};

export const toggleBotaoLoading = (botaoId, isLoading, textoNormal) => {
    const btn = document.getElementById(botaoId);
    btn.disabled = isLoading; // Item 2
    btn.innerText = isLoading ? "Processando..." : textoNormal;
};

export const atualizarDashboard = (receita, despesa) => {
    document.getElementById("dinheiro").innerText = receita.toFixed(2);
    document.getElementById("contas").innerText = despesa.toFixed(2);
    document.getElementById("falta").innerText = (receita - despesa).toFixed(2);
};