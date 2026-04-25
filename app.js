
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


// =============================
// 🔥 IMPORTS FIREBASE
// =============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";

import {
  getFirestore, collection, addDoc, getDocs,
  query, orderBy, where
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

import {
  getAuth, createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

// =============================
// 🔥 CONFIG FIREBASE
// =============================
const firebaseConfig = {
  apiKey: "AIzaSyD7Kr-ee-NLtK21wVh1GBLazZKIeigkzsU",
  authDomain: "vida-rica-app-bc076.firebaseapp.com",
  projectId: "vida-rica-app-bc076",
  storageBucket: "vida-rica-app-bc076.firebasestorage.app",
  messagingSenderId: "284683038291",
  appId: "1:284683038291:web:f07db423b5fb99dc1520a6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// =============================
// 🎯 ELEMENTOS
// =============================
const btnSalvar = document.getElementById("btn-salvar");
const btnLogin = document.getElementById("btn-login");
const btnCadastrar = document.getElementById("btn-cadastrar");
const btnSair = document.getElementById("btn-sair");
const btnPdf = document.getElementById("btn-pdf");

const filtroMes = document.getElementById("filtro-mes");
const btnFiltrar = document.getElementById("btn-filtrar");
const btnLimpar = document.getElementById("btn-limpar");

const inputEmail = document.getElementById("email");
const inputSenha = document.getElementById("senha");

const btnAddCategoria = document.getElementById("btn-add-categoria");
const seletorModo = document.getElementById("seletor-modo");

let meuGrafico = null;
const ID_CASAL = "familia_santiago_2026";

// =============================
// 🔄 TIPO
// =============================
function getTipoSelecionado() {
  const tipo = document.querySelector('input[name="tipo"]:checked')?.value;
  return tipo === "ganho" ? "receita" : tipo;
}

// =============================
// 🌱 CATEGORIAS PADRÃO
// =============================
const categoriasPadrao = {
  despesa: ["🏠 Casa", "🍔 Alimentação", "🚗 Transporte"],
  receita: ["💰 Salário", "📈 Investimentos"]
};

// =============================
// 🔥 CRIAR CATEGORIAS GLOBAIS
// =============================
async function criarCategoriasGlobais() {
  const snapshot = await getDocs(
    query(collection(db, "categorias"), where("userId", "==", "global"))
  );

  const existentes = [];

  snapshot.forEach(doc => {
    const d = doc.data();
    existentes.push(d.nome + "_" + d.tipo);
  });

  for (let tipo in categoriasPadrao) {
    for (let nome of categoriasPadrao[tipo]) {
      const chave = nome + "_" + tipo;

      if (!existentes.includes(chave)) {
        await addDoc(collection(db, "categorias"), {
          nome,
          tipo,
          userId: "global"
        });
      }
    }
  }
}

// =============================
// 📥 CARREGAR CATEGORIAS
// =============================
async function carregarCategorias() {
  if (!auth.currentUser) return;

  const tipo = getTipoSelecionado();
  const select = document.getElementById("categoria");
  const filtroSelect = document.getElementById("filtro-categoria");

  if (!select) return;

  select.innerHTML = "";
  if (filtroSelect) filtroSelect.innerHTML = '<option value="">Todas categorias</option>';

  const snapshot = await getDocs(collection(db, "categorias"));

  snapshot.forEach(docSnap => {
    const data = docSnap.data();

    if (
      data.tipo === tipo &&
      (data.userId === "global" || data.userId === auth.currentUser.uid)
    ) {
      // select normal
      const option = document.createElement("option");
      option.value = data.nome;
      option.textContent = data.nome;
      select.appendChild(option);

      // filtro
      if (filtroSelect) {
        const opt = document.createElement("option");
        opt.value = data.nome;
        opt.textContent = data.nome;
        filtroSelect.appendChild(opt);
      }
    }
  });
}

// =============================
// 💾 SALVAR
// =============================
async function salvar() {
  try {
    const desc = document.getElementById("desc").value.trim();
    const valor = parseFloat(document.getElementById("valor").value);
    const tipo = getTipoSelecionado();
    const categoria = document.getElementById("categoria").value;

    const modo = seletorModo ? seletorModo.value : "solteiro";

    if (!desc || isNaN(valor) || valor <= 0) {
      return Swal.fire("Erro", "Preencha corretamente", "error");
    }

    await addDoc(collection(db, "transacoes"), {
      desc,
      valor,
      tipo,
      categoria,
      data: new Date(),
      userId: auth.currentUser.uid,
      grupoId: modo === "casal" ? ID_CASAL : "individual"
    });

    document.getElementById("desc").value = "";
    document.getElementById("valor").value = "";

    Swal.fire("Sucesso", "Salvo!", "success");

    carregar();

  } catch (e) {
    Swal.fire("Erro", e.message, "error");
  }
}

// =============================
// 📥 CARREGAR
// =============================
async function carregar() {
  if (!auth.currentUser) return;

  const lista = document.getElementById("lista");
  lista.innerHTML = "Carregando...";

  const filtroCategoria = document.getElementById("filtro-categoria")?.value;
  const filtroTipo = document.getElementById("filtro-tipo")?.value;
  const busca = document.getElementById("busca")?.value?.toLowerCase() || "";

  let inicio = null;
  let fim = null;

  if (filtroMes?.value) {
    const [ano, mes] = filtroMes.value.split("-");
    inicio = new Date(ano, mes - 1, 1);
    fim = new Date(ano, mes, 0, 23, 59, 59);
  }

  const ref = collection(db, "transacoes");
  let constraints = [];

  if (seletorModo?.value === "casal") {
    constraints.push(where("grupoId", "==", ID_CASAL));
  } else {
    constraints.push(where("userId", "==", auth.currentUser.uid));
    constraints.push(where("grupoId", "==", "individual"));
  }

  if (inicio && fim) {
    constraints.push(where("data", ">=", inicio));
    constraints.push(where("data", "<=", fim));
  }

  constraints.push(orderBy("data", "desc"));

  const snapshot = await getDocs(query(ref, ...constraints));

  let saldo = 0, ganhos = 0, gastos = 0;
  lista.innerHTML = "";

  snapshot.forEach(docSnap => {
    const item = docSnap.data();

    if (busca && !item.desc.toLowerCase().includes(busca)) return;
    if (filtroCategoria && item.categoria !== filtroCategoria) return;
    if (filtroTipo && item.tipo !== filtroTipo) return;

    if (item.tipo === "despesa") {
      saldo -= item.valor;
      gastos += item.valor;
    } else {
      saldo += item.valor;
      ganhos += item.valor;
    }

    lista.innerHTML += `
      <div class="card ${item.tipo}">
        <strong>${item.desc}</strong><br>
        ${item.categoria} - R$ ${item.valor.toFixed(2)}
      </div>
    `;
  });

  document.getElementById("total").innerText =
    saldo.toLocaleString("pt-br", { minimumFractionDigits: 2 });

  renderizarGrafico(ganhos, gastos);
}

// =============================
// 📊 GRÁFICO
// =============================
function renderizarGrafico(ganhos, gastos) {
  const ctx = document.getElementById("meuGrafico");

  if (!ctx) return;
  if (meuGrafico) meuGrafico.destroy();

  meuGrafico = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Ganhos", "Gastos"],
      datasets: [{
        data: [ganhos, gastos],
        backgroundColor: ["#22c55e", "#ef4444"]
      }]
    }
  });
}

// =============================
// 📄 PDF PROFISSIONAL MELHORADO
// =============================
async function gerarPDF() {
  if (!auth.currentUser) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Relatório Financeiro", 14, 15);

  doc.setFontSize(10);
  doc.text(`Usuário: ${auth.currentUser.email}`, 14, 22);

  const canvas = document.getElementById("meuGrafico");

  if (canvas) {
    const img = canvas.toDataURL("image/png");
    doc.addImage(img, "PNG", 20, 30, 160, 100);
  }

  doc.save("relatorio.pdf");
}

// =============================
// 🔐 AUTH
// =============================
async function login() {
  try {
    await signInWithEmailAndPassword(auth, inputEmail.value, inputSenha.value);
  } catch (e) {
    Swal.fire("Erro", e.message, "error");
  }
}

async function cadastrar() {
  try {
    await createUserWithEmailAndPassword(auth, inputEmail.value, inputSenha.value);
  } catch (e) {
    if (e.code === "auth/email-already-in-use") {
      return Swal.fire("Erro", "Email já cadastrado", "warning");
    }
    Swal.fire("Erro", e.message, "error");
  }
}

// =============================
// 🔁 EVENTOS
// =============================
btnSalvar?.addEventListener("click", salvar);
btnLogin?.addEventListener("click", login);
btnCadastrar?.addEventListener("click", cadastrar);
btnSair?.addEventListener("click", () => signOut(auth));

btnFiltrar?.addEventListener("click", carregar);
btnLimpar?.addEventListener("click", () => {
  if (filtroMes) filtroMes.value = "";
  carregar();
});

btnPdf?.addEventListener("click", gerarPDF);

// =============================
// 🔄 LOGIN STATE
// =============================
onAuthStateChanged(auth, async (user) => {

  document.getElementById("secao-login").style.display = user ? "none" : "block";
  document.getElementById("secao-app").style.display = user ? "block" : "none";

  if (user) {
    document.getElementById("usuario-logado").innerText = user.email;

    await criarCategoriasGlobais();
    await carregarCategorias();
    carregar();
  }
});