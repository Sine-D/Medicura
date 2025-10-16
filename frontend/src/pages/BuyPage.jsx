import React from "react";
import "../styles/pages.css";

function BuyPage() {
  const handleBuy = async () => {
    const orderData = {
      order_id: "ORDER" + Date.now(),
      items: "Test Item",
      currency: "LKR",
      amount: "1000.00",
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      phone: "0771234567",
      address: "Colombo",
      city: "Colombo",
      country: "Sri Lanka",
    };

    const res = await fetch("http://localhost:5000/api/payhere/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      alert("Server error! Check backend console.");
      return;
    }

    const data = await res.json();

    // Create form to redirect to PayHere
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://sandbox.payhere.lk/pay/checkout";

    Object.keys(data).forEach((key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = data[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="page-container">
      <h1>Buy Page</h1>
      <button className="btn-buy" onClick={handleBuy}>
        Buy Now
      </button>
    </div>
  );
}

export default BuyPage;
