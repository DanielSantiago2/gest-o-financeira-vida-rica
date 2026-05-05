// IMPORTAÇÕES
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    GoogleAuthProvider, 
    signInWithPopup,
    sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
    getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, 
    deleteDoc, updateDoc, query, where, onSnapshot, orderBy 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// CONFIG (Suas credenciais mantidas)
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
const googleProvider = new GoogleAuthProvider();

// ESTADO GLOBAL
let usuarioDados = {};
let unsubscribe = null;

// ELEMENTOS
const loginSec = document.getElementById("secao-login");
const appSec = document.getElementById("secao-app");
const listaContas = document.getElementById("lista");
const dicasIA = document.getElementById("dicas-financeiras");

// --- 1. FUNÇÕES DE ACESSO (LOGIN / CADASTRO / SENHA) ---

// Alternar visibilidade da senha (OLHINHO)
document.getElementById("btn-ver-senha").onclick = (e) => {
    e.preventDefault();
    const senhaInput = document.getElementById("senha");
    if (senhaInput.type === "password") {
        senhaInput.type = "text";
        e.target.innerText = "🙈";
    } else {
        senhaInput.type = "password";
        e.target.innerText = "👁️";
    }
};

// Login com E-mail e Senha
document.getElementById("btn-login").onclick = async () => {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    try {
        await signInWithEmailAndPassword(auth, email, senha);
    } catch (e) {
        Swal.fire("Erro", "E-mail ou senha inválidos", "error");
    }
};

// Criar Conta
document.getElementById("btn-cadastrar").onclick = async () => {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    if (senha.length < 6) return Swal.fire("Atenção", "Senha deve ter no mínimo 6 dígitos", "warning");
    try {
        await createUserWithEmailAndPassword(auth, email, senha);
        Swal.fire("Sucesso", "Conta criada com sucesso!", "success");
    } catch (e) {
        Swal.fire("Erro", "Não foi possível criar a conta.", "error");
    }
};

// Login com GOOGLE
document.getElementById("btn-google").onclick = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (e) {
        Swal.fire("Erro", "Falha na autenticação com Google.", "error");
    }
};

// Esqueci minha senha
document.getElementById("btn-esqueci-senha").onclick = async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    if (!email) return Swal.fire("E-mail necessário", "Digite seu e-mail no campo acima primeiro.", "info");
    
    try {
        await sendPasswordResetEmail(auth, email);
        Swal.fire("E-mail enviado", "Verifique sua caixa de entrada para resetar a senha.", "success");
    } catch (e) {
        Swal.fire("Erro", "E-mail não encontrado.", "error");
    }
};

// --- 2. GESTÃO DE ESTADO E PLANOS ---

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        showLogin();
        return;
    }
    
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    
    if (!snap.exists()) {
        usuarioDados = {
            email: user.email,
            plano: "free",
            modo: "solteiro",
            criadoEm: new Date().toISOString()
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
    plano.innerText = (usuarioDados.plano || "FREE").toUpperCase();
    
    const syncBox = document.getElementById("container-sync-manual");
    syncBox.style.display = usuarioDados.plano === "free" ? "block" : "none";
}

function initDataFlow(user) {
    if (usuarioDados.plano === "free") {
        carregarDados(user);
        document.getElementById("btn-sync-manual").onclick = () => carregarDados(user);
    } else {
        if (unsubscribe) unsubscribe();
        const q = query(collection(db, "transactions"), where("userId", "==", user.uid));
        unsubscribe = onSnapshot(q, () => carregarDados(user));
    }
}

// --- 3. TRANSAÇÕES ---

document.getElementById("btn-salvar").onclick = async () => {
    const user = auth.currentUser;
    const desc = document.getElementById("desc").value;
    const valorInput = document.getElementById("valor").value;
    const valor = Number(valorInput);
    const tipo = document.querySelector('input[name="tipo"]:checked').value;
    const categoria = document.getElementById("categoria").value;
    const dataVenc = document.getElementById("vencimento").value;

    if (!desc || !valor) return Swal.fire("Erro", "Preencha os campos!", "error");

    const transacao = {
        userId: user.uid,
        desc,
        valor: tipo === "despesa" ? -Math.abs(valor) : Math.abs(valor),
        categoria,
        pago: false,
        data: dataVenc || new Date().toISOString(),
        isAssinatura: categoria === "Assinatura"
    };

    try {
        await addDoc(collection(db, "transactions"), transacao);
        Swal.fire("Sucesso", "Lançamento realizado!", "success");
        // Limpar campos
        document.getElementById("desc").value = "";
        document.getElementById("valor").value = "";
        if (usuarioDados.plano === "free") carregarDados(user);
    } catch (e) {
        console.error(e);
    }
};

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

        categoriasMapa[d.categoria] = (categoriasMapa[d.categoria] || 0) + Math.abs(valor);

        listaHtml += `
            <div class="card ${valor < 0 ? 'despesa' : 'receita'} ${d.isAssinatura ? 'assinatura' : ''}">
                <div style="display:flex; justify-content: space-between">
                    <strong>${d.desc} ${d.isAssinatura ? '📺' : ''}</strong>
                    <span>R$ ${Math.abs(valor).toFixed(2)}</span>
                </div>
                <small>${new Date(d.data).toLocaleDateString('pt-BR')}</small>
                <div class="acoes">
                    <button onclick="window.alterarStatus('${docSnap.id}', ${d.pago})">${d.pago ? '✅ Pago' : '⏳ Pagar'}</button>
                    <button class="danger" onclick="window.excluirTransacao('${docSnap.id}')">🗑</button>
                </div>
            </div>
        `;
    });

    document.getElementById("dinheiro").innerText = totalReceita.toFixed(2);
    document.getElementById("contas").innerText = totalDespesa.toFixed(2);
    document.getElementById("falta").innerText = (totalReceita - totalDespesa).toFixed(2);
    listaContas.innerHTML = listaHtml || "<p class='vazio'>Nenhuma transação encontrada.</p>";
    
    atualizarGrafico(categoriasMapa);
    executarIA(totalReceita, totalDespesa, categoriasMapa);
}

// --- 4. UTILITÁRIOS (IA, GRÁFICO, TEMA) ---

function executarIA(receita, despesa, categorias) {
    let conselho = "✅ Suas finanças estão equilibradas. Continue assim!";
    if (despesa > receita) conselho = "🚨 Atenção: Suas despesas superaram suas receitas este mês!";
    else if ((despesa / receita) > 0.8) conselho = "⚠️ Alerta: Você está comprometendo 80% da sua renda.";
    
    dicasIA.innerText = conselho;
}

document.getElementById("btn-tema").onclick = () => {
    document.body.classList.toggle("light");
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
        options: { 
            responsive: true,
            plugins: { legend: { position: 'bottom', labels: { color: document.body.classList.contains('light') ? '#000' : '#fff' } } } 
        }
    });
}

// PDF Export
document.getElementById("btn-pdf").onclick = () => {
    Swal.fire("PDF", "Gerando relatório...", "success");
    const { jsPDF } = window.jspdf;
    const docPdf = new jsPDF();
    docPdf.text("Relatório Nós Dois & Eu", 10, 10);
    docPdf.text(`Total Receitas: R$ ${document.getElementById("dinheiro").innerText}`, 10, 20);
    docPdf.text(`Total Despesas: R$ ${document.getElementById("contas").innerText}`, 10, 30);
    docPdf.save("financeiro.pdf");
};

// Funções Globais
window.excluirTransacao = async (id) => {
    const res = await Swal.fire({ title: 'Excluir transação?', showCancelButton: true });
    if (res.isConfirmed) {
        await deleteDoc(doc(db, "transactions", id));
        if (usuarioDados.plano === "free") carregarDados(auth.currentUser);
    }
};

window.alterarStatus = async (id, statusAtual) => {
    await updateDoc(doc(db, "transactions", id), { pago: !statusAtual });
    if (usuarioDados.plano === "free") carregarDados(auth.currentUser);
};

function showLogin() {
    loginSec.style.display = "block";
    appSec.style.display = "none";
}