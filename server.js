const express = require("express");
const app = express();

// CONFIG
const API_KEY = "sk_test_0hZHfZ5G1LgLTvLjnnuicOTV";
const SITE_ID = "587"; // test

// ✅ PAIEMENT DIRECT (SANS API)
app.get("/pay", (req, res) => {

    const { amount, order_id } = req.query;
    const transaction_id = "CMD_" + Date.now();

    // Lien paiement direct CinetPay
    const url = `https://checkout.cinetpay.com?apikey=${API_KEY}&site_id=${SITE_ID}&transaction_id=${transaction_id}&amount=${amount}&currency=XOF&description=Commande_${order_id}`;

    res.redirect(url);
});

app.get("/success", (req, res) => {
    res.send("✅ Paiement réussi !");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server OK ✅");
});
