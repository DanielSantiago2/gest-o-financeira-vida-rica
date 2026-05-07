import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    initializeFirestore, 
    persistentLocalCache, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    addDoc, 
    deleteDoc, 
    updateDoc, 
    query, 
    where, 
    orderBy, 
    getDocs, 
    writeBatch 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD7Kr-ee-NLtK21wVh1GBLazZKIeigkzsU",
    authDomain: "vida-rica-app-bc076.firebaseapp.com",
    projectId: "vida-rica-app-bc076",
    storageBucket: "vida-rica-app-bc076.firebasestorage.app",
    messagingSenderId: "284683038291",
    appId: "1:284683038291:web:f07db423b5fb99dc1520a6"
};

// Inicializa o App
export const app = initializeApp(firebaseConfig);

// Inicializa o Firestore com Cache Persistente (Melhora muito a velocidade no celular)
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache()
});

/* --- MÓDULO DE TRANSAÇÕES --- */

export const salvarTransacao = async (userId, groupId, dados) => {
    const transacao = {
        userId,
        groupId: groupId || null, 
        ...dados,
        valor: dados.tipo === "despesa" ? -Math.abs(dados.valor) : Math.abs(dados.valor),
        criadoEm: new Date().toISOString()
    };
    return await addDoc(collection(db, "transactions"), transacao);
};

export const criarQueryTransacoes = (userId, groupId) => {
    const col = collection(db, "transactions");
    if (groupId) return query(col, where("groupId", "==", groupId), orderBy("data", "desc"));
    return query(col, where("userId", "==", userId), orderBy("data", "desc"));
};

export const deletarDoc = (id) => deleteDoc(doc(db, "transactions", id));
export const atualizarStatusDoc = (id, statusAtual) => updateDoc(doc(db, "transactions", id), { pago: !statusAtual });

/* --- MÓDULO DE METAS --- */

export const salvarMeta = async (userId, nome, objetivo) => {
    return await addDoc(collection(db, "metas"), {
        userId, nome, objetivo: Number(objetivo), criadoEm: new Date().toISOString()
    });
};

export const criarQueryMetas = (userId) => query(collection(db, "metas"), where("userId", "==", userId));
export const deletarMetaDoc = (id) => deleteDoc(doc(db, "metas", id));

/* --- VÍNCULO DE PARCEIRO --- */

export const vincularParceiro = async (adminId, convidadoEmail) => {
    const q = query(collection(db, "users"), where("email", "==", convidadoEmail));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error("Parceiro não cadastrado!");

    const parceiroId = snap.docs[0].id;
    const groupId = `group_${adminId}`;
    const batch = writeBatch(db);
    
    batch.update(doc(db, "users", adminId), { groupId, modo: "casal", plano: "premium" });
    batch.update(doc(db, "users", parceiroId), { groupId, modo: "casal", plano: "premium" });

    await batch.commit();
    return groupId;
};