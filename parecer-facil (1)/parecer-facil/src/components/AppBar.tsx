"use client";

import { Users } from "lucide-react";
import { Logo } from "./Logo";

export function AppBar({ total, onAbrirTurma }: { total: number; onAbrirTurma: () => void }) {
  return (
    <header className="pt-safe sticky top-0 z-30 border-b border-slate-200/70 bg-[#F8FAFC]/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Logo size={36} />
          <div className="min-w-0 leading-tight">
            <h1 className="font-display text-[17px] font-extrabold tracking-tight text-slate-900">Parecer Fácil</h1>
            <p className="text-[11.5px] font-medium text-emerald-600">Alinhado à BNCC</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAbrirTurma}
          aria-haspopup="dialog"
          className="flex h-10 items-center gap-1.5 rounded-full bg-white px-3.5 text-[13.5px] font-semibold text-slate-700 shadow-card ring-1 ring-slate-900/5 transition active:scale-95"
        >
          <Users size={17} className="text-indigo-600" />
          Turma
          <span
            className={
              "ml-0.5 min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-[12px] font-bold tabular-nums " +
              (total ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500")
            }
          >
            {total}
          </span>
        </button>
      </div>
    </header>
  );
}
