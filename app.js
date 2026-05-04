// =============================
// 🔥 FIREBASE CONFIG
// =============================
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
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// 🔑 SUA CONFIG
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


// =============================
// 🎯 ELEMENTOS
// =============================
const loginSec = document.getElementById("secao-login");
const appSec = document.getElementById("secao-app");

const email = document.getElementById("email");
const senha = document.getElementById("senha");

const btnLogin = document.getElementById("btn-login");
const btnCadastrar = document.getElementById("btn-cadastrar");
const btnSair = document.getElementById("btn-sair");

const btnCasal = document.getElementById("btn-casal");


// =============================
// 🔐 LOGIN
// =============================
btnLogin.onclick = async () => {
  await signInWithEmailAndPassword(auth, email.value, senha.value);
};

btnCadastrar.onclick = async () => {
  await createUserWithEmailAndPassword(auth, email.value, senha.value);
};

btnSair.onclick = () => signOut(auth);


// =============================
// 👤 AUTH STATE
// =============================
onAuthStateChanged(auth, async (user) => {

  if (!user) {
    loginSec.style.display = "block";
    appSec.style.display = "none";
    return;
  }

  loginSec.style.display = "none";
  appSec.style.display = "block";

  console.log("Usuário logado:", user.email);

  await criarPerfil(user);

  verificarAdmin(user);
});


// =============================
// 👤 CRIAR PERFIL
// =============================
async function criarPerfil(user) {

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {

    await setDoc(ref, {
      email: user.email,
      modo: "solteiro",
      plano: "free",
      criadoEm: new Date()
    });

    console.log("Perfil criado");
  }
}


// =============================
// 👑 ADMIN
// =============================
function verificarAdmin(user) {

  if (user.email === "leinadsystem@gmail.com") {
    alert("👑 Você é ADMIN");
  }

}


// =============================
// 💙 MODO CASAL / SOLTEIRO
// =============================

btnCasal.onclick = async () => {

  const user = auth.currentUser;

  if (!user) return;

  await setDoc(doc(db, "users", user.uid), {
    modo: "casal"
  }, { merge: true });

  alert("💙 Modo Casal ativado!");
};


// 👤 MODO SOLTEIRO
btnSolteiro.onclick = async () => {

  const user = auth.currentUser;

  if (!user) return;

  await setDoc(doc(db, "users", user.uid), {
    modo: "solteiro"
  }, { merge: true });

  alert("👤 Modo Solteiro ativado!");
};


// =============================
// 💳 UPGRADE (ASAAS)
// =============================
document.getElementById("btn-upgrade").onclick = () => {

  const user = auth.currentUser;

  // 👉 Aqui você vai integrar com Asaas depois
  alert("🔒 Redirecionando para pagamento...");

};


// =============================
// 🔄 FREE vs PREMIUM
// =============================
async function verificarPlano(user) {

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  const data = snap.data();

  if (data.plano === "free") {
    console.log("Modo FREE (manual)");
  } else {
    console.log("Modo PREMIUM (tempo real)");
  }

}


// =============================
// 🔗 TESTE WEBHOOK
// =============================
window.testWebhook = async () => {

  const user = auth.currentUser;

  await fetch("https://us-central1-vida-rica-app-bc076.cloudfunctions.net/asaasWebhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      event: "PAYMENT_CONFIRMED",
      payment: {
        externalReference: user.uid
      }
    })
  });

  alert("Webhook enviado");
};