import { auth, loginEmail, criarConta, loginGoogle, resetarSenha, deslogar } from "./auth.js";
import { db, salvarTransacao, criarQueryTransacoes, deletarDoc, atualizarStatusDoc, salvarMeta, criarQueryMetas, deletarMetaDoc, vincularParceiro } from "./db.js";
import { renderHeader, toggleBotaoLoading, atualizarDashboard } from "./ui.js";
import { atualizarGrafico } from "./chart.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, setDoc, onSnapshot, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let usuarioDados = {}; 
let unsubscribe = null; 

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        document.getElementById("secao-login").style.display = "block";
        document.getElementById("secao-app").style.display = "none";
        if (unsubscribe) unsubscribe();
        return;
    }
    
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    
    if (!snap.exists()) {
        usuarioDados = { email: user.email, plano: "free", modo: "solteiro", groupId: null };
        await setDoc(userRef, usuarioDados);
    } else {
        usuarioDados = snap.data();
    }

    renderHeader(user, usuarioDados);
    initDataFlow(user);
});

function initDataFlow(user) {
    const idGrupoBusca = usuarioDados.modo === "casal" ? usuarioDados.groupId : null;
    const q = criarQueryTransacoes(user.uid, idGrupoBusca);

    if (usuarioDados.plano === "free") {
        carregarDados(q);
        document.getElementById("btn-sync-manual").onclick = () => carregarDados(q);
    } else {
        if (unsubscribe) unsubscribe();
        unsubscribe = onSnapshot(q, (snapshot) => carregarDados(snapshot, true));
    }
}

async function carregarDados(queryRef, isSnapshot = false) {
    const snap = isSnapshot ? queryRef : await getDocs(queryRef);
    let totalR = 0, totalD = 0, html = "";
    const catMap = {};

    snap.forEach(docSnap => {
        const d = docSnap.data();
        const v = parseFloat(d.valor);
        v > 0 ? totalR += v : totalD += Math.abs(v);
        catMap[d.categoria] = (catMap[d.categoria] || 0) + Math.abs(v);

        html += `
            <div class="card ${v < 0 ? 'despesa' : 'receita'}">
                <div style="display:flex; justify-content: space-between">
                    <strong>${d.desc}</strong>
                    <span>R$ ${Math.abs(v).toFixed(2)}</span>
                </div>
                <div class="acoes">
                    <button class="mini-btn" onclick="window.alterarStatus('${docSnap.id}', ${d.pago})">${d.pago ? '✅' : '⏳'}</button>
                    <button class="mini-btn danger" onclick="window.excluirTransacao('${docSnap.id}')">🗑</button>
                </div>
            </div>`;
    });

    atualizarDashboard(totalR, totalD);
    document.getElementById("lista").innerHTML = html || "Vazio";
    atualizarGrafico(catMap);
    carregarMetas(auth.currentUser.uid, (totalR - totalD));
}

async function carregarMetas(uid, saldo) {
    const snap = await getDocs(criarQueryMetas(uid));
    let html = "";
    snap.forEach(docSnap => {
        const m = docSnap.data();
        let p = Math.min(100, Math.max(0, (saldo / m.objetivo) * 100));
        html += `<div class="meta-item">
            <strong>${m.nome}</strong>
            <div class="progresso-bg"><div class="progresso-barra" style="width:${p}%"></div></div>
            <button class="mini-btn danger" onclick="window.excluirMeta('${docSnap.id}')">🗑</button>
        </div>`;
    });
    document.getElementById("lista-metas").innerHTML = html;
}

/* --- LÓGICA DE ALTERNÂNCIA DE MODO --- */
const selectModo = document.getElementById("select-modo");
if (selectModo) {
    selectModo.onchange = async () => {
        const novoModo = selectModo.value;
        const userRef = doc(db, "users", auth.currentUser.uid);
        
        try {
            toggleBotaoLoading("select-modo", true, ""); 
            await updateDoc(userRef, { modo: novoModo });
            Swal.fire("Modo Alterado", `Agora você está no modo ${novoModo === 'casal' ? 'Casal' : 'Solteiro'}`, "success")
                .then(() => location.reload()); 
        } catch (e) {
            Swal.fire("Erro", "Não foi possível mudar o modo", "error");
        }
    };
}

document.getElementById("btn-salvar").onclick = async () => {
    const desc = document.getElementById("desc").value;
    const valor = document.getElementById("valor").value;
    const tipo = document.querySelector('input[name="tipo"]:checked').value;
    if (!desc || !valor) return;

    const gid = usuarioDados.modo === "casal" ? usuarioDados.groupId : null;
    await salvarTransacao(auth.currentUser.uid, gid, {
        desc, valor: Number(valor), tipo, 
        categoria: document.getElementById("categoria").value,
        data: document.getElementById("vencimento").value || new Date().toISOString(),
        pago: false
    });
    location.reload();
};

window.excluirTransacao = async (id) => { if(confirm("Excluir?")) { await deletarDoc(id); location.reload(); }};
window.alterarStatus = async (id, s) => { await atualizarStatusDoc(id, s); location.reload(); };
window.excluirMeta = async (id) => { await deletarMetaDoc(id); location.reload(); };

document.getElementById("btn-salvar-meta").onclick = async () => {
    const n = document.getElementById("meta-nome").value;
    const v = document.getElementById("meta-objetivo").value;
    if(n && v) { await salvarMeta(auth.currentUser.uid, n, v); location.reload(); }
};

document.getElementById("btn-tema").onclick = () => document.body.classList.toggle("light");
document.getElementById("btn-sair").onclick = deslogar;
document.getElementById("btn-login").onclick = () => loginEmail(document.getElementById("email").value, document.getElementById("senha").value);
document.getElementById("btn-cadastrar").onclick = () => criarConta(document.getElementById("email").value, document.getElementById("senha").value);
document.getElementById("btn-google").onclick = loginGoogle;
document.getElementById("btn-conectar-parceiro").onclick = async () => {
    try {
        await vincularParceiro(auth.currentUser.uid, document.getElementById("email-parceiro").value);
        Swal.fire("Sucesso", "Conectados!", "success").then(() => location.reload());
    } catch(e) { Swal.fire("Erro", e.message, "error"); }
};