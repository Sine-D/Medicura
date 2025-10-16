import React from "react";
import "../styles/pages.css";

function CancelPage() {
  return (
    <div className="page-container" style={{ background: "linear-gradient(135deg, #ff416c, #ff4b2b)" }}>
      <h1>Payment Cancelled</h1>
      <p>Your payment was cancelled.</p>
    </div>
  );
}

export default CancelPage;
