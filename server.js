const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// CONFIG
const API_KEY = "sk_test_0hZHfZ5G1LgLTvLjnnuicOTV";
const SITE_ID = "587"; // sandbox
const ACCESS_TOKEN = "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";
const SHOP = "clicassistpro.myshopify.com";

// ✅ PAIEMENT
app.get("/pay", async (req, res) => {
    const { amount, order_id } = req.query;
    const transaction_id = "CMD_" + Date.now();

    try {
        const response = await axios.post(
            "https://api-checkout.cinetpay.com/v2/payment",
            {
                apikey: API_KEY,
                site_id: SITE_ID,
                transaction_id,
                amount,
                currency: "XOF",
                description: "Commande #" + order_id,
                metadata: order_id,
                return_url: "https://google.com", // TEMP
                notify_url: "https://webhook.site/test" // TEMP TEST
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        res.redirect(response.data.data.payment_url);

    } catch (error) {
        console.log("Erreur:", error.response?.data || error.message);
        res.send(error.response?.data || error.message);
    }
});

// SERVER
app.listen(process.env.PORT || 3000);
