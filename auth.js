import { 
    getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
    signOut, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { app } from "./db.js";

export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const tratarErroAuth = (error) => {
    switch (error.code) {
        case 'auth/invalid-credential': return "E-mail ou senha incorretos.";
        case 'auth/email-already-in-use': return "Este e-mail já está em uso.";
        case 'auth/network-request-failed': return "Erro de conexão.";
        default: return "Ocorreu um erro. Tente novamente.";
    }
};

export const loginEmail = async (email, senha) => {
    try { await signInWithEmailAndPassword(auth, email, senha); } 
    catch (e) { Swal.fire("Erro", tratarErroAuth(e), "error"); }
};

export const criarConta = async (email, senha) => {
    try { await createUserWithEmailAndPassword(auth, email, senha); } 
    catch (e) { Swal.fire("Erro", tratarErroAuth(e), "error"); }
};

export const loginGoogle = async () => {
    try { await signInWithPopup(auth, googleProvider); } 
    catch (e) { Swal.fire("Erro", "Falha no login Google.", "error"); }
};

export const resetarSenha = async (email) => {
    if(!email) return Swal.fire("Atenção", "Digite seu e-mail", "warning");
    try { 
        await sendPasswordResetEmail(auth, email);
        Swal.fire("Sucesso", "E-mail de recuperação enviado!", "success");
    } catch (e) { Swal.fire("Erro", "E-mail não encontrado.", "error"); }
};

export const deslogar = () => signOut(auth).then(() => location.reload());