const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔑 CONFIG (REMPLACE CES VALEURS)
const API_KEY = "sk_test_0hZHfZ5G1LgLTvLjnnuicOTV";
const SITE_ID = "587"; // sandbox test
const ACCESS_TOKEN = "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";

const SHOP = "clicassistpro.myshopify.com";

// ✅ ROUTE PAIEMENT
app.get("/pay", async (req, res) => {
    const { amount, order_id } = req.query;
    const transaction_id = "CMD_" + Date.now();

    try {

        const response = await axios.post(
            "https://checkout.cinetpay.com/v2/payment",
            {
                apikey: API_KEY,
                site_id: SITE_ID,
                transaction_id: transaction_id,
                amount: amount,
                currency: "XOF",
                description: "Commande #" + order_id,
                metadata: order_id,
                return_url: `https://${req.headers.host}/success`,
                notify_url: `https://${req.headers.host}/webhook`
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        res.redirect(response.data.data.payment_url);

    } catch (error) {
        console.log("Erreur paiement :", error.response?.data || error.message);
        res.send(error.response?.data || error.message);
    }
});


// ✅ WEBHOOK
app.post("/webhook", async (req, res) => {

    try {
        const transaction_id = req.body.transaction_id;

        const check = await axios.post(
            "https://checkout.cinetpay.com/v2/payment/check",
            {
                apikey: API_KEY,
                site_id: SITE_ID,
                transaction_id: transaction_id
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (check.data.data.status === "ACCEPTED") {

            const order_id = check.data.data.metadata;

            await axios.put(
                `https://${SHOP}/admin/api/2023-10/orders/${order_id}.json`,
                {
                    order: {
                        id: order_id,
                        financial_status: "paid"
                    }
                },
                {
                    headers: {
                        "X-Shopify-Access-Token": ACCESS_TOKEN,
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        res.send("OK");

    } catch (error) {
        console.log("Erreur webhook :", error.response?.data || error.message);
        res.send("Erreur webhook");
    }
});


// ✅ PAGE SUCCESS
app.get("/success", (req, res) => {
    res.send("✅ Paiement réussi !");
});


// ✅ SERVER
app.listen(process.env.PORT || 3000, () => {
    console.log("Server OK ✅");
});
