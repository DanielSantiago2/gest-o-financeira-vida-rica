import { auth, loginEmail, criarConta, loginGoogle, resetarSenha, deslogar } from "./auth.js";
import { db, salvarTransacao, criarQueryTransacoes, deletarDoc, atualizarStatusDoc, salvarMeta, criarQueryMetas, deletarMetaDoc, vincularParceiro } from "./db.js";
import { renderHeader, toggleBotaoLoading, atualizarDashboard } from "./ui.js";
import { atualizarGrafico } from "./chart.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, setDoc, onSnapshot, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let usuarioDados = {}; 
let unsubscribe = null; 

// --- CONFIGURAÇÃO DE CATEGORIAS DINÂMICAS ---
const categoriasPadrao = {
    despesa: ["Moradia", "Alimentação", "Pensão", "Saúde", "Assinatura", "Lazer", "Outros"],
    receita: ["Salário", "Extra", "Freelance", "Investimento", "Outros"]
};

window.atualizarCategorias = (tipo) => {
    const select = document.getElementById("categoria");
    if (!select) return;
    select.innerHTML = ""; 

    categoriasPadrao[tipo].forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.innerText = cat;
        select.appendChild(opt);
    });
};

// Lógica para o botão de nova categoria (+)
document.getElementById("btn-nova-categoria").onclick = async () => {
    const tipo = document.querySelector('input[name="tipo"]:checked').value;
    
    const { value: novaCat } = await Swal.fire({
        title: 'Nova Categoria',
        input: 'text',
        inputLabel: `Nome da categoria de ${tipo === 'despesa' ? 'Gasto' : 'Ganho'}`,
        showCancelButton: true,
        confirmButtonText: 'Adicionar',
        cancelButtonText: 'Cancelar'
    });

    if (novaCat) {
        const select = document.getElementById("categoria");
        const opt = document.createElement("option");
        opt.value = novaCat;
        opt.innerText = novaCat;
        select.appendChild(opt);
        select.value = novaCat; 
    }
};

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
    window.atualizarCategorias('despesa');
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

    // --- ADIÇÃO DA IA: Dispara a análise sempre que os dados carregam ---
    const resumoParaIA = {
        modo: usuarioDados.modo || "solteiro",
        saldo: (totalR - totalD).toFixed(2),
        categorias: catMap
    };
    atualizarDicaComIA(resumoParaIA);
}

// --- FUNÇÃO PARA CHAMAR A IA COM SEGURANÇA ---
async function atualizarDicaComIA(dadosFinanceiros) {
    const painelDica = document.getElementById("dicas-financeiras");
    if (!painelDica) return;

    try {
        const response = await fetch("https://us-central1-vida-rica-app-bc076.cloudfunctions.net/asaaswebhook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosFinanceiros)
        });

        const data = await response.json();
        painelDica.innerText = data.dica || "Dica gerada com sucesso!";
    } catch (erro) {
        console.error("Erro na IA:", erro);
        painelDica.innerText = "IA em repouso. Continue focado nas metas!";
    }
}

async function carregarMetas(uid, saldo) {
    const snap = await getDocs(criarQueryMetas(uid));
    let html = "";
    snap.forEach(docSnap => {
        const m = docSnap.data();
        let p = Math.min(100, Math.max(0, (saldo / m.objetivo) * 100));
        const valorObjetivo = parseFloat(m.objetivo).toFixed(2);
        const valorAtual = saldo.toFixed(2);

        html += `
            <div class="meta-item" style="margin-bottom: 15px; padding: 10px; border-bottom: 1px solid #333;">
                <div style="display:flex; justify-content: space-between; align-items: center">
                    <strong>${m.nome}</strong>
                    <span style="font-size: 0.8rem; color: #888;">${p.toFixed(0)}%</span>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-sec); margin: 5px 0;">
                    R$ ${valorAtual} de R$ ${valorObjetivo}
                </div>
                <div style="display:flex; align-items: center; gap: 10px;">
                    <div class="progresso-bg" style="flex-grow: 1; height: 10px; background: #222; border-radius: 5px; overflow: hidden;">
                        <div class="progresso-barra" style="width:${p}%; height: 100%; background: var(--cor-primaria); transition: width 0.3s"></div>
                    </div>
                    <button class="mini-btn danger" onclick="window.excluirMeta('${docSnap.id}')" style="padding: 2px 5px;">🗑</button>
                </div>
            </div>`;
    });
    document.getElementById("lista-metas").innerHTML = html;
}

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
    const numParcelas = parseInt(document.getElementById("parcelas").value) || 1; 
    const dataInicial = document.getElementById("vencimento").value ? new Date(document.getElementById("vencimento").value) : new Date();

    if (!desc || !valor) return;
    const gid = usuarioDados.modo === "casal" ? usuarioDados.groupId : null;

    toggleBotaoLoading("btn-salvar", true, "Salvando...");

    for (let i = 0; i < numParcelas; i++) {
        const dataParcela = new Date(dataInicial);
        dataParcela.setMonth(dataParcela.getMonth() + i); 

        await salvarTransacao(auth.currentUser.uid, gid, {
            desc: numParcelas > 1 ? `${desc} (${i + 1}/${numParcelas})` : desc,
            valor: Number(valor),
            tipo,
            categoria: document.getElementById("categoria").value,
            data: dataParcela.toISOString().split('T')[0],
            pago: false
        });
    }

    Swal.fire("Sucesso", `${numParcelas} lançamento(s) realizados!`, "success")
        .then(() => location.reload());
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

document.getElementById("btn-pdf").onclick = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const canvas = document.getElementById("meuGrafico");

    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text("Relatório Nós Dois & Eu", 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado por: ${usuarioDados.email}`, 20, 30);
    doc.text(`Data: ${new Date().toLocaleDateString()} | Modo: ${usuarioDados.modo}`, 20, 35);

    const receitas = document.getElementById("dinheiro").innerText;
    const despesas = document.getElementById("contas").innerText;
    const saldo = document.getElementById("falta").innerText;

    doc.setDrawColor(200);
    doc.line(20, 42, 190, 42);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Receitas: R$ ${receitas}`, 20, 52);
    doc.text(`Despesas: R$ ${despesas}`, 20, 60);
    doc.text(`Saldo Líquido: R$ ${saldo}`, 20, 68);

    try {
        const graficoImagem = canvas.toDataURL("image/jpeg", 1.0); 
        doc.text("Distribuição por Categorias:", 20, 80);
        doc.addImage(graficoImagem, 'JPEG', 55, 85, 90, 90); 
    } catch (e) {
        doc.setTextColor(200, 0, 0);
        doc.text("Gráfico indisponível no momento", 20, 85);
    }

    let y = 190; 
    doc.setTextColor(0);
    doc.text("Histórico de Transações:", 20, 185);
    
    const transacoes = document.querySelectorAll("#lista .card");
    transacoes.forEach((card, i) => {
        if (y > 275) { doc.addPage(); y = 20; }
        const info = card.innerText.split('\n')[0].trim();
        doc.setFontSize(9);
        doc.text(`${i + 1}. ${info}`, 20, y);
        y += 8;
    });

    doc.save(`Relatorio_VidaRica_${new Date().toLocaleDateString()}.pdf`);
};