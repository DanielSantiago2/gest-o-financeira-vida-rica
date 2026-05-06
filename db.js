import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getFirestore, doc, setDoc, getDoc, collection, addDoc, 
    deleteDoc, updateDoc, query, where, orderBy, getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Configurações de acesso ao seu projeto Firebase
const firebaseConfig = {
    apiKey: "AIzaSyD7Kr-ee-NLtK21wVh1GBLazZKIeigkzsU",
    authDomain: "vida-rica-app-bc076.firebaseapp.com",
    projectId: "vida-rica-app-bc076",
    storageBucket: "vida-rica-app-bc076.firebasestorage.app",
    messagingSenderId: "284683038291",
    appId: "1:284683038291:web:f07db423b5fb99dc1520a6"
};

// Inicializa o Firebase e os serviços de Banco de Dados (Firestore)
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/* 
--- MÓDULO DE TRANSAÇÕES (RECEITAS E DESPESAS) --- 
*/

/**
 * Salva uma nova transação no banco.
 */
export const salvarTransacao = async (userId, groupId, dados) => {
    const transacao = {
        userId,
        groupId: groupId || null, 
        ...dados,
        // Garante que despesa sempre seja gravada como número negativo
        valor: dados.tipo === "despesa" ? -Math.abs(dados.valor) : Math.abs(dados.valor),
        pago: dados.pago || false,
        criadoEm: new Date().toISOString()
    };
    return await addDoc(collection(db, "transactions"), transacao);
};

/**
 * Cria a regra de busca para transações.
 */
export const criarQueryTransacoes = (userId, groupId) => {
    if (groupId) {
        return query(collection(db, "transactions"), where("groupId", "==", groupId), orderBy("data", "desc"));
    }
    return query(collection(db, "transactions"), where("userId", "==", userId), orderBy("data", "desc"));
};

// Deletar e Atualizar Transação
export const deletarDoc = (id) => deleteDoc(doc(db, "transactions", id));
export const atualizarStatusDoc = (id, statusAtual) => updateDoc(doc(db, "transactions", id), { pago: !statusAtual });


/* 
--- MÓDULO DE METAS --- 
*/

/**
 * Salva uma nova meta no banco (Ex: Reserva de Emergência).
 */
export const salvarMeta = async (userId, nome, objetivo) => {
    const novaMeta = {
        userId,
        nome,
        objetivo: Number(objetivo),
        criadoEm: new Date().toISOString()
    };
    return await addDoc(collection(db, "metas"), novaMeta);
};

/**
 * Cria a query para buscar as metas exclusivas do usuário logado.
 */
export const criarQueryMetas = (userId) => {
    return query(collection(db, "metas"), where("userId", "==", userId));
};

/**
 * Remove uma meta do banco.
 */
export const deletarMetaDoc = (id) => deleteDoc(doc(db, "metas", id));