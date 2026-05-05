import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// ELEMENTOS
const loginSec = document.getElementById("secao-login");
const appSec = document.getElementById("secao-app");

const email = document.getElementById("email");
const senha = document.getElementById("senha");

const btnLogin = document.getElementById("btn-login");
const btnCadastrar = document.getElementById("btn-cadastrar");
const btnSair = document.getElementById("btn-sair");

const btnCasal = document.getElementById("btn-casal");
const btnSolteiro = document.getElementById("btn-solteiro");

const btnSalvar = document.getElementById("btn-salvar");
const lista = document.getElementById("lista");

const planoEl = document.getElementById("plano-usuario");
const userEl = document.getElementById("usuario-logado");

// LOGIN
btnLogin.onclick = () =>
  signInWithEmailAndPassword(auth, email.value, senha.value);

btnCadastrar.onclick = () =>
  createUserWithEmailAndPassword(auth, email.value, senha.value);

btnSair.onclick = () => signOut(auth);

// AUTH
onAuthStateChanged(auth, async (user) => {

  if (!user) {
    loginSec.style.display = "block";
    appSec.style.display = "none";
    return;
  }

  loginSec.style.display = "none";
  appSec.style.display = "block";

  userEl.innerText = user.email;

  await criarPerfil(user);

  const snap = await getDoc(doc(db, "users", user.uid));
  const data = snap.data();

  planoEl.innerText = data.plano.toUpperCase();

  carregarDados(user);
});

// PERFIL
async function criarPerfil(user) {

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      plano: "free",
      modo: "solteiro",
      criadoEm: new Date()
    });
  }
}

// SALVAR
btnSalvar.onclick = async () => {

  const user = auth.currentUser;

  if (!desc.value || !valor.value) {
    alert("Preencha os campos");
    return;
  }

  await addDoc(collection(db, "transactions"), {
    userId: user.uid,
    desc: desc.value,
    valor: Number(valor.value),
    pago: false,
    criado: new Date()
  });

  desc.value = "";
  valor.value = "";

  carregarDados(user);
};

// LISTAR
async function carregarDados(user) {

  lista.innerHTML = "";

  const snap = await getDocs(collection(db, "transactions"));

  snap.forEach(docSnap => {

    const d = docSnap.data();

    if (d.userId !== user.uid) return;

    lista.innerHTML += `
      <div class="card ${d.valor < 0 ? 'despesa' : 'receita'} ${d.pago ? 'pago' : ''}">
        <strong>${d.desc}</strong><br>
        R$ ${d.valor}

        <div class="acoes">
          <button onclick="marcarPago('${docSnap.id}')">✔</button>
          <button onclick="excluir('${docSnap.id}')">🗑</button>
        </div>
      </div>
    `;
  });
}

// AÇÕES
window.excluir = async (id) => {
  await deleteDoc(doc(db, "transactions", id));
  carregarDados(auth.currentUser);
};

window.marcarPago = async (id) => {
  await updateDoc(doc(db, "transactions", id), {
    pago: true
  });
  carregarDados(auth.currentUser);
};