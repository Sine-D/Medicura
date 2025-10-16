import React from "react";
import "../styles/pages.css";

function SuccessPage() {
  return (
    <div className="page-container" style={{ background: "linear-gradient(135deg, #56ab2f, #a8e063)" }}>
      <h1>Payment Successful!</h1>
      <p>Thank you for your purchase.</p>
    </div>
  );
}

export default SuccessPage;
