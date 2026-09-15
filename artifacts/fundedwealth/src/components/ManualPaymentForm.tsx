import React, { useState, useEffect } from "react";
import { AlertTriangle, Banknote, CheckCircle, Clipboard, Smartphone, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import QRCode from "qrcode";

interface ManualPaymentFormProps {
  amount: number;
  orderId: number;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const ManualPaymentForm: React.FC<ManualPaymentFormProps> = ({
  amount,
  orderId,
  onSubmit,
  isLoading = false,
}) => {
  const [method, setMethod] = useState<"upi" | "bank">("upi");
  const [utr, setUtr] = useState("");
  const [reference, setReference] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [timer, setTimer] = useState(900); // 15 minutes
  const [qrCode, setQrCode] = useState<string>("");
  const [copying, setCopying] = useState<string | null>(null);

  // Use Vite env vars (VITE_*) — process.env.REACT_APP_* is a CRA convention and always undefined in Vite
  const upiId = import.meta.env.VITE_MANUAL_PAYMENT_UPI_ID || "s3368712605@slc";
  const accountName = import.meta.env.VITE_MANUAL_PAYMENT_ACCOUNT_NAME || "AMAN KUMAR SINGH";
  const bankName = import.meta.env.VITE_MANUAL_PAYMENT_BANK_NAME || "Slice Small Finance Bank";
  const accountNumber = import.meta.env.VITE_MANUAL_PAYMENT_ACCOUNT_NO || "033311501069826";
  const ifsc = import.meta.env.VITE_MANUAL_PAYMENT_IFSC || "NESF0000333";

  // Generate UPI QR code
  useEffect(() => {
    const generateQR = async () => {
      try {
        const upiString = `upi://pay?pa=${upiId}&pn=FundedWealth&am=${amount}&tn=Payment for Order ${orderId}&tr=${Date.now()}`;
        const qr = await QRCode.toDataURL(upiString, {
          errorCorrectionLevel: "H",
          type: "image/png",
          quality: 0.95,
          margin: 1,
          width: 300,
        });
        setQrCode(qr);
      } catch (err) {
        console.error("QR Code generation error:", err);
      }
    };
    generateQR();
  }, [amount, upiId, orderId]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProof(e.target.files[0]);
    }
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopying(field);
      setTimeout(() => setCopying(null), 2000);
    } catch {
      alert("Failed to copy");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (method === "upi" && !utr.trim()) {
      alert("Please enter UTR/Reference Number");
      return;
    }

    if (method === "bank" && !reference.trim()) {
      alert("Please enter Reference Number");
      return;
    }

    if (!proof) {
      alert("Please upload payment proof");
      return;
    }

    const formData = new FormData();
    formData.append("orderId", orderId.toString());
    formData.append("method", method);
    formData.append("amount", amount.toString());
    formData.append("proof", proof);

    if (method === "upi") {
      formData.append("utr", utr.trim());
      formData.append("upiId", upiId);
    } else {
      formData.append("reference", reference.trim());
    }

    onSubmit(formData);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const isExpired = timer === 0;

  return (
    <form
      className="w-full max-w-2xl mx-auto p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg shadow-xl text-white"
      onSubmit={handleSubmit}
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Manual Payment</h2>
        <p className="text-sm text-gray-400">Complete your payment by UPI or Bank Transfer</p>
      </div>

      {/* Amount and Timer */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-700 rounded-lg">
        <div>
          <div className="text-xs text-gray-400 mb-1">Amount to Pay</div>
          <div className="text-3xl font-bold text-emerald-400">₹{amount.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Payment expires in</div>
          <div className={`text-3xl font-bold font-mono ${isExpired ? "text-red-400" : "text-yellow-400"}`}>
            {formatTime(timer)}
          </div>
        </div>
      </div>

      {isExpired && (
        <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-300" />
          Payment link has expired. Please initiate a new payment.
        </div>
      )}

      {/* Payment Method Tabs */}
      <div className="flex gap-3 mb-6">
        <Button
          type="button"
          onClick={() => setMethod("upi")}
          variant={method === "upi" ? "default" : "outline"}
          className={method === "upi" ? "bg-purple-600 hover:bg-purple-700" : ""}
        >
          <Smartphone size={16} className="mr-2" /> UPI Payment
        </Button>
        <Button
          type="button"
          onClick={() => setMethod("bank")}
          variant={method === "bank" ? "default" : "outline"}
          className={method === "bank" ? "bg-blue-600 hover:bg-blue-700" : ""}
        >
          <Banknote size={16} className="mr-2" /> Bank Transfer
        </Button>
      </div>

      {/* UPI Method */}
      {method === "upi" && (
        <div className="mb-6 p-4 bg-slate-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">UPI Payment</h3>

          {/* QR Code */}
          <div className="flex flex-col items-center mb-6">
            {qrCode ? (
              <div className="p-4 bg-white rounded-lg">
                <img src={qrCode} alt="UPI QR Code" className="w-64 h-64" />
              </div>
            ) : (
              <div className="w-64 h-64 bg-slate-600 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Generating QR...</span>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-3 text-center">
              Scan this QR code with any UPI app to pay ₹{amount.toFixed(2)}
            </p>
          </div>

          {/* UPI ID */}
          <div className="mb-4 p-3 bg-slate-600 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 mb-1">UPI ID</div>
              <div className="font-mono text-lg font-semibold">{upiId}</div>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => handleCopy(upiId, "upi")}
              className={copying === "upi" ? "bg-green-600" : ""}
            >
              {copying === "upi" ? "Copied" : "Copy"}
            </Button>
          </div>

          {/* UTR Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">UTR / Reference Number</label>
            <Input
              type="text"
              placeholder="Enter UTR from transaction receipt"
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              disabled={isExpired || isLoading}
              className="bg-slate-600 border-slate-500 text-white placeholder-gray-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              You'll find this in your payment confirmation
            </p>
          </div>
        </div>
      )}

      {/* Bank Transfer Method */}
      {method === "bank" && (
        <div className="mb-6 p-4 bg-slate-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Bank Transfer Details</h3>

          {/* Bank Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Account Holder */}
            <div className="p-3 bg-slate-600 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Account Holder</div>
              <div className="font-semibold">{accountName}</div>
            </div>

            {/* Bank Name */}
            <div className="p-3 bg-slate-600 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Bank Name</div>
              <div className="font-semibold">{bankName}</div>
            </div>

            {/* Account Number */}
            <div className="p-3 bg-slate-600 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 mb-1">Account Number</div>
                <div className="font-mono font-semibold text-lg">{accountNumber}</div>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => handleCopy(accountNumber, "account")}
                className={copying === "account" ? "bg-green-600" : ""}
              >
                {copying === "account" ? "Copied" : "Copy"}
              </Button>
            </div>

            {/* IFSC */}
            <div className="p-3 bg-slate-600 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 mb-1">IFSC Code</div>
                <div className="font-mono font-semibold text-lg">{ifsc}</div>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => handleCopy(ifsc, "ifsc")}
                className={copying === "ifsc" ? "bg-green-600" : ""}
              >
                <Clipboard size={14} className="mr-1" /> {copying === "ifsc" ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Payment Details */}
          <div className="p-3 bg-slate-600 rounded-lg mb-4">
            <div className="text-xs text-gray-400 mb-1">Amount to Transfer</div>
            <div className="text-2xl font-bold text-emerald-400">₹{amount.toFixed(2)}</div>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-2">
              <AlertTriangle size={14} /> Transfer EXACT amount including decimals if any
            </p>
          </div>

          {/* Reference Number Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Reference Number</label>
            <Input
              type="text"
              placeholder="Enter bank transfer reference number"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              disabled={isExpired || isLoading}
              className="bg-slate-600 border-slate-500 text-white placeholder-gray-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Check your bank statement for the transaction reference
            </p>
          </div>
        </div>
      )}

      {/* Proof Upload */}
      <div className="mb-6 p-4 bg-slate-700 rounded-lg">
        <label className="block text-sm font-medium mb-3">Upload Payment Proof</label>
        <div className="border-2 border-dashed border-slate-500 rounded-lg p-4 text-center">
          <Input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleProofChange}
            disabled={isExpired || isLoading}
            className="hidden"
            id="proof-input"
          />
          <label htmlFor="proof-input" className="cursor-pointer">
            <div className="text-gray-400">
              {proof ? (
                <div>
                  <CheckCircle size={28} className="mx-auto mb-2 text-emerald-400" />
                  <div className="font-semibold text-emerald-400">{proof.name}</div>
                  <p className="text-xs mt-2 text-gray-500">Click to change file</p>
                </div>
              ) : (
                <div>
                  <Upload size={28} className="mx-auto mb-2 text-gray-400" />
                  <p className="font-semibold">Click to upload proof</p>
                  <p className="text-xs mt-1 text-gray-500">
                    Screenshot or PDF of payment receipt
                  </p>
                </div>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isExpired || isLoading || !proof}
        className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Submitting..." : "Submit Payment"}
      </Button>

      {/* Help Text */}
      <p className="text-xs text-gray-400 mt-4 text-center">
        Your payment will be reviewed and verified within 24 hours
      </p>
    </form>
  );
};

export default ManualPaymentForm;
