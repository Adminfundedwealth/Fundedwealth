import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountCard } from "./AccountCard";
import type { TradingAccount } from "./AccountCard";

function EmptyState({ onBuy }: { onBuy: () => void }) {
  return (
    <div className="col-span-full">
      <div className="bg-gradient-to-r from-[#4A00E0]/30 to-[#D63384]/20 border border-white/10 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">🚀</div>
        <h3 className="text-white font-bold text-xl mb-2">No Active Accounts Yet</h3>
        <p className="text-white/60 mb-6 max-w-md mx-auto">
          Start your funded trading journey today. Choose a challenge size and prove your trading skills.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onBuy} className="bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white rounded-xl px-6">
            <Plus size={16} className="mr-2" /> Buy First Challenge
          </Button>
          <a href="/checkout">
            <Button variant="outline" className="border-white/20 text-white bg-white/5 rounded-xl px-6">
              View Plans
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

interface Props {
  accounts: TradingAccount[];
}

export function AccountsSection({ accounts }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-extrabold text-xl">My Accounts</h2>
        <a href="/checkout">
          <Button className="bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white rounded-xl h-9 px-4 text-sm">
            <Plus size={14} className="mr-1.5" /> New Challenge
          </Button>
        </a>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {accounts.length === 0
          ? <EmptyState onBuy={() => { window.location.href = "/checkout"; }} />
          : accounts.map(acc => <AccountCard key={acc.id} acc={acc} />)
        }
      </div>
    </div>
  );
}
