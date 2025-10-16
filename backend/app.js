const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// -----------------------
// PayHere API
// -----------------------
app.post("/api/payhere/order", (req, res) => {
  const { order_id, items, currency, amount, first_name, last_name, email, phone, address, city, country } = req.body;

  const merchant_id = "1232089";
  const merchant_secret = "MTExNjEyNjQxNjE4MjM0MzE3NTIxODc4NTM5MDg3Mzc5MDA0NTg2NA==";

  // PayHere requires the exact same formatted amount in hash and payload
  const amountFixed = Number(amount).toFixed(2);
  const secret_md5 = crypto.createHash("md5").update(merchant_secret).digest("hex").toUpperCase();
  const hash_string = merchant_id + order_id + amountFixed + currency + secret_md5;
  const hash = crypto.createHash("md5").update(hash_string).digest("hex").toUpperCase();

  const origin = req.headers.origin || process.env.FRONTEND_URL || "http://localhost:5173";

  res.json({
    merchant_id,
    return_url: `${origin}/success`,
    cancel_url: `${origin}/cancel`,
    notify_url: "http://localhost:5000/notify",
    order_id,
    items,
    currency,
    amount: amountFixed,
    first_name,
    last_name,
    email,
    phone,
    address,
    city,
    country,
    hash,
  });
});

// -----------------------
// PayHere notify
// -----------------------
app.post("/notify", (req, res) => {
  console.log("PayHere Notify Data:", req.body);
  res.sendStatus(200);
});

// -----------------------
// React static build
// -----------------------
app.use(express.static(path.join(__dirname, "build")));

// Catch-all for React Router
app.all("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// -----------------------
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
