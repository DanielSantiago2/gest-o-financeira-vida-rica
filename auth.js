import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    GoogleAuthProvider, 
    signInWithPopup,
    sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { app } from "./db.js";

export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Tratamento de erros amigável (Item 1)
const tratarErroAuth = (error) => {
    switch (error.code) {
        case 'auth/invalid-credential': return "E-mail ou senha incorretos.";
        case 'auth/user-not-found': return "Usuário não cadastrado.";
        case 'auth/wrong-password': return "Senha incorreta.";
        case 'auth/email-already-in-use': return "Este e-mail já está em uso.";
        case 'auth/network-request-failed': return "Erro de conexão. Verifique sua internet.";
        default: return "Ocorreu um erro inesperado. Tente novamente.";
    }
};

export const loginEmail = async (email, senha) => {
    try {
        await signInWithEmailAndPassword(auth, email, senha);
    } catch (e) {
        Swal.fire("Erro", tratarErroAuth(e), "error");
    }
};

export const criarConta = async (email, senha) => {
    try {
        await createUserWithEmailAndPassword(auth, email, senha);
    } catch (e) {
        Swal.fire("Erro", tratarErroAuth(e), "error");
    }
};

export const loginGoogle = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (e) {
        Swal.fire("Erro", "Falha na autenticação com Google.", "error");
    }
};

export const resetarSenha = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        Swal.fire("E-mail enviado", "Verifique sua caixa de entrada.", "success");
    } catch (e) {
        Swal.fire("Erro", "E-mail não encontrado.", "error");
    }
};

// Função Sair (Item 5)
export const deslogar = () => signOut(auth);