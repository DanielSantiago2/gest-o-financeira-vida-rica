// ===================================
// 🔥 IMPORTS FIREBASE
// ===================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
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
  deleteDoc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// ===================================
// CONFIG
// ===================================
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

// ===================================
// ELEMENTOS
// ===================================
const $ = id => document.getElementById(id);

const btnLogin = $("btn-login");
const btnCadastrar = $("btn-cadastrar");
const btnGoogle = $("btn-google");
const btnRecuperar = $("btn-recuperar");
const btnSalvar = $("btn-salvar");
const btnPdf = $("btn-pdf");
const btnSair = $("btn-sair");

const btnSolo = $("btn-modo-solo");
const btnCasal = $("btn-modo-casal");
const btnConvidar = $("btn-convidar");
const btnEntrarGrupo = $("btn-entrar-grupo");

let meuGrafico = null;
let grupoAtual = "";
let modoAtual = "solo";

// ===================================
// CATEGORIAS
// ===================================
const categorias = {
  despesa:["Casa","Mercado","Alimentação","Cartão","Transporte","Saúde","Lazer","Assinaturas","Outros"],
  receita:["Salário","Freelance","Venda","Pix Recebido","Comissão","Investimento","Extra"]
};

function carregarCategorias(){

  const tipoSelecionado =
    document.querySelector('input[name="tipo"]:checked');

  const tipo = tipoSelecionado
    ? tipoSelecionado.value
    : "despesa";

  // 🔥 só mexe se existir
  if($("categoria")){
    $("categoria").innerHTML = "";

    categorias[tipo].forEach(cat=>{
      $("categoria").innerHTML += `<option>${cat}</option>`;
    });
  }

  // 🔥 só mexe se existir (EVITA ERRO)
  if($("filtro-categoria")){
    $("filtro-categoria").innerHTML =
      `<option value="">Todas categorias</option>`;

    categorias[tipo].forEach(cat=>{
      $("filtro-categoria").innerHTML += `<option>${cat}</option>`;
    });
  }
}

// ===================================
// PERFIL
// ===================================
async function criarPerfil(user){
  const ref = doc(db,"usuarios",user.uid);
  const snap = await getDoc(ref);

  if(!snap.exists()){
    await setDoc(ref,{
      uid:user.uid,
      email:user.email,
      modo:"solo",
      grupoId:user.uid
    });
  }
}

async function carregarPerfil(){
  const ref = doc(db,"usuarios",auth.currentUser.uid);
  const snap = await getDoc(ref);
  const dados = snap.data();

  grupoAtual = dados.grupoId;
  modoAtual = dados.modo;

  $("painel-casal").style.display =
    modoAtual === "casal" ? "block":"none";

  $("status-casal").innerText =
    modoAtual === "casal"
    ? `Modo casal ativo (Grupo: ${grupoAtual})`
    : "Modo solteiro ativo";
}

// ===================================
// LOGIN
// ===================================
async function login(){
  await signInWithEmailAndPassword(
    auth,$("email").value,$("senha").value
  );
}

async function cadastrar(){
  await createUserWithEmailAndPassword(
    auth,$("email").value,$("senha").value
  );
}

async function loginGoogle(){
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth,provider);
}

async function recuperarSenha(){
  await sendPasswordResetEmail(auth,$("email").value);
  Swal.fire("Enviado!","","success");
}

// ===================================
// MODOS
// ===================================
async function ativarSolo(){
  await updateDoc(
    doc(db,"usuarios",auth.currentUser.uid),
    {
      modo:"solo",
      grupoId:auth.currentUser.uid
    }
  );

  carregarPerfil();
  carregar();
}

async function ativarCasal(){
  await updateDoc(
    doc(db,"usuarios",auth.currentUser.uid),
    { modo:"casal" }
  );

  carregarPerfil();
}

// ===================================
// 🔥 CONVIDAR (EMAIL + WHATSAPP)
// ===================================
async function convidarParceiro(){

  const email = $("email-parceiro")?.value.trim();

  if(!email){
    Swal.fire("Digite um e-mail");
    return;
  }

  const grupo = "GRUPO_" + Date.now();

  await updateDoc(
    doc(db,"usuarios",auth.currentUser.uid),
    {
      grupoId:grupo,
      parceiroEmail:email,
      modo:"casal"
    }
  );

  const link = `${window.location.origin}?grupo=${grupo}`;

  const mensagem = `
💙 Convite - Nós Dois & Eu

Você foi convidado(a)!

Código do grupo:
${grupo}

Acesse:
${link}
`;

  Swal.fire({
    title:"Convite criado!",
    html:`
      <button id="emailConvite">📧 Email</button>
      <button id="zapConvite">📱 WhatsApp</button>
      <br><br>
      <small>${grupo}</small>
    `,
    showConfirmButton:false
  });

  setTimeout(()=>{
    const btnEmail = document.getElementById("emailConvite");
    const btnZap = document.getElementById("zapConvite");

    if(btnEmail){
      btnEmail.onclick = ()=>{
        window.location.href =
          `mailto:${email}?subject=Convite App Casal&body=${encodeURIComponent(mensagem)}`;
      };
    }

    if(btnZap){
      btnZap.onclick = ()=>{
        window.open(
          `https://wa.me/?text=${encodeURIComponent(mensagem)}`,
          "_blank"
        );
      };
    }
  },300);

  carregarPerfil();
}

// ===================================
// 🔥 ENTRAR NO GRUPO
// ===================================
async function entrarGrupo(){

  const codigo = $("codigo-grupo")?.value.trim();

  if(!codigo){
    Swal.fire("Digite o código");
    return;
  }

  await updateDoc(
    doc(db,"usuarios",auth.currentUser.uid),
    {
      grupoId:codigo,
      modo:"casal"
    }
  );

  Swal.fire("Conectado com sucesso!","","success");

  carregarPerfil();
  carregar();
}

// ===================================
// SALVAR
// ===================================
async function salvar(){

  const desc = $("desc").value.trim();
  const valor = parseFloat($("valor").value);
  const tipo =
    document.querySelector('input[name="tipo"]:checked')?.value;

  if(!desc || isNaN(valor)) return;

  await addDoc(collection(db,"transacoes"),{
    desc,
    valor,
    tipo,
    categoria:$("categoria").value,
    vencimento:$("vencimento").value,
    fixo:$("fixo").checked,
    parcelado:$("parcelado").checked,
    assinatura: $("assinatura")?.checked || false,
    parcelas:parseInt($("parcelas").value)||1,
    pago:false,
    data:new Date(),
    userId:auth.currentUser.uid,
    grupoId:grupoAtual,
    autor:auth.currentUser.email
  });

  $("desc").value="";
  $("valor").value="";

  carregar();
}

// ===================================
// CARREGAR
// ===================================
async function carregar(){

  // 📺 pega a lista de assinaturas
  const listaAssinaturas = $("lista-assinaturas");
  let totalAssinaturas = 0;

  // 🧹 limpa antes de renderizar
  if(listaAssinaturas) listaAssinaturas.innerHTML = "";

  // 📋 lista principal
  const lista = $("lista");

  const snapshot = await getDocs(
    query(
      collection(db,"transacoes"),
      where("grupoId","==",grupoAtual),
      orderBy("data","desc")
    )
  );

  lista.innerHTML = "";

    // 💰 dinheiro que você tem (receitas - despesas pagas)
  let dinheiro = 0;

  // 📄 total de contas (despesas)
  let contas = 0;

  // ⏳ quanto ainda falta pagar
  let falta = 0;

  let dados = {};

  snapshot.forEach(docSnap=>{

    const item = docSnap.data();
    const id = docSnap.id;

      // 📺 SE FOR ASSINATURA, MOSTRA NA LISTA SEPARADA
    if(item.assinatura && listaAssinaturas){

      // soma no total
      totalAssinaturas += item.valor;

      listaAssinaturas.innerHTML += `
        <div class="card despesa">
          📺 <strong>${item.desc}</strong><br>
          R$ ${item.valor.toFixed(2)} / mês
        </div>
      `;
    }
    if(item.tipo==="receita"){

      // 💰 dinheiro entra
      dinheiro += item.valor;

    }else{

      // 📄 toda despesa entra como conta
      contas += item.valor;

      // ⏳ se NÃO foi paga ainda
      if(!item.pago){
        falta += item.valor;
      }

      // 💰 se já foi paga, desconta do dinheiro
      if(item.pago){
        dinheiro -= item.valor;
      }

      // gráfico continua igual
      dados[item.categoria] =
        (dados[item.categoria]||0)+item.valor;
    }

    if($("total-assinaturas")){
      $("total-assinaturas").innerText =
        totalAssinaturas.toLocaleString("pt-BR",{minimumFractionDigits:2});
    }

    const podeEditar =
      item.userId === auth.currentUser.uid;

    lista.innerHTML += `
      <div class="card ${item.tipo}">
        <strong>${item.desc}</strong><br>
        ${item.categoria} • R$ ${item.valor.toFixed(2)}<br>
        <small>por ${item.autor}</small>

        <div class="acoes">
          ${
            podeEditar
            ? `<button onclick="editarItem('${id}','${item.desc}',${item.valor})">✏️</button>
               <button onclick="excluirItem('${id}')">🗑️</button>
               <button onclick="marcarPago('${id}')">✅</button>`
            : `<small>Somente visualização</small>`
          }
        </div>
      </div>
    `;
  });

  // 💰 mostra quanto tem em dinheiro
  $("dinheiro").innerText =
    dinheiro.toLocaleString("pt-BR",{minimumFractionDigits:2});

  // 📄 total de contas
  $("contas").innerText =
    contas.toLocaleString("pt-BR",{minimumFractionDigits:2});

  // ⏳ falta pagar
  $("falta").innerText =
    falta.toLocaleString("pt-BR",{minimumFractionDigits:2});

    renderizarGrafico(dados);
}

// ===================================
// GRAFICO
// ===================================
function renderizarGrafico(dados){

  const ctx = $("meuGrafico");

  if(meuGrafico) meuGrafico.destroy();

  meuGrafico = new Chart(ctx,{
    type:"doughnut",
    data:{
      labels:Object.keys(dados),
      datasets:[{
        data:Object.values(dados)
      }]
    }
  });
}

// ===================================
// CRUD
// ===================================
async function excluirItem(id){
  await deleteDoc(doc(db,"transacoes",id));
  carregar();
}

async function marcarPago(id){
  await updateDoc(doc(db,"transacoes",id),{
    pago:true
  });
  carregar();
}

async function editarItem(id,desc,valor){

  const { value } = await Swal.fire({
    title:"Editar",
    html:`
      <input id="novoDesc" class="swal2-input" value="${desc}">
      <input id="novoValor" class="swal2-input" type="number" value="${valor}">
    `,
    preConfirm:()=>({
      desc:$("novoDesc").value,
      valor:parseFloat($("novoValor").value)
    })
  });

  if(!value) return;

  await updateDoc(doc(db,"transacoes",id),value);

  carregar();
}

// ===================================
// PDF
// ===================================
function gerarPDF(){
  Swal.fire("PDF mantido da versão anterior");
}

// ===================================
// EVENTOS
// ===================================
if(btnLogin) btnLogin.onclick = login;
if(btnCadastrar) btnCadastrar.onclick = cadastrar;
if(btnGoogle) btnGoogle.onclick = loginGoogle;
if(btnRecuperar) btnRecuperar.onclick = recuperarSenha;
if(btnSalvar) btnSalvar.onclick = salvar;
if(btnPdf) btnPdf.onclick = gerarPDF;
if(btnSair) btnSair.onclick = ()=>signOut(auth);

if(btnSolo) btnSolo.onclick = ativarSolo;
if(btnCasal) btnCasal.onclick = ativarCasal;

if(btnConvidar) btnConvidar.onclick = convidarParceiro;
if(btnEntrarGrupo) btnEntrarGrupo.onclick = entrarGrupo;

document
  .querySelectorAll('input[name="tipo"]')
  .forEach(el=>{
    el.addEventListener("change", carregarCategorias);
  });

// ===================================
// LOGIN STATE
// ===================================
onAuthStateChanged(auth, async user=>{

  if(user){

    $("secao-login").style.display="none";
    $("secao-app").style.display="block";
    $("usuario-logado").innerText=user.email;

    await criarPerfil(user);
    await carregarPerfil();

    // 🔥 GARANTE QUE CARREGA SEMPRE
    carregarCategorias();

    carregar();

  }else{

    $("secao-login").style.display="block";
    $("secao-app").style.display="none";
  }
});

// GLOBAL
window.excluirItem = excluirItem;
window.editarItem = editarItem;
window.marcarPago = marcarPago;