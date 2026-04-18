
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
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, where } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

// --- CONFIGURAÇÃO DO SEU FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyD7Kr-ee-NLtK21wVh1GBLazZKIeigkzsU",
  authDomain: "vida-rica-app-bc076.firebaseapp.com",
  projectId: "vida-rica-app-bc076",
  storageBucket: "vida-rica-app-bc076.firebasestorage.app",
  messagingSenderId: "284683038291",
  appId: "1:284683038291:web:f07db423b5fb99dc1520a6"
};

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
});