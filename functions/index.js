const { onRequest } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.asaasWebhook = onRequest({ secrets: ["GEMINI_KEY"] }, async (req, res) => {
    // 1. Configura os cabeçalhos de CORS manualmente para qualquer origem
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // 2. Responde ao "Preflight" (a pergunta de segurança do navegador)
    if (req.method === "OPTIONS") {
        res.set("Access-Control-Max-Age", "3600");
        return res.status(204).send("");
    }

    // 3. Bloqueia outros métodos que não sejam POST
    if (req.method !== "POST") {
        return res.status(405).send("Método não permitido");
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const { modo, saldo, categorias } = req.body;

        const prompt = `Aja como mentor financeiro do app Vida Rica. 
        Perfil: ${modo}. Saldo: R$ ${saldo}. 
        Gastos: ${JSON.stringify(categorias)}.
        Dê uma dica financeira curta (uma frase) para este perfil.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        res.status(200).json({ dica: response.text() });

    } catch (error) {
        console.error("Erro na IA:", error);
        res.status(500).json({ dica: "IA temporariamente indisponível." });
    }
});