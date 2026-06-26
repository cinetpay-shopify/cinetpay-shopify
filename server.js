const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const API_KEY = "sk_test_0hZHfZ5G1LgLTvLjnnuicOTV";
const SITE_ID = "587";

const SHOP = "clicassistpro.myshopify.com";
const ACCESS_TOKEN = "ICI_ACCESS_TOKEN";

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
                return_url: `https://${req.headers.host}/success`,
                notify_url: `https://${req.headers.host}/webhook`
            }
        );

        res.redirect(response.data.data.payment_url);

    } catch (error) {
        console.log(error);
        res.send("Erreur paiement");
    }
});

app.post("/webhook", async (req, res) => {

    const transaction_id = req.body.transaction_id;

    try {

        const check = await axios.post(
            "https://api-checkout.cinetpay.com/v2/payment/check",
            {
                apikey: API_KEY,
                site_id: SITE_ID,
                transaction_id
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
        console.log(error);
        res.send("Erreur webhook");
    }
});

app.get("/success", (req, res) => {
    res.send("✅ Paiement réussi !");
});

app.listen(process.env.PORT || 3000);
