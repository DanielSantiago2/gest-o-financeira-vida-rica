const { onRequest } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.asaaswebhook = onRequest({ secrets: ["GEMINI_KEY"] }, async (req, res) => {
    // Configuração manual de CORS
    res.set("Access-Control-Allow-Origin", "*"); // Permite qualquer origem (GitHub, Localhost, etc)

    if (req.method === "OPTIONS") {
        // Responde ao "preflight" do navegador
        res.set("Access-Control-Allow-Methods", "POST");
        res.set("Access-Control-Allow-Headers", "Content-Type");
        res.set("Access-Control-Max-Age", "3600");
        return res.status(204).send("");
    }

    if (req.method !== "POST") {
        return res.status(405).send("Método não permitido");
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const { modo, saldo, categorias } = req.body;

        const prompt = `Aja como mentor financeiro. Modo: ${modo}, Saldo: R$ ${saldo}. Categorias: ${JSON.stringify(categorias)}. Dê uma dica curta em uma frase.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        res.status(200).json({ dica: response.text() });

    } catch (error) {
        console.error("Erro:", error);
        res.status(500).json({ dica: "Erro ao processar dica." });
    }
});