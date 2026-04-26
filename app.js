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
      const option = document.createElement("option");
      option.value = data.nome;
      option.textContent = data.nome;
      select.appendChild(option);

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
  let categorias = {};
  lista.innerHTML = "";

  snapshot.forEach(docSnap => {
    const item = docSnap.data();

    const desc = item.desc?.toLowerCase() || "";

    if (busca && !desc.includes(busca)) return;
    if (filtroCategoria && item.categoria !== filtroCategoria) return;
    if (filtroTipo && item.tipo !== filtroTipo) return;

    if (item.tipo === "despesa") {
      saldo -= item.valor;
      gastos += item.valor;

      // CORREÇÃO AQUI 👇
      if (!categorias[item.categoria]) {
        categorias[item.categoria] = 0;
      }
      categorias[item.categoria] += item.valor;

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

  renderizarGraficoPorCategoria(categorias);

  if (lista.innerHTML === "") {
    lista.innerHTML = "<p style='text-align:center;'>Nenhum registro encontrado</p>";
  }
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

function renderizarGraficoPorCategoria(dados) {
  const ctx = document.getElementById("meuGrafico");

  if (!ctx) return;
  if (meuGrafico) meuGrafico.destroy();

  const labels = Object.keys(dados);
  const valores = Object.values(dados);

  meuGrafico = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: valores
      }]
    }
  });
}

function limparTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^\x00-\x7F]/g, "");   // remove caracteres estranhos
}

// =============================
// 📄 PDF
// =============================
async function gerarPDF() {
  if (!auth.currentUser) return;

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 20;

    // =============================
    // 🏦 CABEÇALHO
    // =============================
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 20, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text("VIDA RICA - EXTRATO", 14, 13);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    y = 30;

    doc.text(`Usuário: ${auth.currentUser.email}`, 14, y);
    y += 10;

    // =============================
    // 🔍 FILTROS
    // =============================
    const filtroCategoria = document.getElementById("filtro-categoria")?.value;
    const filtroTipo = document.getElementById("filtro-tipo")?.value;

    if (filtroMes?.value) {
      doc.text(`Mês: ${filtroMes.value}`, 14, y);
      y += 6;
    }

    if (filtroCategoria) {
      doc.text(`Categoria: ${filtroCategoria}`, 14, y);
      y += 6;
    }

    if (filtroTipo) {
      doc.text(`Tipo: ${filtroTipo}`, 14, y);
      y += 6;
    }

    y += 5;

    // =============================
    // 📊 BUSCAR DADOS
    // =============================
    const snapshot = await getDocs(collection(db, "transacoes"));

    let totalGanhos = 0;
    let totalGastos = 0;

    // =============================
    // 📋 CABEÇALHO TABELA
    // =============================
    doc.setFillColor(30, 41, 59); // azul escuro
    
    doc.rect(10, y, 190, 8, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);

    doc.text("Data", 10, y + 5);
    doc.text("Descrição", 30, y + 5);
    doc.text("Categoria", 90, y + 5);
    doc.text("Tipo", 140, y + 5);
    doc.text("Valor", 200, y + 5, { align: "right" });

    doc.setTextColor(0, 0, 0);
    y += 12;

    doc.setFont(undefined, "normal");

    // =============================
    // 📄 LINHAS
    // =============================
    snapshot.forEach(docSnap => {
      const item = docSnap.data();

      if (filtroCategoria && item.categoria !== filtroCategoria) return;
      if (filtroTipo && item.tipo !== filtroTipo) return;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      let dataFormatada = "";
      if (item.data?.seconds) {
        dataFormatada = new Date(item.data.seconds * 1000).toLocaleDateString("pt-BR");
      }

      if (item.tipo === "despesa") {
        totalGastos += item.valor;
        doc.setTextColor(239, 68, 68);
      } else {
        totalGanhos += item.valor;
        doc.setTextColor(34, 197, 94);
      }

      // Quebra automática de texto
      const desc = doc.splitTextToSize(item.desc, 50);
      const categoria = doc.splitTextToSize(item.categoria, 35);

      // Data
      doc.text(dataFormatada, 10, y);

      // Descrição (quebra automática)
      doc.text(desc, 30, y);

      // Categoria (quebra automática)
      doc.text(categoria, 90, y);

      // Tipo
      doc.text(item.tipo === "despesa" ? "Gasto" : "Ganho", 140, y);

      // Valor alinhado à direita
      doc.text(`R$ ${item.valor.toFixed(2)}`, 200, y, { align: "right" });

      // Ajusta altura da linha dinamicamente
      const alturaLinha = Math.max(desc.length, categoria.length) * 5;
      y += alturaLinha;

      
      doc.setTextColor(0, 0, 0);

      y += 6;
    });

    // =============================
    // 📈 RESUMO
    // =============================
    y += 10;

    doc.setFont(undefined, "bold");

    doc.setTextColor(34, 197, 94);
    doc.text(`Ganhos: R$ ${totalGanhos.toFixed(2)}`, 14, y);
    y += 6;

    doc.setTextColor(239, 68, 68);
    doc.text(`Gastos: R$ ${totalGastos.toFixed(2)}`, 14, y);
    y += 6;

    doc.setTextColor(0, 0, 0);
    doc.text(`Saldo: R$ ${(totalGanhos - totalGastos).toFixed(2)}`, 14, y);

    // =============================
    // 📊 GRÁFICO
    // =============================
    const canvas = document.getElementById("meuGrafico");

    if (canvas) {
      const img = canvas.toDataURL("image/png", 1.0);
      
      doc.addPage();
      doc.text("Resumo Gráfico", 14, 15);
      doc.addImage(img, "PNG", 15, 20, 180, 90);
    }

    // =============================
    // 💾 SALVAR
    // =============================
    doc.save("extrato-profissional.pdf");

  } catch (e) {
    console.error(e);
    Swal.fire("Erro", e.message, "error");
  }
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

// 🔍 BUSCA
const inputBusca = document.getElementById("busca");
inputBusca?.addEventListener("input", carregar);

// 🔄 TROCA TIPO
document.querySelectorAll('input[name="tipo"]').forEach(radio => {
  radio.addEventListener("change", carregarCategorias);
});

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