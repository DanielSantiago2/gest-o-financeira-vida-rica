const { onRequest } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors")({ origin: true }); // Importante para liberar o acesso

exports.asaaswebhook = onRequest({ secrets: ["GEMINI_KEY"] }, (req, res) => {
    // Essa parte resolve o erro de CORS para qualquer site (inclusive o GitHub)
    cors(req, res, async () => {
        
        if (req.method !== "POST") {
            return res.status(405).send("Apenas POST é aceito");
        }

        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const { modo, saldo, categorias } = req.body;

            const prompt = `Aja como mentor financeiro do app Vida Rica. 
            Perfil: ${modo}. Saldo atual: R$ ${saldo}. 
            Gastos por categoria: ${JSON.stringify(categorias)}.
            Dê uma dica financeira muito curta e motivadora em uma frase.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            
            res.status(200).json({ dica: response.text() });

        } catch (error) {
            console.error("Erro na IA:", error);
            res.status(500).json({ dica: "Erro ao gerar dica. Tente novamente!" });
        }
    });
});