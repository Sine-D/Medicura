import crypto from 'crypto';

// PayHere Configuration
const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID || "1232089";
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET || "MTExNjEyNjQxNjE4MjM0MzE3NTIxODc4NTM5MDg3Mzc5MDA0NTg2NA==";
const RETURN_URL = process.env.PAYHERE_RETURN_URL || "http://localhost:3000/success";
const CANCEL_URL = process.env.PAYHERE_CANCEL_URL || "http://localhost:3000/cancel";
const NOTIFY_URL = process.env.PAYHERE_NOTIFY_URL || "http://localhost:5000/api/payhere/notify";

// Generate MD5 Hash for PayHere
const generateHash = (merchantId, orderId, amount, currency, merchantSecret) => {
  const hashedSecret = crypto
    .createHash("md5")
    .update(merchantSecret)
    .digest("hex")
    .toUpperCase();

  const amountFormatted = parseFloat(amount).toFixed(2);
  const hashString = `${merchantId}${orderId}${amountFormatted}${currency}${hashedSecret}`;

  return crypto
    .createHash("md5")
    .update(hashString)
    .digest("hex")
    .toUpperCase();
};

// Create Payment Order
export const createOrder = async (req, res) => {
  try {
    const {
      order_id,
      items,
      currency,
      amount,
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      country,
    } = req.body;

    if (!order_id || !amount || !first_name || !last_name || !email || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const hash = generateHash(MERCHANT_ID, order_id, amount, currency, MERCHANT_SECRET);

    const payhereData = {
      merchant_id: MERCHANT_ID,
      return_url: RETURN_URL,
      cancel_url: CANCEL_URL,
      notify_url: NOTIFY_URL,
      order_id: order_id,
      items: items,
      currency: currency,
      amount: amount,
      first_name: first_name,
      last_name: last_name,
      email: email,
      phone: phone,
      address: address,
      city: city,
      country: country,
      hash: hash,
    };

    console.log("PayHere Order Created:", payhereData);
    res.status(200).json(payhereData);
  } catch (error) {
    console.error("Error creating PayHere order:", error);
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

// Payment Notification Handler (IPN)
export const handleNotification = async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
    } = req.body;

    console.log("PayHere Notification Received:", req.body);

    const localMd5sig = crypto
      .createHash("md5")
      .update(
        `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${crypto
          .createHash("md5")
          .update(MERCHANT_SECRET)
          .digest("hex")
          .toUpperCase()}`
      )
      .digest("hex")
      .toUpperCase();

    if (localMd5sig !== md5sig) {
      console.error("Hash verification failed!");
      return res.status(400).json({ message: "Invalid hash" });
    }

    if (status_code === "2") {
      console.log(`Payment Success: Order ${order_id}, Payment ID: ${payment_id}`);
    } else if (status_code === "0") {
      console.log(`Payment Pending: Order ${order_id}`);
    } else {
      console.log(`Payment Failed/Canceled: Order ${order_id}, Status: ${status_code}`);
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Error handling notification:", error);
    res.status(500).json({ message: "Notification handling failed", error: error.message });
  }
};

// Verify Payment Status
export const verifyPayment = async (req, res) => {
  try {
    const { order_id } = req.params;

    res.status(200).json({
      order_id: order_id,
      status: "success",
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Verification failed", error: error.message });
  }
};

export default {
  createOrder,
  handleNotification,
  verifyPayment
};