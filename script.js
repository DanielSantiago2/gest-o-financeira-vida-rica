import { auth, loginEmail, criarConta, loginGoogle, resetarSenha, deslogar } from "./auth.js";
// CORREÇÃO: Adicionado os imports das funções de metas que estavam faltando aqui
import { db, salvarTransacao, criarQueryTransacoes, deletarDoc, atualizarStatusDoc, salvarMeta, criarQueryMetas, deletarMetaDoc } from "./db.js";
import { renderHeader, toggleBotaoLoading, atualizarDashboard } from "./ui.js";
import { atualizarGrafico } from "./chart.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, setDoc, onSnapshot, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let usuarioDados = {}; // Estado local para guardar dados do usuário (plano, grupo, etc)
let unsubscribe = null; // Guarda a função para "parar de ouvir" o banco de dados

/* 
--- VIGIA DA AUTENTICAÇÃO ---
Verifica se o usuário está logado e carrega o perfil
*/
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        // Se não há usuário, exibe login e esconde o app
        document.getElementById("secao-login").style.display = "block";
        document.getElementById("secao-app").style.display = "none";
        if (unsubscribe) unsubscribe(); 
        return;
    }
    
    // Busca informações adicionais do usuário no Firestore
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    
    if (!snap.exists()) {
        // Usuário novo: cria documento inicial
        usuarioDados = { 
            email: user.email, 
            plano: "free", 
            modo: "solteiro", 
            groupId: null, 
            criadoEm: new Date().toISOString() 
        };
        await setDoc(userRef, usuarioDados);
    } else {
        usuarioDados = snap.data();
    }

    renderHeader(user, usuarioDados); // Atualiza nome e plano no topo
    initDataFlow(user); // Inicia o carregamento das transações
});

/* 
--- FLUXO DE DADOS ---
Gerencia como os dados chegam (Tempo real para Premium, Manual para Free)
*/
function initDataFlow(user) {
    const q = criarQueryTransacoes(user.uid, usuarioDados.groupId);

    if (usuarioDados.plano === "free") {
        // Carregamento manual
        carregarDados(q);
        const btnSync = document.getElementById("btn-sync-manual");
        if(btnSync) btnSync.onclick = () => carregarDados(q);
    } else {
        // Carregamento em tempo real (Premium)
        if (unsubscribe) unsubscribe();
        unsubscribe = onSnapshot(q, (snapshot) => carregarDados(snapshot, true));
    }
}

/**
 * carregarDados: Processa transações e atualiza toda a interface
 */
async function carregarDados(queryRef, isSnapshot = false) {
    // Busca os dados se não for um snapshot em tempo real
    const snap = isSnapshot ? queryRef : await getDocs(queryRef);
    
    let totalReceita = 0;
    let totalDespesa = 0;
    let listaHtml = "";
    const categoriasMapa = {};

    snap.forEach(docSnap => {
        const d = docSnap.data();
        const valor = parseFloat(d.valor);

        // Soma receitas e despesas
        valor > 0 ? totalReceita += valor : totalDespesa += Math.abs(valor);

        // Agrupa valores por categoria para o gráfico
        categoriasMapa[d.categoria] = (categoriasMapa[d.categoria] || 0) + Math.abs(valor);

        // Constrói o HTML dos cards de transação
        listaHtml += `
            <div class="card ${valor < 0 ? 'despesa' : 'receita'} ${d.isAssinatura ? 'assinatura' : ''}">
                <div style="display:flex; justify-content: space-between">
                    <strong>${d.desc} ${d.isAssinatura ? '📺' : ''}</strong>
                    <span>R$ ${Math.abs(valor).toFixed(2)}</span>
                </div>
                <small>${new Date(d.data).toLocaleDateString('pt-BR')}</small>
                <div class="acoes">
                    <button class="mini-btn" onclick="window.alterarStatus('${docSnap.id}', ${d.pago})">
                        ${d.pago ? '✅ Pago' : '⏳ Pagar'}
                    </button>
                    <button class="mini-btn danger" onclick="window.excluirTransacao('${docSnap.id}')">🗑</button>
                </div>
            </div>`;
    });

    // Atualiza os componentes da tela
    const saldoAtual = totalReceita - totalDespesa;
    atualizarDashboard(totalReceita, totalDespesa);
    document.getElementById("lista").innerHTML = listaHtml || "<p>Nenhuma transação encontrada.</p>";
    atualizarGrafico(categoriasMapa);

    // CORREÇÃO: Chama carregarMetas uma única vez após processar o saldo
    carregarMetas(auth.currentUser.uid, saldoAtual);
}

/* 
--- LÓGICA DE METAS ---
Gerencia a visualização e criação de objetivos financeiros
*/
async function carregarMetas(userId, saldo) {
    const q = criarQueryMetas(userId);
    const snap = await getDocs(q);
    const listaMetasDiv = document.getElementById("lista-metas");
    
    if (!listaMetasDiv) return;

    let html = "";
    snap.forEach(docSnap => {
        const meta = docSnap.data();
        // Cálculo da porcentagem de conclusão
        let porcentagem = (saldo / meta.objetivo) * 100;
        if (porcentagem > 100) porcentagem = 100;
        if (porcentagem < 0) porcentagem = 0;

        html += `
            <div class="meta-item" style="background: var(--card2); padding: 15px; border-radius: 12px; margin-bottom: 10px;">
                <div style="display:flex; justify-content: space-between; margin-bottom: 5px;">
                    <strong>${meta.nome}</strong>
                    <span>R$ ${meta.objetivo.toFixed(2)}</span>
                </div>
                <div class="progresso-bg" style="background: rgba(255,255,255,0.1); height: 10px; border-radius: 5px; overflow: hidden;">
                    <div class="progresso-barra" style="width: ${porcentagem}%; background: var(--verde); height: 100%; transition: width 0.8s;"></div>
                </div>
                <div style="display:flex; justify-content: space-between; margin-top: 5px;">
                    <small>${porcentagem.toFixed(1)}% alcançado</small>
                    <button class="mini-btn danger" onclick="window.excluirMeta('${docSnap.id}')" style="padding: 2px 5px;">🗑</button>
                </div>
            </div>`;
    });
    listaMetasDiv.innerHTML = html;
}

// Evento para salvar nova meta
document.getElementById("btn-salvar-meta").onclick = async () => {
    const nome = document.getElementById("meta-nome").value;
    const valor = document.getElementById("meta-objetivo").value;

    if (!nome || !valor) return Swal.fire("Atenção", "Informe o nome e o valor da meta!", "warning");

    await salvarMeta(auth.currentUser.uid, nome, valor);
    
    // Limpeza e feedback
    document.getElementById("meta-nome").value = "";
    document.getElementById("meta-objetivo").value = "";
    Swal.fire("Sucesso", "Meta registrada!", "success");

    // Recarrega os dados para atualizar a barra de progresso com o saldo atual
    carregarDados(criarQueryTransacoes(auth.currentUser.uid, usuarioDados.groupId));
};

// Deletar meta
window.excluirMeta = async (id) => {
    const confirmacao = await Swal.fire({
        title: 'Excluir meta?',
        text: "Essa ação não pode ser desfeita.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir'
    });

    if (confirmacao.isConfirmed) {
        await deletarMetaDoc(id);
        carregarDados(criarQueryTransacoes(auth.currentUser.uid, usuarioDados.groupId));
    }
};

/* 
--- EVENTOS DE BOTÕES GERAIS ---
*/
document.getElementById("btn-login").onclick = () => loginEmail(document.getElementById("email").value, document.getElementById("senha").value);
document.getElementById("btn-cadastrar").onclick = () => criarConta(document.getElementById("email").value, document.getElementById("senha").value);
document.getElementById("btn-google").onclick = loginGoogle;
document.getElementById("btn-esqueci-senha").onclick = (e) => { 
    e.preventDefault(); 
    resetarSenha(document.getElementById("email").value); 
};

// Botão Sair com proteção para não dar erro de "null"
const btnSair = document.getElementById("btn-sair");
if(btnSair) btnSair.onclick = deslogar;

// Salvar Transação (Receita/Despesa)
document.getElementById("btn-salvar").onclick = async () => {
    const desc = document.getElementById("desc").value;
    const valorRaw = document.getElementById("valor").value;
    const valor = Number(valorRaw);
    const tipo = document.querySelector('input[name="tipo"]:checked').value;
    
    if (!desc || !valorRaw) return Swal.fire("Erro", "Preencha descrição e valor!", "error");

    toggleBotaoLoading("btn-salvar", true, "Adicionar"); 

    await salvarTransacao(auth.currentUser.uid, usuarioDados.groupId, {
        desc, 
        valor: tipo === "despesa" ? -Math.abs(valor) : Math.abs(valor), 
        tipo,
        categoria: document.getElementById("categoria").value,
        data: document.getElementById("vencimento").value || new Date().toISOString(),
        pago: false,
        isAssinatura: document.getElementById("categoria").value === "Assinatura"
    });

    toggleBotaoLoading("btn-salvar", false, "Adicionar");
    document.getElementById("desc").value = "";
    document.getElementById("valor").value = "";

    if (usuarioDados.plano === "free") {
        carregarDados(criarQueryTransacoes(auth.currentUser.uid, usuarioDados.groupId));
    }
};

/* 
--- FUNÇÕES GLOBAIS (Acessíveis pelo HTML) ---
*/
window.excluirTransacao = async (id) => {
    const res = await Swal.fire({ title: 'Excluir transação?', showCancelButton: true });
    if (res.isConfirmed) {
        await deletarDoc(id);
        if (usuarioDados.plano === "free") carregarDados(criarQueryTransacoes(auth.currentUser.uid, usuarioDados.groupId));
    }
};

window.alterarStatus = async (id, statusAtual) => {
    await atualizarStatusDoc(id, statusAtual);
    if (usuarioDados.plano === "free") carregarDados(criarQueryTransacoes(auth.currentUser.uid, usuarioDados.groupId));
};

// Alternar Tema (Dark/Light)
document.getElementById("btn-tema").onclick = () => {
    document.body.classList.toggle("light");
    // Recarrega o gráfico para atualizar as cores das fontes
    carregarDados(criarQueryTransacoes(auth.currentUser.uid, usuarioDados.groupId));
};