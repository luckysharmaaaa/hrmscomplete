import React from "react";
import { Loader2, LogIn, LogOut } from "lucide-react";

/**
 * Every Punch In / Punch Out button in the app comes from here,
 * so size, colour, label and loading text can never drift apart again.
 */

const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white transition-all duration-200 active:scale-[0.985] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export const PunchInButton = ({ busy = false, disabled = false, block = true, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={busy || disabled}
    className={`${base} ${block ? "w-full" : ""} bg-gradient-to-r from-orange-500 to-orange-400 shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-orange-500 focus-visible:ring-orange-400`}
  >
    {busy ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
    {busy ? "Punching in…" : "Punch In"}
  </button>
);

export const PunchOutButton = ({ busy = false, disabled = false, block = true, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={busy || disabled}
    className={`${base} ${block ? "w-full" : ""} bg-gradient-to-r from-[#0F265C] to-[#1a3a7c] shadow-md shadow-blue-900/20 hover:from-[#0a1d4a] hover:to-[#132e68] focus-visible:ring-[#0F265C]`}
  >
    {busy ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
    {busy ? "Punching out…" : "Punch Out"}
  </button>
);