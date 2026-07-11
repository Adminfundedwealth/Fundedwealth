import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationPreferences } from "@/hooks/useNotifications";
import { type TFunction } from "i18next";

interface Props {
  displayName: string;
  displayEmail: string;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  preferences: NotificationPreferences;
  updatePreferences: (patch: Partial<NotificationPreferences>) => void;
  notificationSettingItems: Array<{ key: keyof NotificationPreferences; label: string }>;
  i18n: { language: string; changeLanguage: (lng: string) => void };
}

export function SettingsSection({
  displayName,
  displayEmail,
  darkMode,
  setDarkMode,
  preferences,
  updatePreferences,
  notificationSettingItems,
  i18n,
}: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-white font-extrabold text-xl">Settings</h2>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
        <h3 className="text-white font-bold">Profile</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { label: "Full Name", value: displayName, type: "text" },
            { label: "Email", value: displayEmail, type: "email" },
          ].map(f => (
            <div key={f.label}>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-1.5">{f.label}</label>
              <input defaultValue={f.value} type={f.type}
                className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4A00E0]/60" />
            </div>
          ))}
        </div>
        <Button className="bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white rounded-xl px-6">Save Changes</Button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold mb-2">Appearance</h3>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon size={18} className="text-purple-400" /> : <Sun size={18} className="text-amber-400" />}
            <div>
              <span className="text-white/70 text-sm block">Theme</span>
              <span className="text-white/40 text-xs">{darkMode ? "Dark mode" : "Light mode"}</span>
            </div>
          </div>
          <button onClick={() => setDarkMode(!darkMode)}
            className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors ${darkMode ? "bg-[#4A00E0]" : "bg-amber-500"}`}>
            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all flex items-center justify-center ${darkMode ? "left-8" : "left-1"}`}>
              {darkMode ? <Moon size={10} className="text-[#4A00E0]" /> : <Sun size={10} className="text-amber-500" />}
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold mb-2">Language</h3>
        <div className="flex gap-3">
          {[
            { code: "en", label: "English", flag: "🇬🇧" },
            { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
          ].map(lang => (
            <button key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${i18n.language === lang.code
                ? "bg-[#4A00E0]/20 border-[#4A00E0]/40 text-white"
                : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                }`}>
              <span className="text-lg">{lang.flag}</span> {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold mb-2">Notifications</h3>
        {notificationSettingItems.map(item => {
          const isOn = preferences[item.key];
          return (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-white/8 last:border-0">
              <div className="space-y-1">
                <span className="text-white/70 text-sm">{item.label}</span>
                <span className="text-white/40 text-[11px]">{isOn ? "Enabled" : "Disabled"}</span>
              </div>
              <button onClick={() => updatePreferences({ [item.key]: !isOn })}
                className={`w-11 h-6 rounded-full relative transition-colors ${isOn ? "bg-[#4A00E0]" : "bg-white/15"}`}>
                <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${isOn ? "left-6" : "left-1"}`} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
