/* =========================================================
💙 NÓS DOIS & EU - APP.JS DEFINITIVO
Comentado como se eu mesmo tivesse criado
✔ Firebase
✔ Tema claro / escuro
✔ Atualização automática
✔ Gráfico
✔ Metas
✔ Alertas inteligentes
✔ Premium / Trial
✔ Casal
✔ Compatível com coleções antigas
========================================================= */


/* =========================================================
🔥 IMPORTS FIREBASE CDN
========================================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";


/* =========================================================
🔥 SUA CONFIG FIREBASE
COLE SUA CONFIG REAL AQUI
========================================================= */
const firebaseConfig = {
    apiKey: "AIzaSyD7Kr-ee-NLtK21wVh1GBLazZKIeigkzsU",
    authDomain: "vida-rica-app-bc076.firebaseapp.com",
    projectId: "vida-rica-app-bc076",
    storageBucket: "vida-rica-app-bc076.firebasestorage.app",
    messagingSenderId: "284683038291",
    appId: "1:284683038291:web:f07db423b5fb99dc1520a6"
  };


/* =========================================================
🚀 INICIAR FIREBASE
========================================================= */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/* =========================================================
📌 FUNÇÃO CURTA
========================================================= */
const $ = (id)=>document.getElementById(id);


/* =========================================================
🌍 VARIÁVEIS GERAIS
========================================================= */
let grupoAtual = "";
let planoAtual = "gratis";
let trialAtivo = false;

let grafico = null;
let unsubscribe = null;


/* =========================================================
🏷 CATEGORIAS
========================================================= */
const categorias = {
  despesa:[
    "Casa","Mercado","Cartão","Transporte",
    "Saúde","Lazer","Assinaturas","Outros"
  ],
  receita:[
    "Salário","Freelance","PIX","Venda","Extra"
  ]
};


/* =========================================================
🎨 TROCAR TEMA
========================================================= */
function iniciarTema(){

  const salvo = localStorage.getItem("tema") || "dark";

  document.body.className = salvo;

}

function trocarTema(){

  if(document.body.classList.contains("dark")){
    document.body.className = "light";
    localStorage.setItem("tema","light");
  }else{
    document.body.className = "dark";
    localStorage.setItem("tema","dark");
  }

}


/* =========================================================
👁 VER SENHA
========================================================= */
function verSenha(){

  if(!$("senha")) return;

  $("senha").type =
    $("senha").type === "password"
    ? "text"
    : "password";

}


/* =========================================================
📂 CARREGAR CATEGORIAS
========================================================= */
function carregarCategorias(){

  const tipo =
    document.querySelector('input[name="tipo"]:checked')?.value
    || "despesa";

  $("categoria").innerHTML = "";

  categorias[tipo].forEach(cat=>{
    $("categoria").innerHTML += `<option>${cat}</option>`;
  });

}


/* =========================================================
🆕 CRIAR PERFIL
Trial:
7 dias individual
30 casal
========================================================= */
async function criarPerfil(user){

  const ref = doc(db,"usuarios",user.uid);
  const snap = await getDoc(ref);

  if(snap.exists()) return;

  const hoje = new Date();

  const fim = new Date();
  fim.setDate(hoje.getDate() + 7);

  await setDoc(ref,{
    uid:user.uid,
    email:user.email,

    grupoId:user.uid,
    modo:"solo",

    plano:"gratis",

    trialFim:fim.toISOString(),

    parceiroEmail:"",

    criadoEm:new Date()
  });

}


/* =========================================================
📥 CARREGAR PERFIL
========================================================= */
async function carregarPerfil(){

  const ref = doc(db,"usuarios",auth.currentUser.uid);
  const snap = await getDoc(ref);

  const dados = snap.data();

  grupoAtual = dados.grupoId;
  planoAtual = dados.plano || "gratis";

  /* trial */
  trialAtivo = false;

  if(dados.trialFim){

    if(new Date() <= new Date(dados.trialFim)){
      trialAtivo = true;
    }

  }

  atualizarPlanoTela(dados);

}


/* =========================================================
💳 TEXTO PLANO
========================================================= */
function atualizarPlanoTela(dados){

  let txt = planoAtual.toUpperCase();

  if(trialAtivo){
    txt += " + TESTE";
  }

  $("plano-usuario").innerText = txt;

  $("status-casal").innerText =
    dados.modo === "casal"
    ? "💙 Grupo conectado"
    : "👤 Modo individual";

}


/* =========================================================
🔐 LOGIN
========================================================= */
async function login(){

  try{

    await signInWithEmailAndPassword(
      auth,
      $("email").value,
      $("senha").value
    );

  }catch{

    Swal.fire("Erro","Login inválido","error");

  }

}


/* =========================================================
🆕 CADASTRAR
========================================================= */
async function cadastrar(){

  try{

    await createUserWithEmailAndPassword(
      auth,
      $("email").value,
      $("senha").value
    );

    Swal.fire("Sucesso","Conta criada","success");

  }catch{

    Swal.fire("Erro","Não foi possível cadastrar","error");

  }

}


/* =========================================================
🌐 LOGIN GOOGLE
========================================================= */
async function loginGoogle(){

  try{

    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth,provider);

  }catch{

    Swal.fire("Erro","Google falhou","error");

  }

}


/* =========================================================
📧 RECUPERAR SENHA
========================================================= */
async function recuperarSenha(){

  try{

    await sendPasswordResetEmail(
      auth,
      $("email").value
    );

    Swal.fire("Enviado","Confira seu e-mail","success");

  }catch{

    Swal.fire("Erro","Digite email válido","error");

  }

}


/* =========================================================
👑 PLANOS PREMIUM
========================================================= */
async function planos(){

  const { value } = await Swal.fire({
    title:"Escolha Plano",
    input:"select",
    inputOptions:{
      gratis:"🆓 Grátis",
      premium_individual:"👤 Premium Individual",
      premium_casal:"💙 Premium Casal"
    },
    showCancelButton:true
  });

  if(!value) return;

  const ref = doc(db,"usuarios",auth.currentUser.uid);

  let trial = new Date();

  if(value === "premium_casal"){
    trial.setDate(trial.getDate()+30);
  }else if(value === "premium_individual"){
    trial.setDate(trial.getDate()+7);
  }

  await updateDoc(ref,{
    plano:value,
    trialFim:trial.toISOString()
  });

  Swal.fire(
    "Plano atualizado",
    "Pagamento será ativado futuramente.",
    "success"
  );

}


/* =========================================================
💙 MODO CASAL
========================================================= */
async function ativarCasal(){

  await updateDoc(
    doc(db,"usuarios",auth.currentUser.uid),
    { modo:"casal" }
  );

  Swal.fire(
    "Modo casal ativado",
    "",
    "success"
  );

}


/* =========================================================
💌 CONVIDAR
========================================================= */
async function convidar(){

  const email = $("email-parceiro").value.trim();

  if(!email) return;

  const codigo = "GRUPO_" + Date.now();

  await updateDoc(
    doc(db,"usuarios",auth.currentUser.uid),
    {
      grupoId:codigo,
      parceiroEmail:email,
      modo:"casal"
    }
  );

  const msg =
`💙 Convite Nós Dois & Eu

Código: ${codigo}

Entre no app e use o código.`;

  Swal.fire({
    title:"Convite criado",
    html:`
      <button id="zapBtn">WhatsApp</button>
      <button id="mailBtn">E-mail</button>
    `,
    showConfirmButton:false
  });

  setTimeout(()=>{

    $("zapBtn").onclick = ()=>{
      window.open(
        `https://wa.me/?text=${encodeURIComponent(msg)}`,
        "_blank"
      );
    };

    $("mailBtn").onclick = ()=>{
      window.location.href =
      `mailto:${email}?subject=Convite&body=${encodeURIComponent(msg)}`;
    };

  },200);

}


/* =========================================================
🔗 ENTRAR GRUPO
========================================================= */
async function entrarGrupo(){

  const codigo = $("codigo-grupo").value.trim();

  if(!codigo) return;

  await updateDoc(
    doc(db,"usuarios",auth.currentUser.uid),
    {
      grupoId:codigo,
      modo:"casal"
    }
  );

  Swal.fire("Conectado","","success");

}


/* =========================================================
💾 SALVAR TRANSAÇÃO
========================================================= */
async function salvar(){

  const desc = $("desc").value.trim();
  const valor = parseFloat($("valor").value);

  if(!desc || isNaN(valor)) return;

  const tipo =
  document.querySelector('input[name="tipo"]:checked').value;

  await addDoc(collection(db,"transacoes"),{

    desc,
    valor,
    tipo,

    categoria:$("categoria").value,
    vencimento:$("vencimento").value,

    fixo:$("fixo").checked,
    parcelado:$("parcelado").checked,
    assinatura:$("assinatura").checked,

    parcelas:parseInt($("parcelas").value)||1,

    pago:false,
    grupoId:grupoAtual,

    userId:auth.currentUser.uid,
    autor:auth.currentUser.email,

    data:new Date()

  });

  $("desc").value="";
  $("valor").value="";

}


/* =========================================================
🎯 SALVAR META
========================================================= */
async function salvarMeta(){

  const nome = $("tipo-meta").value;
  const valor = parseFloat($("valor-meta").value);

  if(isNaN(valor)) return;

  await addDoc(
    collection(db,"metas"),
    {
      uid:auth.currentUser.uid,
      nome,
      valor,
      criado:new Date()
    }
  );

  $("valor-meta").value="";

}


/* =========================================================
📊 CARREGAR DADOS TEMPO REAL
========================================================= */
function carregar(){

  if(unsubscribe) unsubscribe();

  const q = query(
    collection(db,"transacoes"),
    where("grupoId","==",grupoAtual),
    orderBy("data","desc")
  );

  unsubscribe = onSnapshot(q,(snapshot)=>{

    let dinheiro = 0;
    let contas = 0;
    let falta = 0;
    let totalAss = 0;

    let dados = {};

    $("lista").innerHTML = "";
    $("lista-assinaturas").innerHTML = "";

    snapshot.forEach(docSnap=>{

      const item = docSnap.data();
      const id = docSnap.id;

      if(item.tipo === "receita"){
        dinheiro += item.valor;
      }else{
        contas += item.valor;
        if(!item.pago) falta += item.valor;
      }

      if(item.assinatura){
        totalAss += item.valor;
      }

      if(item.tipo === "despesa"){
        dados[item.categoria] =
          (dados[item.categoria]||0) + item.valor;
      }

      $("lista").innerHTML += `
        <div class="card ${item.tipo}">
          <strong>${item.desc}</strong><br>
          ${item.categoria} • R$ ${item.valor.toFixed(2)}

          <div class="acoes">
            <button onclick="pagar('${id}')">✅</button>
            <button onclick="excluir('${id}')">🗑️</button>
          </div>
        </div>
      `;

      if(item.assinatura){

        $("lista-assinaturas").innerHTML += `
          <div class="card despesa">
            📺 ${item.desc}
            - R$ ${item.valor.toFixed(2)}
          </div>
        `;

      }

    });

    $("dinheiro").innerText = dinheiro.toFixed(2);
    $("contas").innerText = contas.toFixed(2);
    $("falta").innerText = falta.toFixed(2);
    $("total-assinaturas").innerText = totalAss.toFixed(2);

    graficoPizza(dados);
    dicas(dinheiro,contas,totalAss);

  });

  carregarMetas();

}


/* =========================================================
📈 GRÁFICO
========================================================= */
function graficoPizza(dados){

  if(grafico) grafico.destroy();

  grafico = new Chart($("meuGrafico"),{
    type:"doughnut",
    data:{
      labels:Object.keys(dados),
      datasets:[{
        data:Object.values(dados)
      }]
    },
    options:{
      plugins:{
        legend:{
          labels:{
            color:"#fff"
          }
        }
      }
    }
  });

}


/* =========================================================
🎯 CARREGAR METAS
========================================================= */
function carregarMetas(){

  const q = query(
    collection(db,"metas"),
    where("uid","==",auth.currentUser.uid)
  );

  onSnapshot(q,(snapshot)=>{

    $("lista-metas").innerHTML = "";

    snapshot.forEach(docSnap=>{

      const item = docSnap.data();

      $("lista-metas").innerHTML += `
        <div class="card">
          <strong>${item.nome}</strong><br>
          Meta: R$ ${item.valor.toFixed(2)}
        </div>
      `;

    });

  });

}


/* =========================================================
🤖 DICAS
========================================================= */
function dicas(dinheiro,contas,ass){

  let texto = "";

  if(contas > dinheiro){
    texto += "⚠️ Você gastou mais do que ganhou.<br>";
  }else{
    texto += "✅ Suas contas estão saudáveis.<br>";
  }

  if(ass > 100){
    texto += "📺 Reveja assinaturas para economizar.<br>";
  }

  texto += "✈️ Guardando R$10/dia gera viagem futura.";

  $("dicas-financeiras").innerHTML =
    `<div class="card">${texto}</div>`;

}


/* =========================================================
🗑 EXCLUIR
========================================================= */
async function excluir(id){
  await deleteDoc(doc(db,"transacoes",id));
}


/* =========================================================
✅ PAGAR
========================================================= */
async function pagar(id){
  await updateDoc(
    doc(db,"transacoes",id),
    { pago:true }
  );
}


/* =========================================================
🔐 LOGIN STATE
========================================================= */
onAuthStateChanged(auth, async(user)=>{

  if(user){

    $("secao-login").style.display="none";
    $("secao-app").style.display="block";

    $("usuario-logado").innerText = user.email;

    await criarPerfil(user);
    await carregarPerfil();

    carregarCategorias();
    carregar();

  }else{

    $("secao-login").style.display="block";
    $("secao-app").style.display="none";

  }

});


/* =========================================================
🔘 EVENTOS
========================================================= */
$("btn-login").onclick = login;
$("btn-cadastrar").onclick = cadastrar;
$("btn-google").onclick = loginGoogle;
$("btn-recuperar").onclick = recuperarSenha;

$("btn-ver-senha").onclick = verSenha;
$("btn-tema").onclick = trocarTema;

$("btn-upgrade").onclick = planos;
$("btn-casal").onclick = ativarCasal;

$("btn-convidar").onclick = convidar;
$("btn-entrar-grupo").onclick = entrarGrupo;

$("btn-salvar").onclick = salvar;
$("btn-salvar-meta").onclick = salvarMeta;

$("btn-sair").onclick = ()=>signOut(auth);


/* =========================================================
🌍 GLOBAL
========================================================= */
window.excluir = excluir;
window.pagar = pagar;


/* =========================================================
🚀 INICIAR
========================================================= */
iniciarTema();