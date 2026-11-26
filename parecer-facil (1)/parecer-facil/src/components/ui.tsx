"use client";

import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/lib/util";

export function Card({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cx("rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-900/[0.04]", className)}>
      {children}
    </section>
  );
}

export function CardTitulo({
  passo,
  titulo,
  descricao,
  icone,
}: {
  passo: number;
  titulo: string;
  descricao?: string;
  icone: ReactNode;
}) {
  return (
    <header className="mb-5 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">{icone}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500">Passo {passo}</p>
        <h2 className="font-display text-[17px] font-bold leading-tight text-slate-900">{titulo}</h2>
        {descricao && <p className="mt-0.5 text-[13px] leading-snug text-slate-500">{descricao}</p>}
      </div>
    </header>
  );
}

export function Rotulo({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-[13px] font-semibold text-slate-700">
      {children}
    </label>
  );
}

interface OpcaoSegmentada<T extends string> {
  valor: T;
  rotulo: string;
  detalhe?: string;
  icone?: ReactNode;
}

export function Segmentado<T extends string>({
  opcoes,
  valor,
  onChange,
  nome,
  grande,
}: {
  opcoes: OpcaoSegmentada<T>[];
  valor: T | null;
  onChange: (v: T) => void;
  nome: string;
  grande?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={nome} className="grid grid-cols-2 gap-2.5">
      {opcoes.map((o) => {
        const ativo = valor === o.valor;
        return (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => onChange(o.valor)}
            className={cx(
              "relative flex flex-col items-center justify-center rounded-2xl border-2 px-3 text-center transition-all active:scale-[0.97]",
              grande ? "min-h-[76px] py-3" : "min-h-[56px] py-2.5",
              ativo
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-[0_4px_14px_-6px_rgb(79_70_229/0.5)]"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
            )}
          >
            {ativo && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
            {o.icone && <span className="mb-1">{o.icone}</span>}
            <span className="text-[14px] font-semibold leading-tight">{o.rotulo}</span>
            {o.detalhe && <span className={cx("text-[12px]", ativo ? "text-indigo-500" : "text-slate-400")}>{o.detalhe}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Chip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={onClick}
      className={cx(
        "inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-3.5 py-2 text-left text-[13.5px] font-medium leading-tight transition-all active:scale-[0.96]",
        ativo
          ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_4px_12px_-4px_rgb(16_185_129/0.6)]"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
      )}
    >
      {ativo && <Check size={15} strokeWidth={3} className="shrink-0" />}
      {children}
    </button>
  );
}
