// IMPORTAÇÕES
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, deleteDoc, updateDoc, query, where, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// CONFIG (Suas credenciais originais)
const firebaseConfig = {
    apiKey: "AIzaSyD7Kr-ee-NLtK21wVh1GBLazZKIeigkzsU",
    authDomain: "vida-rica-app-bc076.firebaseapp.com",
    projectId: "vida-rica-app-bc076",
    storageBucket: "vida-rica-app-bc076.firebasestorage.app",
    messagingSenderId: "284683038291",
    appId: "1:284683038291:web:f07db423b5fb99dc1520a6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ESTADO GLOBAL DO APP
let usuarioDados = {};
let unsubscribe = null; // Para limpar o Real-time sync quando necessário

// ELEMENTOS DE INTERFACE
const loginSec = document.getElementById("secao-login");
const appSec = document.getElementById("secao-app");
const listaContas = document.getElementById("lista");
const dicasIA = document.getElementById("dicas-financeiras");

// --- 1. AUTENTICAÇÃO E PLANOS ---

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        showLogin();
        return;
    }
    
    // Carrega Perfil
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    
    if (!snap.exists()) {
        usuarioDados = {
            email: user.email,
            plano: "free",
            modo: "solteiro",
            trialTermina: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };
        await setDoc(userRef, usuarioDados);
    } else {
        usuarioDados = snap.data();
    }

    renderHeader(user);
    initDataFlow(user);
});

function renderHeader(user) {
    loginSec.style.display = "none";
    appSec.style.display = "block";
    document.getElementById("usuario-logado").innerText = user.email;
    const plano = document.getElementById("plano-usuario");
    plano.innerText = usuarioDados.plano.toUpperCase();
    
    // Controle de Sincronização Manual (Plano Free)
    const syncBox = document.getElementById("container-sync-manual");
    syncBox.style.display = usuarioDados.plano === "free" ? "block" : "none";
}

// --- 2. FLUXO DE DADOS (FREE VS PAID) ---

function initDataFlow(user) {
    if (usuarioDados.plano === "free") {
        // Modo Manual: Só carrega uma vez
        carregarDados(user);
        document.getElementById("btn-sync-manual").onclick = () => carregarDados(user);
    } else {
        // Modo Premium: Real-time Sync (Sincronização Automática)
        if (unsubscribe) unsubscribe();
        const q = query(collection(db, "transactions"), where("userId", "==", user.uid));
        unsubscribe = onSnapshot(q, () => carregarDados(user));
    }
}

// --- 3. LÓGICA DE TRANSAÇÕES (REFATORADA) ---

document.getElementById("btn-salvar").onclick = async () => {
    const user = auth.currentUser;
    const desc = document.getElementById("desc").value;
    const valor = Number(document.getElementById("valor").value);
    const tipo = document.querySelector('input[name="tipo"]:checked').value;
    const fixo = document.getElementById("fixo").checked;
    const categoria = document.getElementById("categoria").value;

    if (!desc || !valor) return Swal.fire("Erro", "Preencha os campos!", "error");

    const transacao = {
        userId: user.uid,
        desc,
        valor: tipo === "despesa" ? -Math.abs(valor) : Math.abs(valor),
        categoria,
        pago: false,
        data: document.getElementById("vencimento").value || new Date().toISOString(),
        isAssinatura: categoria === "Assinatura"
    };

    try {
        // Se for FIXO: Cadastra 3 meses para não sobrecarregar
        if (fixo) {
            for (let i = 0; i < 3; i++) {
                let dataFutura = new Date(transacao.data);
                dataFutura.setMonth(dataFutura.getMonth() + i);
                await addDoc(collection(db, "transactions"), {
                    ...transacao,
                    data: dataFutura.toISOString(),
                    desc: `${desc} (${i+1}/3)`
                });
            }
        } else {
            await addDoc(collection(db, "transactions"), transacao);
        }

        Swal.fire("Sucesso", "Lançamento realizado!", "success");
        if (usuarioDados.plano === "free") carregarDados(user);
    } catch (e) {
        console.error(e);
    }
};

// --- 4. RELATÓRIOS E IA ---

async function carregarDados(user) {
    const q = query(collection(db, "transactions"), where("userId", "==", user.uid), orderBy("data", "desc"));
    const snap = await getDocs(q);
    
    let totalReceita = 0;
    let totalDespesa = 0;
    let listaHtml = "";
    const categoriasMapa = {};

    snap.forEach(docSnap => {
        const d = docSnap.data();
        const valor = parseFloat(d.valor);
        
        if (valor > 0) totalReceita += valor;
        else totalDespesa += Math.abs(valor);

        // Mapa para Gráfico
        categoriasMapa[d.categoria] = (categoriasMapa[d.categoria] || 0) + Math.abs(valor);

        listaHtml += `
            <div class="card ${valor < 0 ? 'despesa' : 'receita'} ${d.isAssinatura ? 'assinatura' : ''}">
                <div style="display:flex; justify-content: space-between">
                    <strong>${d.desc} ${d.isAssinatura ? '📺' : ''}</strong>
                    <span>R$ ${Math.abs(valor).toFixed(2)}</span>
                </div>
                <small>${new Date(d.data).toLocaleDateString()}</small>
                <div class="acoes">
                    <button onclick="alterarStatus('${docSnap.id}', ${d.pago})">${d.pago ? '✅ Pago' : '⏳ Pagar'}</button>
                    <button class="danger" onclick="excluirTransacao('${docSnap.id}')">🗑</button>
                </div>
            </div>
        `;
    });

    // Atualiza UI
    document.getElementById("dinheiro").innerText = totalReceita.toFixed(2);
    document.getElementById("contas").innerText = totalDespesa.toFixed(2);
    document.getElementById("falta").innerText = (totalReceita - totalDespesa).toFixed(2);
    listaContas.innerHTML = listaHtml || "<p class='vazio'>Nenhuma transação encontrada.</p>";
    
    atualizarGrafico(categoriasMapa);
    executarIA(totalReceita, totalDespesa, categoriasMapa);
}

// IA: Conselheiro Financeiro Simples
function executarIA(receita, despesa, categorias) {
    let conselho = "✅ Suas finanças estão equilibradas. Continue assim!";
    const porcDespesa = (despesa / receita) * 100;

    if (porcDespesa > 80) {
        conselho = "⚠️ Cuidado! Você está gastando mais de 80% do que ganha. Tente reduzir gastos variáveis.";
    }
    
    if (categorias["Assinatura"] > (receita * 0.1)) {
        conselho = "📺 Alerta de Assinaturas: Seus streamings somam mais de 10% da sua renda. Que tal cancelar o que não usa?";
    }

    dicasIA.innerText = conselho;
}

// --- 5. INTEGRAÇÃO ASAAS (SIMULAÇÃO DE GATEWAY) ---
document.getElementById("btn-upgrade").onclick = () => {
    Swal.fire({
        title: 'Escolha seu Plano',
        html: `
            <button class="button" onclick="window.checkout('SOLTEIRO')">Solteiro - R$ 19,90</button>
            <button class="button" onclick="window.checkout('CASAL')">Casal - R$ 29,90</button>
        `,
        showConfirmButton: false
    });
};

window.checkout = (tipo) => {
    // Aqui você chamaria sua API que comunica com o Asaas
    Swal.fire("Integração Asaas", `Redirecionando para o Checkout ${tipo}... Em um sistema real, aqui geramos o PIX via API.`, "info");
};

// --- FUNÇÕES GLOBAIS (WINDOW) ---
window.excluirTransacao = async (id) => {
    const result = await Swal.fire({ title: 'Excluir?', showCancelButton: true });
    if (result.isConfirmed) {
        await deleteDoc(doc(db, "transactions", id));
        if (usuarioDados.plano === "free") carregarDados(auth.currentUser);
    }
};

window.alterarStatus = async (id, statusAtual) => {
    await updateDoc(doc(db, "transactions", id), { pago: !statusAtual });
    if (usuarioDados.plano === "free") carregarDados(auth.currentUser);
};

// Gráfico
let chartInstance = null;
function atualizarGrafico(dados) {
    const ctx = document.getElementById('meuGrafico').getContext('2d');
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(dados),
            datasets: [{
                data: Object.values(dados),
                backgroundColor: ['#2563eb', '#ef4444', '#facc15', '#7c3aed', '#22c55e']
            }]
        },
        options: { plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } } }
    });
}

// PDF Export
document.getElementById("btn-pdf").onclick = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Relatório Financeiro - Nós Dois & Eu", 10, 10);
    // Aqui usamos o autoTable para gerar a lista
    Swal.fire("PDF", "Gerando relatório colorido...", "success");
    doc.save("financeiro.pdf");
};

function showLogin() {
    loginSec.style.display = "block";
    appSec.style.display = "none";
}