import React, { useState } from "react";
import { Link } from "wouter";
import { CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
  onAgree: () => void;
}

export const TermsModal = ({ open, onClose, onAgree }: TermsModalProps) => {
  const [checks, setChecks] = useState([false, false, false]);
  const allChecked = checks.every(Boolean);

  const toggle = (i: number) => {
    const next = [...checks];
    next[i] = !next[i];
    setChecks(next);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1A0030] border border-white/10 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-heading font-bold text-xl">
                Before you proceed
              </h3>
              <button onClick={onClose} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <p className="text-white/50 text-sm mb-6">
              Please agree to the trading rules
            </p>

            <div className="space-y-4 mb-6">
              {[
                <React.Fragment key="rules">I have read and agreed to the <Link href="/rules" className="text-[#8E2DE2] hover:underline">Trading Rules</Link>.</React.Fragment>,
                <React.Fragment key="info">I declare that all information filled are correct and corresponds to government issued identification.</React.Fragment>,
                <React.Fragment key="terms">I declare that I have read and agreed with the <Link href="/terms" className="text-[#8E2DE2] hover:underline">Terms & Conditions</Link>.</React.Fragment>,
              ].map((text, i) => (
                <label
                  key={i}
                  className="flex items-start gap-3 cursor-pointer group"
                  onClick={() => toggle(i)}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      checks[i]
                        ? "bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2]"
                        : "border border-white/20 bg-white/5"
                    }`}
                  >
                    {checks[i] && <CheckCircle2 size={14} className="text-white" />}
                  </div>
                  <span className="text-white/70 text-sm leading-relaxed">{text}</span>
                </label>
              ))}
            </div>

            <Button
              onClick={onAgree}
              disabled={!allChecked}
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] text-white border-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              I Agree
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
