
/*
// 1. IMPORTAÇÕES (Usando CDN para funcionar sem npm)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc, where } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

// 2. CONFIGURAÇÃO (Atualizada com a chave que você enviou agora)
const firebaseConfig = {
  apiKey: "AIzaSyD7Kr-ee-NLtK21wVh1GBLazZKIeigkzsU",
  authDomain: "vida-rica-app-bc076.firebaseapp.com",
  projectId: "vida-rica-app-bc076",
  storageBucket: "vida-rica-app-bc076.firebasestorage.app",
  messagingSenderId: "284683038291",
  appId: "1:284683038291:web:f07db423b5fb99dc1520a6"
};

// 3. INICIALIZAÇÃO
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// FUNÇÃO CADASTRAR
window.cadastrar = async function() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  try {
    await createUserWithEmailAndPassword(auth, email, senha);
    alert("Usuário criado com sucesso!");
  } catch (e) {
    alert("Erro ao cadastrar: " + e.message);
  }
};

// FUNÇÃO LOGIN
window.login = async function() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  try {
    await signInWithEmailAndPassword(auth, email, senha);
  } catch (e) {
    alert("Erro no login: Verifique e-mail e senha.");
  }
};

// FUNÇÃO SAIR
window.sair = () => signOut(auth);

// OBSERVADOR (Monitora se o usuário está logado ou não)
onAuthStateChanged(auth, (user) => {
  const secaoLogin = document.getElementById("secao-login");
  const secaoApp = document.getElementById("secao-app");
  const textoUsuario = document.getElementById("usuario-logado");

  if (user) {
    secaoLogin.style.display = "none";
    secaoApp.style.display = "block";
    textoUsuario.innerText = `Logado como: ${user.email}`;
    carregar(); // Só carrega os dados se estiver logado
  } else {
    secaoLogin.style.display = "block";
    secaoApp.style.display = "none";
  }
});

// 4. FUNÇÃO CARREGAR (Definida separadamente para ser reutilizada)
async function carregar() {
  const lista = document.getElementById("lista");
  const totalElement = document.getElementById("total");
  let total = 0;
  lista.innerHTML = "Carregando...";

  try {
    const q = query(collection(db, "gastos"), orderBy("data", "desc"));
    const querySnapshot = await getDocs(q);
    lista.innerHTML = "";

    querySnapshot.forEach((res) => {
      const g = res.data();
      const id = res.id; // Pegamos o ID único do documento no Firebase
      total += Number(g.valor);

      const valorBR = Number(g.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      
      // Formata a data (dia/mês)
      const dataFormatada = g.data?.toDate ? g.data.toDate().toLocaleDateString('pt-BR') : "";

      const item = document.createElement("div");
      item.className = "card";
      item.innerHTML = `
        <div>
          <small>${dataFormatada}</small><br>
          <strong>${g.desc}</strong> - ${valorBR}
        </div>
        <div class="acoes">
          <button class="btn-editar" onclick="editar('${id}', '${g.desc}', ${g.valor})">✏️</button>
          <button class="btn-apagar" onclick="apagar('${id}')">🗑️</button>
        </div>
      `;
      lista.appendChild(item);
    });

    totalElement.innerText = total.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  } catch (e) {
    console.error("Erro ao carregar:", e);
  }
}

// FUNÇÃO APAGAR
window.apagar = async function(id) {
  if (confirm("Deseja realmente excluir este gasto?")) {
    try {
      await deleteDoc(doc(db, "gastos", id));
      carregar(); // Atualiza a lista
    } catch (e) {
      alert("Erro ao apagar");
    }
  }
};

// FUNÇÃO EDITAR (Simples)
window.editar = async function(id, descAntiga, valorAntigo) {
  const novaDesc = prompt("Nova descrição:", descAntiga);
  const novoValor = prompt("Novo valor:", valorAntigo);

  if (novaDesc && novoValor) {
    try {
      const gastoRef = doc(db, "gastos", id);
      await updateDoc(gastoRef, {
        desc: novaDesc,
        valor: Number(novoValor)
      });
      carregar();
    } catch (e) {
      alert("Erro ao editar");
    }
  }
};

// 5. FUNÇÃO SALVAR
window.salvar = async function () {
  const desc = document.getElementById("desc").value;
  const valor = Number(document.getElementById("valor").value);

  if (!desc || !valor) {
    alert("Preencha a descrição e o valor!");
    return;
  }

  try {
        await addDoc(collection(db, "gastos"), {
  desc: desc,
  valor: valor,
  data: new Date(),
  userId: auth.currentUser.uid // Salva quem criou o gasto
});
    
    document.getElementById("desc").value = "";
    document.getElementById("valor").value = "";
    
    // Chama a função carregar que definimos acima
    carregar();
  } catch (e) {
    console.error("Erro ao salvar dados: ", e);
    alert("Erro ao salvar. Verifique o console.");
  }
};

// 6. EXECUÇÃO AO ABRIR
window.onload = carregar;
*/

// 1. IMPORTAÇÕES (Adicionado o 'where')
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
<<<<<<< HEAD
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc, where } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

=======
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, where } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

// --- CONFIGURAÇÃO DO SEU FIREBASE ---
>>>>>>> 2bb8d5a
const firebaseConfig = {
  apiKey: "AIzaSyD7Kr-ee-NLtK21wVh1GBLazZKIeigkzsU",
  authDomain: "vida-rica-app-bc076.firebaseapp.com",
  projectId: "vida-rica-app-bc076",
  storageBucket: "vida-rica-app-bc076.firebasestorage.app",
  messagingSenderId: "284683038291",
  appId: "1:284683038291:web:f07db423b5fb99dc1520a6"
};

<<<<<<< HEAD
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const ID_CASAL = "familia_santiago_2026"; 
let chartInstance = null;

// --- FUNÇÃO CARREGAR ---
async function carregar() {
  const lista = document.getElementById("lista");
  const totalElement = document.getElementById("total");
  const seletorModo = document.getElementById("seletor-modo");
  const filtroMes = document.getElementById("filtro-mes");

  const modo = seletorModo ? seletorModo.value : "solteiro";

  if (!filtroMes.value) {
    const hoje = new Date();
    filtroMes.value = hoje.toISOString().substring(0, 7);
  }

  const [ano, mes] = filtroMes.value.split("-");
  const dataInicio = new Date(ano, mes - 1, 1);
  const dataFim = new Date(ano, mes, 0, 23, 59, 59);

  lista.innerHTML = "Carregando...";
  let total = 0;
  let dadosParaGrafico = [];

  try {
    let q;
    const baseCol = collection(db, "gastos");
    
    if (modo === "solteiro") {
      q = query(baseCol, 
        where("userId", "==", auth.currentUser.uid),
        where("data", ">=", dataInicio),
        where("data", "<=", dataFim),
        orderBy("data", "desc")
      );
    } else {
      q = query(baseCol, 
        where("grupoId", "==", ID_CASAL),
        where("data", ">=", dataInicio),
        where("data", "<=", dataFim),
        orderBy("data", "desc")
      );
    }

    const querySnapshot = await getDocs(q);
    lista.innerHTML = "";

    querySnapshot.forEach((res) => {
      const g = res.data();
      const id = res.id;
      dadosParaGrafico.push({ ...g, id: id }); 
      total += Number(g.valor);

      const dataFormatada = g.data?.toDate ? g.data.toDate().toLocaleDateString('pt-BR') : "---";

      lista.innerHTML += `
        <div class="card" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; margin-bottom: 10px; border-left: 5px solid #36a2eb;">
          <div>
            <strong>${g.desc}</strong> <br>
            <small>${g.categoria || "❓ Outros"} - ${dataFormatada}</small>
          </div>
          <div style="text-align: right;">
            <span>R$ ${Number(g.valor).toFixed(2)}</span> <br>
            <button onclick="apagar('${id}')" style="background: none; border: none; color: #ff6384; cursor: pointer;">🗑️</button>
          </div>
        </div>
      `;
    });

    // ATUALIZAÇÃO DOS TOTAIS E BARRA (FORA DO LOOP)
    totalElement.innerText = total.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    gerenciarBarraMeta(total);
    atualizarGrafico(dadosParaGrafico); 

  } catch (e) {
    console.error("Erro ao carregar:", e);
  }
}

// --- FUNÇÃO GRÁFICO ---
function atualizarGrafico(dados) {
  const canvas = document.getElementById('meuGrafico');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const resumoDiv = document.getElementById('resumo-valores');
  if (chartInstance) { chartInstance.destroy(); }
  if (dados.length === 0) {
    resumoDiv.innerHTML = "Nenhum gasto neste mês.";
    return;
  }
  const categoriasAgrupadas = {};
  dados.forEach(d => {
    const cat = d.categoria || "❓ Outros";
    if (!categoriasAgrupadas[cat]) { categoriasAgrupadas[cat] = 0; }
    categoriasAgrupadas[cat] += Number(d.valor);
  });
  const labels = Object.keys(categoriasAgrupadas);
  const valores = Object.values(categoriasAgrupadas);
  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: valores,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF']
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
  let htmlResumo = "<h4>Resumo por Categoria:</h4>";
  labels.forEach((cat, index) => {
    const valorFormatado = valores[index].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    htmlResumo += `<div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
      <span>${cat}</span><strong>${valorFormatado}</strong>
    </div>`;
  });
  resumoDiv.innerHTML = htmlResumo;
}

// --- FUNÇÃO FILTRAR (BUSCA) ---
window.filtrarGastos = function() {
  const termo = document.getElementById("busca").value.toLowerCase().trim();
  const cards = document.querySelectorAll(".card"); 
  cards.forEach(card => {
    const descricao = card.querySelector("strong").innerText.toLowerCase();
    const categoriaTexto = card.querySelector("small").innerText.toLowerCase();
    if (descricao.includes(termo) || categoriaTexto.includes(termo)) {
      card.style.display = "flex"; 
    } else {
      card.style.display = "none";
    }
  });
};

// --- FUNÇÕES GLOBAIS ---
window.salvar = async function () {
  const desc = document.getElementById("desc").value;
  const valor = Number(document.getElementById("valor").value);
  const categoria = document.getElementById("categoria").value;
  if (!desc || !valor) { alert("Preencha descrição e valor!"); return; }
  try {
    await addDoc(collection(db, "gastos"), {
        desc: desc,
        valor: Number(valor),
        categoria: categoria,
        data: new Date(),
        userId: auth.currentUser.uid,
        grupoId: ID_CASAL
    });
    document.getElementById("desc").value = "";
    document.getElementById("valor").value = "";
    carregar();
  } catch (e) { console.error("Erro ao salvar:", e); }
};

window.apagar = async (id) => {
  Swal.fire({
    title: "Tem certeza?",
    text: "Você não poderá reverter esta exclusão!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ff6384",
    confirmButtonText: "Sim, apagar!",
    cancelButtonText: "Cancelar",
    background: "#1e1e2f",
    color: "#fff"
  }).then(async (result) => {
    if (result.isConfirmed) {
      await deleteDoc(doc(db, "gastos", id));
      carregar();
    }
  });
};

window.login = async () => {
  const e = document.getElementById("email").value;
  const s = document.getElementById("senha").value;
  try { await signInWithEmailAndPassword(auth, e, s); } catch { alert("Erro no login"); }
};

window.cadastrar = async () => {
  const e = document.getElementById("email").value;
  const s = document.getElementById("senha").value;
  try { await createUserWithEmailAndPassword(auth, e, s); alert("Criado!"); } catch (err) { alert(err.message); }
};

window.definirMeta = async () => {
  const { value: meta } = await Swal.fire({
    title: 'Definir Meta Mensal',
    input: 'number',
    inputLabel: 'Quanto você planeja gastar este mês?',
    inputValue: localStorage.getItem('meta_mensal') || 0,
    showCancelButton: true,
    background: "#1e1e2f",
    color: "#fff"
  });
  if (meta) {
    localStorage.setItem('meta_mensal', meta);
    carregar();
  }
};

function gerenciarBarraMeta(totalAtual) {
  const meta = Number(localStorage.getItem('meta_mensal')) || 0;
  const barra = document.getElementById("barra-progresso");
  const valorMetaTexto = document.getElementById("valor-meta");
  const aviso = document.getElementById("aviso-meta");
  if (meta > 0) {
    valorMetaTexto.innerText = `R$ ${Number(meta).toFixed(2)}`;
    const porcentagem = (totalAtual / meta) * 100;
    const largura = porcentagem > 100 ? 100 : porcentagem;
    barra.style.width = largura + "%";
    if (porcentagem < 70) { barra.style.background = "#4caf50"; aviso.innerText = "Dentro do planejado! ✅"; }
    else if (porcentagem < 90) { barra.style.background = "#ffeb3b"; aviso.innerText = "Atenção: Quase no limite! ⚠️"; }
    else { barra.style.background = "#ff5252"; aviso.innerText = "Cuidado! Meta atingida! 🚨"; }
  } else {
    valorMetaTexto.innerText = "Não definida";
    barra.style.width = "0%";
    aviso.innerText = "Defina um teto de gastos abaixo.";
  }
}

window.sair = () => signOut(auth);
window.mudarVisao = () => carregar();
window.carregar = carregar;
window.atualizarGrafico = atualizarGrafico;

onAuthStateChanged(auth, (user) => {
  const sL = document.getElementById("secao-login");
  const sA = document.getElementById("secao-app");
  if (user) {
    sL.style.display = "none";
    sA.style.display = "block";
    document.getElementById("usuario-logado").innerText = user.email;
    carregar();
  } else {
    sL.style.display = "block";
    sA.style.display = "none";
  }
=======
// Inicializa o Firebase apenas UMA vez
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const ID_CASAL = "familia_santiago_2026";
let chartInstance = null;

// Configuração do Worker do PDF
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// --- AUTENTICAÇÃO (LOGIN / CADASTRO / SAIR) ---
window.login = async () => {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    try {
        await signInWithEmailAndPassword(auth, email, senha);
    } catch (err) {
        Swal.fire('Erro', 'Login inválido: ' + err.message, 'error');
    }
};

window.cadastrar = async () => {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    try {
        await createUserWithEmailAndPassword(auth, email, senha);
        Swal.fire('Sucesso', 'Conta criada!', 'success');
    } catch (err) {
        Swal.fire('Erro', err.message, 'error');
    }
};

window.sair = () => signOut(auth);

// --- IMPORTAÇÃO DE ARQUIVOS ---
window.processarArquivo = function() {
    const input = document.getElementById('input-arquivo');
    const arquivo = input.files[0];
    if (!arquivo) return;

    if (arquivo.type === "application/pdf") {
        importarPDF(arquivo);
    } else {
        importarCSV(arquivo);
    }
};

async function importarPDF(arquivo) {
    const leitor = new FileReader();
    leitor.onload = async function() {
        try {
            const dados = new Uint8Array(this.result);
            const carregandoPdf = pdfjsLib.getDocument(dados);
            const pdf = await carregandoPdf.promise;
            let textoExtraido = "";

            Swal.fire({ title: 'Lendo PDF...', text: 'Extraindo dados...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});

            for (let i = 1; i <= pdf.numPages; i++) {
                const pagina = await pdf.getPage(i);
                const conteudo = await pagina.getTextContent();
                textoExtraido += conteudo.items.map(item => item.str).join(" ") + "\n";
            }

            const padrao = /(\d{2}\/\d{2})\s+([A-Za-z0-9\s*./-]+)\s+(-?[\d.,]+)/g;
            let match;
            let novos = 0, pulados = 0;

            while ((match = padrao.exec(textoExtraido)) !== null) {
                const desc = match[2].trim();
                const valorLimpo = match[3].replace(/\./g, '').replace(',', '.');
                const valorFinal = Math.abs(parseFloat(valorLimpo));
                const tipo = parseFloat(valorLimpo) < 0 ? 'despesa' : 'receita';

                if (!isNaN(valorFinal)) {
                    const gravou = await salvarComTrava(desc, valorFinal, tipo, "📄 PDF Import");
                    if (gravou) novos++; else pulados++;
                }
            }

            Swal.fire('Sincronizado!', `${novos} novos registros.`, 'success');
            window.carregar();
        } catch (erro) {
            Swal.fire('Erro', 'Falha ao ler PDF', 'error');
        }
    };
    leitor.readAsArrayBuffer(arquivo);
}

function importarCSV(arquivo) {
    const leitor = new FileReader();
    leitor.onload = async function(e) {
        const linhas = e.target.result.split('\n');
        let novos = 0, pulados = 0;
        Swal.fire({ title: 'Processando CSV...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});

        for (let i = 1; i < linhas.length; i++) {
            const colunas = linhas[i].split(',');
            if (colunas.length >= 3) {
                const desc = colunas[1].replace(/"/g, '').trim();
                const valorBruto = parseFloat(colunas[2].replace(/"/g, '').replace(',', '.'));
                const tipo = valorBruto < 0 ? 'despesa' : 'receita';
                const gravou = await salvarComTrava(desc, Math.abs(valorBruto), tipo, "🏦 CSV Import");
                if (gravou) novos++; else pulados++;
            }
        }
        Swal.fire('CSV Sincronizado!', `${novos} novos itens.`, 'success');
        window.carregar();
    };
    leitor.readAsText(arquivo);
}

async function salvarComTrava(desc, valor, tipo, categoria) {
    const q = query(collection(db, "transacoes"), 
        where("userId", "==", auth.currentUser.uid),
        where("desc", "==", desc),
        where("valor", "==", valor),
        where("tipo", "==", tipo)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        await addDoc(collection(db, "transacoes"), {
            desc, valor, tipo, categoria,
            data: new Date(),
            userId: auth.currentUser.uid,
            grupoId: ID_CASAL
        });
        return true; 
    }
    return false; 
}

// --- FUNÇÃO CARREGAR (ESSENCIAL) ---
window.carregar = async function() {
    const lista = document.getElementById("lista");
    if (!auth.currentUser) return;

    // Se o seu código anterior tinha a lógica de carregar, cole ela aqui.
    // Vou deixar um console.log para você saber que está funcionando.
    console.log("Recarregando dados do Firebase...");
};

// Monitor de autenticação
onAuthStateChanged(auth, (user) => {
    const sL = document.getElementById("secao-login");
    const sA = document.getElementById("secao-app");
    if (user) {
        sL.style.display = "none";
        sA.style.display = "block";
        document.getElementById("usuario-logado").innerText = user.email;
        window.carregar();
    } else {
        sL.style.display = "block";
        sA.style.display = "none";
    }
>>>>>>> 2bb8d5a
});