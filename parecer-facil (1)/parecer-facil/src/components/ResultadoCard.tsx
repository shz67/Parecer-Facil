"use client";

import { Check, Copy, MessageCircle, RefreshCw, Save, Sparkles } from "lucide-react";
import { forwardRef, useState } from "react";
import { contarPalavras, copiarTexto, cx, vibrar } from "@/lib/util";

interface Props {
  nome: string;
  periodo: string;
  texto: string;
  onTexto: (t: string) => void;
  gerando: boolean;
  onVariacao: () => void;
  onSalvar: () => void;
  avisar: (msg: string) => void;
}

export const ResultadoCard = forwardRef<HTMLElement, Props>(function ResultadoCard(
  { nome, periodo, texto, onTexto, gerando, onVariacao, onSalvar, avisar },
  ref,
) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    if (await copiarTexto(texto)) {
      vibrar();
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } else avisar("Não foi possível copiar neste navegador.");
  }

  function whatsapp() {
    const msg = `*Parecer Descritivo — ${nome}*\n_${periodo}_\n\n${texto}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <section ref={ref} className="scroll-mt-20 animate-aparece rounded-3xl bg-white shadow-card ring-1 ring-emerald-500/20">
      <header className="flex items-center gap-3 border-b border-slate-100 px-5 pb-3 pt-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <Sparkles size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[17px] font-bold leading-tight text-slate-900">Parecer de {nome}</h2>
          <p className="text-[12.5px] text-slate-500">{periodo} · toque no texto para editar</p>
        </div>
      </header>

      <div className="relative px-5 pt-4">
        <textarea
          value={texto}
          onChange={(e) => onTexto(e.target.value)}
          aria-label="Texto do parecer"
          rows={12}
          className={cx(
            "field-sizing-content block min-h-[260px] w-full resize-none rounded-2xl bg-slate-50 p-4 text-[15px] leading-[1.7] text-slate-800 outline-none ring-1 ring-slate-200 transition focus:bg-white focus:ring-2 focus:ring-indigo-400",
            gerando && "opacity-40",
          )}
        />
        {gerando && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-indigo-600 shadow-card">
              <RefreshCw size={15} className="animate-spin" /> Reescrevendo...
            </span>
          </div>
        )}
        <p className="mt-2 text-right text-[12px] tabular-nums text-slate-400">
          {contarPalavras(texto)} palavras · {texto.length} caracteres
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 px-5 pt-3">
        <BotaoAcao onClick={copiar} ativo={copiado} icone={copiado ? <Check size={19} /> : <Copy size={19} />} rotulo={copiado ? "Copiado!" : "Copiar"} />
        <BotaoAcao onClick={onVariacao} desabilitado={gerando} icone={<RefreshCw size={19} className={gerando ? "animate-spin" : ""} />} rotulo="Variação" />
        <BotaoAcao onClick={whatsapp} icone={<MessageCircle size={19} />} rotulo="WhatsApp" verde />
      </div>

      <div className="p-5 pt-3">
        <button
          type="button"
          onClick={onSalvar}
          disabled={gerando || !texto.trim()}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-[15.5px] font-semibold text-white shadow-lg shadow-emerald-500/30 transition active:scale-[0.98] disabled:opacity-50"
        >
          <Save size={19} /> Salvar e Próximo Aluno
        </button>
      </div>
    </section>
  );
});

function BotaoAcao({
  onClick,
  icone,
  rotulo,
  ativo,
  desabilitado,
  verde,
}: {
  onClick: () => void;
  icone: React.ReactNode;
  rotulo: string;
  ativo?: boolean;
  desabilitado?: boolean;
  verde?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desabilitado}
      className={cx(
        "flex h-[62px] flex-col items-center justify-center gap-1 rounded-2xl text-[12.5px] font-semibold transition active:scale-[0.96] disabled:opacity-50",
        ativo ? "bg-emerald-500 text-white" : verde ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700",
      )}
    >
      {icone}
      {rotulo}
    </button>
  );
}
