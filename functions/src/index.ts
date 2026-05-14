import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const asaaswebhook = functions.https.onRequest(async (req, res) => {
  try {
    const data = req.body;

    console.log("Webhook recebido:", data);

    if (data.event === "PAYMENT_CONFIRMED") {
      const userId = data.payment.externalReference;

      await admin.firestore().collection("usuarios").doc(userId).update({
        plano: "premium",
        trialFim: null,
      });

      console.log("Usuário atualizado:", userId);
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro");
  }
});