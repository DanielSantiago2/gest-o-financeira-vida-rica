
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
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, where, updateDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

// --- 1. CONFIGURAÇÃO FIREBASE ---
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
const ID_CASAL = "familia_santiago_2026";

let meuGrafico = null; // Variável global para controlar o gráfico

// --- 2. CATEGORIAS ---
const categoriasPadrao = {
    despesa: ["🏠 Casa", "🍎 Alimentação", "🚗 Transporte", "🎡 Lazer", "💊 Saúde", "🛒 Mercado", "⚙️ Outros"],
    receita: ["💰 Salário", "📈 Investimentos", "🎁 Presente", "➕ Extra"]
};

window.atualizarCategorias = function() {
    const tipoElem = document.querySelector('input[name="tipo"]:checked');
    if (!tipoElem) return;
    const select = document.getElementById("categoria");
    select.innerHTML = "";
    categoriasPadrao[tipoElem.value].forEach(cat => {
        const option = document.createElement("option");
        option.value = cat; option.textContent = cat;
        select.appendChild(option);
    });
};

// --- 3. GRÁFICO E MÉTRICAS ---
window.renderizarGrafico = function(totalGanhos, totalGastos) {
    const ctx = document.getElementById('meuGrafico');
    if (!ctx) return;

    if (meuGrafico) meuGrafico.destroy(); // Limpa o gráfico anterior para não sumir

    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Ganhos', 'Gastos'],
            datasets: [{
                data: [totalGanhos, totalGastos],
                backgroundColor: ['#4caf50', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: { plugins: { legend: { labels: { color: 'white' } } } }
    });

    // Alerta se estiver gastando mais do que ganha
    if (totalGastos > totalGanhos && totalGanhos > 0) {
        Swal.fire({
            title: 'Atenção!', text: 'Seus gastos superaram seus ganhos!', icon: 'warning',
            toast: true, position: 'top-end', showConfirmButton: false, timer: 4000
        });
    }
};

window.atualizarInterfaceMeta = function(totalGastos = 0) {
    const metaGuardada = localStorage.getItem('meta_mensal');
    const valorMetaSpan = document.getElementById("valor-meta");
    const barra = document.getElementById("barra-progresso");

    if (!metaGuardada) return;
    const meta = parseFloat(metaGuardada);
    valorMetaSpan.innerText = `R$ ${meta.toFixed(2)}`;
    
    let porcentagem = (totalGastos / meta) * 100;
    barra.style.width = Math.min(porcentagem, 100) + "%";

    if (porcentagem >= 100) {
        barra.style.background = "#b91c1c";
        Swal.fire({ title: 'Meta Estourada!', icon: 'error', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    } else if (porcentagem >= 90) {
        barra.style.background = "#ef4444";
        Swal.fire({ title: 'Quase no limite!', icon: 'warning', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    } else {
        barra.style.background = "#4caf50";
    }
};

// --- 4. OPERAÇÕES (CRUD) ---
window.salvar = async function() {
    const desc = document.getElementById("desc").value;
    const valor = parseFloat(document.getElementById("valor").value);
    const tipo = document.querySelector('input[name="tipo"]:checked').value;
    const categoria = document.getElementById("categoria").value;

    if (!desc || isNaN(valor)) return Swal.fire('Erro', 'Preencha os campos!', 'error');

    try {
        await addDoc(collection(db, "transacoes"), { desc, valor, tipo, categoria, data: new Date(), userId: auth.currentUser.uid, grupoId: ID_CASAL });
        Swal.fire('Sucesso!', 'Salvo com sucesso.', 'success');
        document.getElementById("desc").value = ""; document.getElementById("valor").value = "";
        window.carregar();
    } catch (e) { console.error(e); }
};

window.carregar = async function() {
    if (!auth.currentUser) return;
    const lista = document.getElementById("lista");
    lista.innerHTML = "Carregando...";

    const q = query(collection(db, "transacoes"), where("userId", "==", auth.currentUser.uid), orderBy("data", "desc"));
    const querySnapshot = await getDocs(q);
    
    let html = ""; let saldo = 0; let totalGastos = 0; let totalGanhos = 0;

    querySnapshot.forEach((docSnap) => {
        const item = docSnap.data();
        const id = docSnap.id;
        const cor = item.tipo === 'despesa' ? '#ef4444' : '#4caf50';
        
        if (item.tipo === 'despesa') { saldo -= item.valor; totalGastos += item.valor; }
        else { saldo += item.valor; totalGanhos += item.valor; }

        html += `
            <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 10px; margin-bottom: 8px; display: flex; justify-content: space-between; border-left: 4px solid ${cor};">
                <div><strong>${item.desc}</strong><br><small>${item.categoria}</small></div>
                <div style="text-align:right">
                    <span style="color:${cor}">R$ ${item.valor.toFixed(2)}</span><br>
                    <button onclick="excluirRegistro('${id}')" style="background:none; border:none; color:#ef4444; font-size:10px; cursor:pointer">Excluir</button>
                </div>
            </div>`;
    });

    lista.innerHTML = html || "Nenhum registro.";
    document.getElementById("total").innerText = saldo.toLocaleString('pt-br', {minimumFractionDigits: 2});
    window.renderizarGrafico(totalGanhos, totalGastos);
    window.atualizarInterfaceMeta(totalGastos);
};

window.excluirRegistro = async function(id) {
    if ((await Swal.fire({ title: 'Excluir?', showCancelButton: true })).isConfirmed) {
        await deleteDoc(doc(db, "transacoes", id));
        window.carregar();
    }
};

window.definirMeta = async function() {
    const { value: meta } = await Swal.fire({ title: 'Meta Mensal', input: 'number' });
    if (meta) { localStorage.setItem('meta_mensal', meta); window.carregar(); }
};

// --- 5. AUTENTICAÇÃO ---
window.login = async () => {
    try { await signInWithEmailAndPassword(auth, document.getElementById("email").value, document.getElementById("senha").value); }
    catch (e) { Swal.fire('Erro', 'Falha no login', 'error'); }
};

window.cadastrar = async () => {
    try { await createUserWithEmailAndPassword(auth, document.getElementById("email").value, document.getElementById("senha").value); }
    catch (e) { Swal.fire('Erro', 'Falha no cadastro', 'error'); }
};

window.sair = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    document.getElementById("secao-login").style.display = user ? "none" : "block";
    document.getElementById("secao-app").style.display = user ? "block" : "none";
    if (user) {
        document.getElementById("usuario-logado").innerText = user.email;
        window.atualizarCategorias(); window.carregar();
    }
});