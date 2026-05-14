import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

admin.initializeApp();

export const asaaswebhook = functions.onRequest({ 
    secrets: ["GEMINI_KEY"],
    cors: true // Isso simplifica o gerenciamento de CORS do Firebase
}, async (req, res) => {
    
    // 1. Cabeçalhos de CORS (Mantidos para segurança extra)
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }

    try {
        // CORREÇÃO 1: Validação da Chave antes de usar
        const apiKey = process.env.GEMINI_KEY;
        if (!apiKey) {
            console.error("ERRO: GEMINI_KEY não encontrada no process.env");
            res.status(500).json({ dica: "Erro de configuração de chave." });
            return;
        }

        // CORREÇÃO 2: Inicialização forçando a versão estável v1
        // No topo do arquivo ou onde você inicializa o Gemini:
        const genAI = new GoogleGenerativeAI(apiKey); 
        // CORREÇÃO 3: Uso do nome absoluto do modelo
        const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

        const { modo, saldo, categorias } = req.body;

        // Log para debug (aparecerá no seu firebase functions:log)
        console.log(`Processando pedido para perfil: ${modo}`);

        if (req.body.event === "PAYMENT_CONFIRMED") {
            const userId = req.body.payment.externalReference;
            await admin.firestore().collection("usuarios").doc(userId).update({
                plano: "premium",
                trialFim: null,
            });
            res.status(200).send("Pagamento Processado");
            return;
        }

        const prompt = `Aja como mentor financeiro do app Vida Rica. 
        Perfil: ${modo || 'Geral'}. Saldo: R$ ${saldo || '0'}. 
        Gastos: ${JSON.stringify(categorias || {})}.
        Dê uma dica financeira curta (uma frase) para este perfil.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        res.status(200).json({ dica: text });

    } catch (error: any) {
        // Log detalhado para sabermos exatamente onde quebrou
        console.error("Erro detalhado na Function:", error.message);
        res.status(500).json({ 
            dica: "IA em manutenção.",
            debug: error.message // Isso ajuda a ver o erro no console do navegador
        });
    }
});