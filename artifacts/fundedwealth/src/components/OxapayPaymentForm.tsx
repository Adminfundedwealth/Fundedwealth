import React, { useState } from "react";

interface OxapayPaymentFormProps {
  amount: number;
  onSuccess: (data: any) => void;
  onError: (error: string) => void;
}

const OxapayPaymentForm: React.FC<OxapayPaymentFormProps> = ({ amount, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [payLink, setPayLink] = useState<string | null>(null);
  const [trackId, setTrackId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleStartPayment = async () => {
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/payments/create-crypto-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: "oxapay-usdt-trc20",
          planType: "flash",
          sizeIndex: 0,
          couponCode: "",
          referralCode: "",
          billing: {},
        }),
      });
      const data = await res.json();
      if (data.success && data.payLink && data.trackId) {
        setPayLink(data.payLink);
        setTrackId(data.trackId);
        setStatus("Waiting for payment...");
        pollStatus(data.trackId);
      } else {
        onError(data.message || "Failed to create payment");
      }
    } catch (err) {
      onError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const pollStatus = async (trackId: string) => {
    let attempts = 0;
    const poll = async () => {
      if (attempts++ > 30) return setStatus("Payment not confirmed. Try again or use manual payment.");
      try {
        const res = await fetch(`/api/payments/payment-status/${trackId}`);
        const data = await res.json();
        if (data.success && data.status === "Paid") {
          setStatus("Payment confirmed!");
          onSuccess(data);
        } else if (data.success && ["Waiting", "Confirming"].includes(data.status)) {
          setTimeout(poll, 4000);
        } else {
          setStatus(data.message || "Payment failed or expired.");
        }
      } catch {
        setStatus("Error checking payment status.");
      }
    };
    poll();
  };

  return (
    <div className="border rounded p-4 bg-white shadow">
      <h2 className="text-lg font-bold mb-2">Pay with Crypto (OxaPay)</h2>
      <div className="mb-2">Amount: <span className="font-semibold">₹{amount}</span></div>
      {payLink ? (
        <>
          <a href={payLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Open OxaPay Payment Link</a>
          <div className="mt-2 text-sm">{status}</div>
        </>
      ) : (
        <button onClick={handleStartPayment} disabled={loading} className="btn btn-primary">
          {loading ? "Creating Invoice..." : "Pay with Crypto"}
        </button>
      )}
      {status && !payLink && <div className="mt-2 text-red-600">{status}</div>}
    </div>
  );
};

export default OxapayPaymentForm;
