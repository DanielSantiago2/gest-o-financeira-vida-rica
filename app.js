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
  const tipo =
    document.querySelector('input[name="tipo"]:checked')?.value || "despesa";

  $("categoria").innerHTML = "";
  $("filtro-categoria").innerHTML =
    `<option value="">Todas categorias</option>`;

  categorias[tipo].forEach(cat=>{
    $("categoria").innerHTML += `<option>${cat}</option>`;
    $("filtro-categoria").innerHTML += `<option>${cat}</option>`;
  });
}

// ===================================
// PERFIL USUÁRIO
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
    ? "Modo casal ativo"
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
  await sendPasswordResetEmail(
    auth,$("email").value
  );

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

async function convidarParceiro(){
  const email = $("email-parceiro").value.trim();

  if(!email) return;

  const grupo = [auth.currentUser.uid,Date.now()].join("_");

  await updateDoc(
    doc(db,"usuarios",auth.currentUser.uid),
    {
      grupoId:grupo,
      parceiroEmail:email,
      modo:"casal"
    }
  );

  Swal.fire(
    "Convite salvo!",
    "Quando o parceiro criar conta com este e-mail, use o mesmo grupo manualmente depois.",
    "success"
  );

  carregarPerfil();
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

  const lista = $("lista");

  const snapshot = await getDocs(
    query(
      collection(db,"transacoes"),
      where("grupoId","==",grupoAtual),
      orderBy("data","desc")
    )
  );

  lista.innerHTML = "";

  let saldo = 0;
  let meuSaldo = 0;
  let dados = {};

  snapshot.forEach(docSnap=>{

    const item = docSnap.data();
    const id = docSnap.id;

    if(item.tipo==="receita"){
      saldo += item.valor;
      if(item.userId===auth.currentUser.uid)
        meuSaldo += item.valor;
    }else{
      saldo -= item.valor;
      if(item.userId===auth.currentUser.uid)
        meuSaldo -= item.valor;

      dados[item.categoria] =
        (dados[item.categoria]||0)+item.valor;
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

  $("total").innerText =
    saldo.toLocaleString("pt-BR",{minimumFractionDigits:2});

  $("meu-total").innerText =
    meuSaldo.toLocaleString("pt-BR",{minimumFractionDigits:2});

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
btnLogin.onclick = login;
btnCadastrar.onclick = cadastrar;
btnGoogle.onclick = loginGoogle;
btnRecuperar.onclick = recuperarSenha;
btnSalvar.onclick = salvar;
btnPdf.onclick = gerarPDF;
btnSair.onclick = ()=>signOut(auth);

btnSolo.onclick = ativarSolo;
btnCasal.onclick = ativarCasal;
btnConvidar.onclick = convidarParceiro;

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