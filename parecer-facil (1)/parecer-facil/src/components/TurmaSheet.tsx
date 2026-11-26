"use client";

import { Check, ChevronDown, ClipboardCopy, Copy, FileText, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ETAPAS, type ParecerSalvo } from "@/lib/dados";
import { copiarTexto, cx, vibrar } from "@/lib/util";

function formatarTurma(turma: ParecerSalvo[]): string {
  return turma
    .map((p) => `${p.nome.toUpperCase()} — ${p.periodo}\n\n${p.texto}`)
    .join("\n\n────────────────────\n\n");
}

export function TurmaSheet({
  aberto,
  onFechar,
  turma,
  onRemover,
  onLimpar,
  avisar,
}: {
  aberto: boolean;
  onFechar: () => void;
  turma: ParecerSalvo[];
  onRemover: (id: string) => void;
  onLimpar: () => void;
  avisar: (msg: string) => void;
}) {
  const [expandido, setExpandido] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [confirmarLimpar, setConfirmarLimpar] = useState(false);
  const painel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) {
      setConfirmarLimpar(false);
      return;
    }
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", tecla);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    painel.current?.focus();
    return () => {
      document.removeEventListener("keydown", tecla);
      document.body.style.overflow = overflow;
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  async function copiar(id: string, texto: string) {
    if (await copiarTexto(texto)) {
      vibrar();
      setCopiado(id);
      setTimeout(() => setCopiado((c) => (c === id ? null : c)), 1800);
    } else avisar("Não foi possível copiar neste navegador.");
  }

  function limpar() {
    if (!confirmarLimpar) {
      setConfirmarLimpar(true);
      setTimeout(() => setConfirmarLimpar(false), 4000);
      return;
    }
    onLimpar();
    setConfirmarLimpar(false);
    avisar("Turma limpa.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label="Pareceres da turma">
      <button aria-label="Fechar" onClick={onFechar} className="absolute inset-0 animate-aparece bg-slate-900/40 backdrop-blur-[2px]" />
      <div
        ref={painel}
        tabIndex={-1}
        className="pb-safe relative flex max-h-[88dvh] w-full max-w-[480px] animate-sobe flex-col rounded-t-[28px] bg-[#F8FAFC] shadow-2xl outline-none"
      >
        <div className="flex justify-center pt-2.5">
          <span className="h-1.5 w-10 rounded-full bg-slate-300" />
        </div>
        <div className="flex items-center justify-between px-5 pb-3 pt-2">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">Minha turma</h2>
            <p className="text-[13px] text-slate-500">
              {turma.length === 0 ? "Nenhum parecer salvo ainda" : `${turma.length} ${turma.length === 1 ? "parecer salvo" : "pareceres salvos"} neste aparelho`}
            </p>
          </div>
          <button onClick={onFechar} aria-label="Fechar" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-card active:scale-95">
            <X size={20} />
          </button>
        </div>

        <div className="sem-scroll flex-1 space-y-3 overflow-y-auto px-4 pb-4">
          {turma.length === 0 && (
            <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-slate-200 px-6 py-12 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                <FileText size={26} />
              </div>
              <p className="font-semibold text-slate-700">Sua turma aparece aqui</p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                Gere um parecer e toque em <b>Salvar e Próximo Aluno</b>. Tudo fica guardado só neste aparelho.
              </p>
            </div>
          )}

          {turma.map((p) => {
            const aberto = expandido === p.id;
            return (
              <article key={p.id} className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-900/[0.04]">
                <button type="button" onClick={() => setExpandido(aberto ? null : p.id)} className="flex w-full items-start justify-between gap-3 text-left">
                  <div className="min-w-0">
                    <p className="font-display font-bold text-slate-900">{p.nome}</p>
                    <p className="text-[12px] text-slate-500">
                      {p.periodo} · {ETAPAS.find((e) => e.id === p.etapa)?.curto ?? ""}
                    </p>
                  </div>
                  <ChevronDown size={18} className={cx("mt-1 shrink-0 text-slate-400 transition-transform", aberto && "rotate-180")} />
                </button>
                <p className={cx("mt-2 whitespace-pre-line text-[14px] leading-relaxed text-slate-600", !aberto && "line-clamp-3")}>{p.texto}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => copiar(p.id, p.texto)}
                    className={cx(
                      "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-[13px] font-semibold transition active:scale-[0.97]",
                      copiado === p.id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-700",
                    )}
                  >
                    {copiado === p.id ? <Check size={16} /> : <Copy size={16} />}
                    {copiado === p.id ? "Copiado!" : "Copiar"}
                  </button>
                  <button
                    onClick={() => {
                      onRemover(p.id);
                      avisar(`Parecer de ${p.nome} excluído.`);
                    }}
                    aria-label={`Excluir parecer de ${p.nome}`}
                    className="flex h-10 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-500 active:scale-95"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {turma.length > 0 && (
          <div className="space-y-2 border-t border-slate-200/80 bg-white/80 px-4 pt-3 backdrop-blur">
            <button
              onClick={() => copiar("__turma", formatarTurma(turma))}
              className={cx(
                "flex h-13 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold text-white shadow-lg transition active:scale-[0.98]",
                copiado === "__turma" ? "bg-emerald-500 shadow-emerald-500/30" : "bg-indigo-600 shadow-indigo-600/30",
              )}
            >
              {copiado === "__turma" ? <Check size={19} /> : <ClipboardCopy size={19} />}
              {copiado === "__turma" ? "Turma copiada! Cole no Word ou Docs" : "Copiar Turma Completa"}
            </button>
            <button
              onClick={limpar}
              className={cx(
                "flex h-11 w-full items-center justify-center gap-1.5 rounded-2xl text-[14px] font-semibold transition",
                confirmarLimpar ? "bg-rose-500 text-white" : "text-rose-500",
              )}
            >
              <Trash2 size={16} />
              {confirmarLimpar ? "Toque de novo para apagar tudo" : "Limpar Turma"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
