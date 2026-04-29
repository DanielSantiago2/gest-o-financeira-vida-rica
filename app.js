// ================================
// 🔥 FIREBASE IMPORTS
// ================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// ================================
// 🔥 FIREBASE CONFIG
// ================================
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

// ================================
// 🎯 ELEMENTOS
// ================================
const btnLogin = document.getElementById("btn-login");
const btnCadastrar = document.getElementById("btn-cadastrar");
const btnGoogle = document.getElementById("btn-google");
const btnRecuperar = document.getElementById("btn-recuperar");
const btnSair = document.getElementById("btn-sair");
const btnSalvar = document.getElementById("btn-salvar");
const btnPdf = document.getElementById("btn-pdf");

const inputEmail = document.getElementById("email");
const inputSenha = document.getElementById("senha");

const lista = document.getElementById("lista");
const total = document.getElementById("total");

let meuGrafico = null;

// ================================
// 🌱 CATEGORIAS
// ================================
const categorias = {
  despesa: ["Casa", "Alimentação", "Transporte", "Cartão", "Saúde"],
  receita: ["Salário", "Venda", "Extra", "Investimento"]
};

function carregarCategorias() {
  const tipo =
    document.querySelector('input[name="tipo"]:checked')?.value || "despesa";

  const select = document.getElementById("categoria");
  const filtro = document.getElementById("filtro-categoria");

  select.innerHTML = "";
  filtro.innerHTML = `<option value="">Todas categorias</option>`;

  categorias[tipo].forEach(cat => {
    select.innerHTML += `<option>${cat}</option>`;
    filtro.innerHTML += `<option>${cat}</option>`;
  });
}

// ================================
// 🔐 LOGIN
// ================================
async function login() {
  try {
    await signInWithEmailAndPassword(
      auth,
      inputEmail.value,
      inputSenha.value
    );
  } catch (e) {
    Swal.fire("Erro", e.message, "error");
  }
}

async function loginGoogle() {
  try {
    const provider = new GoogleAuthProvider();

    await signInWithPopup(auth, provider);

    Swal.fire(
      "Sucesso",
      "Login com Google realizado!",
      "success"
    );

  } catch (e) {
    Swal.fire("Erro", e.message, "error");
  }
}

async function cadastrar() {
  try {
    await createUserWithEmailAndPassword(
      auth,
      inputEmail.value,
      inputSenha.value
    );

    Swal.fire("Conta criada!", "", "success");
  } catch (e) {
    Swal.fire("Erro", e.message, "error");
  }
}

async function recuperarSenha() {
  const email = inputEmail.value.trim();

  if (!email) {
    return Swal.fire("Digite seu e-mail primeiro");
  }

  try {
    await sendPasswordResetEmail(auth, email);

    Swal.fire(
      "Enviado!",
      "Link para redefinir senha enviado ao e-mail.",
      "success"
    );

  } catch (e) {
    Swal.fire("Erro", e.message, "error");
  }
}

// ================================
// 💾 SALVAR
// ================================
async function salvar() {
  try {
    const desc = document.getElementById("desc").value.trim();
    const valor = parseFloat(document.getElementById("valor").value);

    const tipo =
      document.querySelector('input[name="tipo"]:checked')?.value;

    const categoria = document.getElementById("categoria").value;

    const vencimento =
      document.getElementById("vencimento").value || "";

    const fixo = document.getElementById("fixo").checked;
    const parcelado =
      document.getElementById("parcelado").checked;

    const parcelas =
      parseInt(document.getElementById("parcelas").value) || 1;

    if (!desc || isNaN(valor)) {
      return Swal.fire(
        "Erro",
        "Preencha descrição e valor",
        "warning"
      );
    }

    await addDoc(collection(db, "transacoes"), {
      desc,
      valor,
      tipo,
      categoria,
      vencimento,
      fixo,
      parcelado,
      parcelas,
      pago: false,
      data: new Date(),
      userId: auth.currentUser.uid
    });

    document.getElementById("desc").value = "";
    document.getElementById("valor").value = "";

    Swal.fire("Salvo!", "", "success");

    carregar();

  } catch (e) {
    Swal.fire("Erro", e.message, "error");
  }
}

// ================================
// 📥 CARREGAR
// ================================
async function carregar() {
  if (!auth.currentUser) return;

  lista.innerHTML = "Carregando...";

  const snapshot = await getDocs(
    query(
      collection(db, "transacoes"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("data", "desc")
    )
  );

  lista.innerHTML = "";

  let saldo = 0;
  let ganhos = 0;
  let gastos = 0;
  let dadosGrafico = {};

  snapshot.forEach(docSnap => {
    const item = docSnap.data();
    const id = docSnap.id;

    if (item.tipo === "receita") {
      saldo += item.valor;
      ganhos += item.valor;
    } else {
      saldo -= item.valor;
      gastos += item.valor;

      if (!dadosGrafico[item.categoria]) {
        dadosGrafico[item.categoria] = 0;
      }

      dadosGrafico[item.categoria] += item.valor;
    }

    let classe = item.tipo;

        // STATUS VENCIMENTO
    if (item.pago) {
      classe += " pago";
    } else if (item.vencimento) {

      const hoje = new Date();
      const vence = new Date(item.vencimento);

      hoje.setHours(0,0,0,0);
      vence.setHours(0,0,0,0);

      const diff =
        Math.ceil((vence - hoje) / (1000 * 60 * 60 * 24));

      if (diff < 0) classe += " vencido";
      else if (diff <= 3) classe += " vence-hoje";
    }

    lista.innerHTML += `
      <div class="card ${classe}">
        <strong>${item.desc}</strong><br>
        ${item.categoria} • R$ ${item.valor.toFixed(2)}<br>
        ${item.vencimento ? "Vence: " + item.vencimento + "<br>" : ""}

        <div class="acoes">
          <button onclick="marcarPago('${id}')">✅</button>
          <button onclick="editarItem('${id}','${item.desc}',${item.valor})">✏️</button>
          <button onclick="excluirItem('${id}')">🗑️</button>
        </div>
      </div>
    `;
  });

  total.innerText =
    saldo.toLocaleString("pt-BR", {
      minimumFractionDigits: 2
    });

  renderizarGrafico(dadosGrafico);

  if (lista.innerHTML === "") {
    lista.innerHTML =
      `<div class="vazio">Nenhum registro encontrado</div>`;
  }

  verificarAlertas();
}

// ================================
// 📊 GRÁFICO
// ================================
function renderizarGrafico(dados) {
  const ctx = document.getElementById("meuGrafico");

  if (meuGrafico) meuGrafico.destroy();

  meuGrafico = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(dados),
      datasets: [{
        data: Object.values(dados)
      }]
    }
  });
}

// ================================
// ✏️ EDITAR
// ================================
async function editarItem(id, desc, valor) {

  const { value: formValues } = await Swal.fire({
    title: "Editar",
    html: `
      <input id="swal-desc" class="swal2-input" value="${desc}">
      <input id="swal-valor" class="swal2-input" type="number" value="${valor}">
    `,
    showCancelButton: true,
    confirmButtonText: "Salvar",
    preConfirm: () => ({
      desc: document.getElementById("swal-desc").value,
      valor: parseFloat(
        document.getElementById("swal-valor").value
      )
    })
  });

  if (!formValues) return;

  await updateDoc(doc(db, "transacoes", id), {
    desc: formValues.desc,
    valor: formValues.valor
  });

  carregar();
}

// ================================
// 🗑️ EXCLUIR
// ================================
async function excluirItem(id) {

  const ok = await Swal.fire({
    title: "Excluir item?",
    icon: "warning",
    showCancelButton: true
  });

  if (!ok.isConfirmed) return;

  await deleteDoc(doc(db, "transacoes", id));

  carregar();
}

// ================================
// ✅ MARCAR PAGO
// ================================
async function marcarPago(id) {
  await updateDoc(doc(db, "transacoes", id), {
    pago: true
  });

  carregar();
}

// ================================
// 🔔 ALERTAS
// ================================
function verificarAlertas() {
  const vencidas =
    document.querySelectorAll(".vencido").length;

  const vencer =
    document.querySelectorAll(".vence-hoje").length;

  if (vencidas > 0 || vencer > 0) {
    Swal.fire({
      title: "Contas Pendentes",
      html:
        `🔴 Vencidas: ${vencidas}<br>` +
        `🟡 Próximas: ${vencer}`,
      icon: "warning"
    });
  }
}

// ================================
// 📄 PDF
// ================================
async function gerarPDF() {
  if (!auth.currentUser) return;

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const snapshot = await getDocs(
      query(
        collection(db, "transacoes"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("data", "desc")
      )
    );

    let receitas = 0;
    let despesas = 0;
    let linhas = [];

    function limparTexto(txt = "") {
      return txt
        .replace(/[^\w\sÀ-ÿ()-]/g, "") // remove emoji
        .trim();
    }

    snapshot.forEach(docSnap => {
      const item = docSnap.data();

      const data = item.data?.seconds
        ? new Date(item.data.seconds * 1000).toLocaleDateString("pt-BR")
        : "-";

      const descricao = limparTexto(item.desc);
      const categoria = limparTexto(item.categoria);

      if (item.tipo === "receita") {
        receitas += item.valor;
      } else {
        despesas += item.valor;
      }

      linhas.push([
        data,
        descricao,
        categoria,
        item.tipo === "receita" ? "Receita" : "Despesa",
        `R$ ${item.valor.toFixed(2)}`
      ]);
    });

    const saldo = receitas - despesas;

    // CABEÇALHO
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Nós Dois & Eu", 14, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Relatório Financeiro Premium", 14, 26);

    doc.setDrawColor(230);
    doc.line(14, 30, 196, 30);

    // RESUMO
    doc.setFontSize(11);
    doc.text(`Emitido em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 40);

    doc.setTextColor(34, 197, 94);
    doc.text(`Receitas: R$ ${receitas.toFixed(2)}`, 14, 52);

    doc.setTextColor(239, 68, 68);
    doc.text(`Despesas: R$ ${despesas.toFixed(2)}`, 14, 60);

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`Saldo Atual: R$ ${saldo.toFixed(2)}`, 14, 74);

    // TABELA
    doc.autoTable({
      startY: 85,
      head: [["Data", "Descrição", "Categoria", "Tipo", "Valor"]],
      body: linhas,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: 40
      },
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: 0,
        fontStyle: "bold"
      },
      columnStyles: {
        4: { halign: "right" }
      },
      alternateRowStyles: {
        fillColor: [252, 252, 252]
      }
    });

    let finalY = doc.lastAutoTable.finalY + 15;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo Final", 14, finalY);

    finalY += 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Total de Transações: ${linhas.length}`, 14, finalY);

    // RODAPÉ
    const paginas = doc.internal.getNumberOfPages();

    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`Página ${i} de ${paginas}`, 170, 290);
    }

    doc.save("relatorio-premium-nos-dois-e-eu.pdf");

  } catch (e) {
    console.error(e);
    Swal.fire("Erro", e.message, "error");
  }
}

// ================================
// 🔁 EVENTOS
// ================================
btnLogin?.addEventListener("click", login);
btnCadastrar?.addEventListener("click", cadastrar);
btnGoogle?.addEventListener("click", loginGoogle);
btnRecuperar?.addEventListener("click", recuperarSenha);
btnSalvar?.addEventListener("click", salvar);
btnPdf?.addEventListener("click", gerarPDF);

btnSair?.addEventListener("click", () => signOut(auth));

document
  .querySelectorAll('input[name="tipo"]')
  .forEach(r => r.addEventListener("change", carregarCategorias));

// ================================
// 🔄 LOGIN STATE
// ================================
onAuthStateChanged(auth, user => {

  document.getElementById("secao-login").style.display =
    user ? "none" : "block";

  document.getElementById("secao-app").style.display =
    user ? "block" : "none";

  if (user) {
    document.getElementById("usuario-logado").innerText =
      user.email;

    carregarCategorias();
    carregar();
  }
});

// GLOBAL
window.editarItem = editarItem;
window.excluirItem = excluirItem;
window.marcarPago = marcarPago;