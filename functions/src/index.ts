import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

admin.initializeApp();

export const asaaswebhook = functions.onRequest({ secrets: ["GEMINI_KEY"] }, async (req, res) => {
    // 1. Cabeçalhos de CORS (ESSENCIAL PARA O GITHUB PAGES)
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // 2. Responde ao "Preflight"
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || "");
        const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" }); // Versão corrigida.

        const { modo, saldo, categorias } = req.body;

        // Se o corpo tiver o evento do Asaas, trata pagamento
        if (req.body.event === "PAYMENT_CONFIRMED") {
            const userId = req.body.payment.externalReference;
            await admin.firestore().collection("usuarios").doc(userId).update({
                plano: "premium",
                trialFim: null,
            });
            res.status(200).send("Pagamento Processado");
            return;
        }

        // Caso contrário, trata como pedido da IA
        const prompt = `Aja como mentor financeiro do app Vida Rica. 
        Perfil: ${modo}. Saldo: R$ ${saldo}. 
        Gastos: ${JSON.stringify(categorias)}.
        Dê uma dica financeira curta (uma frase) para este perfil.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        res.status(200).json({ dica: text });

    } catch (error) {
        console.error("Erro na Function:", error);
        res.status(500).json({ dica: "IA temporariamente indisponível." });
    }
});

// Forçando atualização do deploy v2