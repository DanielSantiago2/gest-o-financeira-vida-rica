const { onRequest } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// O "cors: true" é o que libera o acesso para o seu site no GitHub Pages
exports.asaaswebhook = onRequest({ secrets: ["GEMINI_KEY"], cors: true }, async (req, res) => {
    
    // IMPORTANTE: Responder aos pedidos de "preflight" (verificação do navegador)
    if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Methods", "POST");
        res.set("Access-Control-Allow-Headers", "Content-Type");
        res.status(204).send("");
        return;
    }

    if (req.method !== "POST") {
        return res.status(405).send("Método não permitido");
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const { modo, saldo, categorias } = req.body;

        const prompt = `Aja como mentor financeiro do app Vida Rica. 
        Usuário em modo ${modo}, saldo R$ ${saldo}. 
        Categorias: ${JSON.stringify(categorias)}. 
        Dê uma dica financeira muito curta (uma frase) para este perfil.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        res.json({ dica: response.text() });

    } catch (error) {
        console.error("Erro na função:", error);
        res.status(500).json({ dica: "Erro ao consultar a IA." });
    }
});