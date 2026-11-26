"use client";

import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  Feather,
  Heart,
  GraduationCap,
  PenLine,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  EIXOS,
  ETAPAS,
  PERIODOS,
  SELECAO_VAZIA,
  flexionar,
  type Eixo,
  type Genero,
  type PedidoParecer,
  type Selecao,
  type Tamanho,
  type Tom,
} from "@/lib/dados";
import { useTurma } from "@/lib/useTurma";
import { cx, novaVariacao, vibrar } from "@/lib/util";
import { AppBar } from "./AppBar";
import { ResultadoCard } from "./ResultadoCard";
import { TurmaSheet } from "./TurmaSheet";
import { Card, CardTitulo, Chip, Rotulo, Segmentado } from "./ui";

const PREFS = "parecer-facil:prefs:v1";

export function ParecerApp() {
  const { turma, adicionar, remover, limpar } = useTurma();

  // Formulário
  const [nome, setNome] = useState("");
  const [genero, setGenero] = useState<Genero | null>(null);
  const [etapa, setEtapa] = useState(ETAPAS[1].id);
  const [periodo, setPeriodo] = useState<string>(PERIODOS[0]);
  const [selecao, setSelecao] = useState<Selecao>(SELECAO_VAZIA);
  const [eixoAberto, setEixoAberto] = useState<Eixo["id"] | null>("convivencia");
  const [observacao, setObservacao] = useState("");
  const [tom, setTom] = useState<Tom>("acolhedor");
  const [tamanho, setTamanho] = useState<Tamanho>("curto");

  // Resultado
  const [texto, setTexto] = useState("");
  const [ultimoPedido, setUltimoPedido] = useState<PedidoParecer | null>(null);
  const [variacao, setVariacao] = useState<number>();
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Interface
  const [turmaAberta, setTurmaAberta] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const resultadoRef = useRef<HTMLElement>(null);
  const nomeRef = useRef<HTMLInputElement>(null);
  const avisoTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Lembra etapa, período, tom e tamanho entre sessões (agiliza a turma inteira)
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem(PREFS) || "{}");
      if (ETAPAS.some((e) => e.id === p.etapa)) setEtapa(p.etapa);
      if (PERIODOS.includes(p.periodo)) setPeriodo(p.periodo);
      if (p.tom === "acolhedor" || p.tom === "tecnico") setTom(p.tom);
      if (p.tamanho === "curto" || p.tamanho === "completo") setTamanho(p.tamanho);
    } catch {
      /* ignora */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(PREFS, JSON.stringify({ etapa, periodo, tom, tamanho }));
    } catch {
      /* ignora */
    }
  }, [etapa, periodo, tom, tamanho]);

  const avisar = useCallback((msg: string) => {
    setAviso(msg);
    clearTimeout(avisoTimer.current);
    avisoTimer.current = setTimeout(() => setAviso(null), 2600);
  }, []);

  const totalMarcados = EIXOS.reduce((n, e) => n + selecao[e.id].length, 0);
  const primeiroNome = nome.trim().split(/\s+/)[0] ?? "";
  const faltando = useMemo(() => {
    const f: string[] = [];
    if (!primeiroNome) f.push("nome");
    if (!genero) f.push("gênero");
    if (!totalMarcados) f.push("ao menos 1 característica");
    return f;
  }, [primeiroNome, genero, totalMarcados]);
  const podeGerar = faltando.length === 0 && !gerando;

  function alternar(eixo: Eixo["id"], item: string) {
    vibrar(8);
    setSelecao((s) => ({
      ...s,
      [eixo]: s[eixo].includes(item) ? s[eixo].filter((i) => i !== item) : [...s[eixo], item],
    }));
  }

  async function gerar(modo: "novo" | "variacao") {
    if (gerando) return;
    if (modo === "novo" && faltando.length) return;
    const v = novaVariacao(variacao);
    // Variação: mesmos dados do parecer atual, só muda a estrutura/vocabulário
    const pedido: PedidoParecer =
      modo === "variacao" && ultimoPedido
        ? { ...ultimoPedido, variacao: v }
        : {
            nome: primeiroNome.charAt(0).toUpperCase() + primeiroNome.slice(1),
            genero: genero as Genero,
            etapa,
            periodo,
            selecao,
            observacao: observacao.trim(),
            tom,
            tamanho,
            variacao: v,
          };

    setGerando(true);
    setErro(null);
    const controle = new AbortController();
    const limite = setTimeout(() => controle.abort(), 60000);
    try {
      const r = await fetch("/api/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido),
        signal: controle.signal,
      });
      const dados = await r.json().catch(() => ({}));
      if (!r.ok || !dados.texto) throw new Error(dados.erro || "Não foi possível gerar o parecer agora. Tente novamente.");

      setTexto(dados.texto);
      setVariacao(v);
      setUltimoPedido(pedido);
      vibrar(15);
      if (modo === "novo") {
        requestAnimationFrame(() => setTimeout(() => resultadoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60));
      } else {
        avisar("Nova versão pronta.");
      }
    } catch (e) {
      const msg =
        e instanceof DOMException && e.name === "AbortError"
          ? "A IA demorou demais para responder. Tente novamente."
          : e instanceof TypeError
            ? "Sem conexão com a internet. Verifique e tente novamente."
            : (e as Error).message;
      setErro(msg);
    } finally {
      clearTimeout(limite);
      setGerando(false);
    }
  }

  function salvarEProximo() {
    if (!ultimoPedido || !texto.trim()) return;
    const { nome: n, genero: g, etapa: et, periodo: pe } = ultimoPedido;
    adicionar({ nome: n, genero: g, etapa: et, periodo: pe, texto: texto.trim() });
    avisar(`${n} ${g === "menina" ? "salva" : "salvo"} na turma ✓`);
    setNome("");
    setGenero(null);
    setObservacao("");
    setTexto("");
    setUltimoPedido(null);
    setVariacao(undefined);
    setErro(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => nomeRef.current?.focus({ preventScroll: true }), 450);
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[480px] bg-[#F8FAFC] min-[520px]:my-6 min-[520px]:min-h-[calc(100dvh-3rem)] min-[520px]:overflow-clip min-[520px]:rounded-[32px] min-[520px]:shadow-app">
      <AppBar total={turma.length} onAbrirTurma={() => setTurmaAberta(true)} />

      <main className="space-y-4 px-4 pb-40 pt-4">
        <div className="px-1">
          <p className="font-display text-[22px] font-bold leading-tight tracking-tight text-slate-900">
            Pareceres que soam como você,
            <span className="text-indigo-600"> em segundos.</span>
          </p>
          <p className="mt-1 text-[13.5px] text-slate-500">Marque o que observou. A escrita fica com a gente.</p>
        </div>

        {/* CARD 1 */}
        <Card>
          <CardTitulo passo={1} titulo="Identificação do aluno" icone={<UserRound size={20} />} />

          <Rotulo htmlFor="nome">Primeiro nome do aluno</Rotulo>
          <input
            ref={nomeRef}
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value.replace(/\s{2,}/g, " ").slice(0, 30))}
            placeholder="Ex.: Helena"
            autoComplete="off"
            autoCapitalize="words"
            enterKeyHint="next"
            className="h-[52px] w-full rounded-2xl border-0 bg-slate-50 px-4 font-medium text-slate-900 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-400"
          />
          <p className="mt-1.5 flex items-center gap-1 text-[12px] text-slate-500">
            <ShieldCheck size={13} className="shrink-0 text-emerald-500" />
            LGPD: informe apenas o primeiro nome
          </p>
          {nome.trim().includes(" ") && (
            <p className="mt-0.5 pl-[17px] text-[12px] font-semibold text-amber-600">Usaremos só “{primeiroNome}”</p>
          )}

          <div className="mt-5">
            <Rotulo>Gênero (para a concordância do texto)</Rotulo>
            <Segmentado<Genero>
              nome="Gênero"
              grande
              valor={genero}
              onChange={(g) => {
                vibrar(8);
                setGenero(g);
              }}
              opcoes={[
                { valor: "menino", rotulo: "Menino", detalhe: "Ele / Dele" },
                { valor: "menina", rotulo: "Menina", detalhe: "Ela / Dela" },
              ]}
            />
          </div>

          <div className="mt-5">
            <Rotulo htmlFor="etapa">Etapa de ensino</Rotulo>
            <div className="relative">
              <GraduationCap size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
              <select
                id="etapa"
                value={etapa}
                onChange={(e) => setEtapa(e.target.value)}
                className="h-[52px] w-full appearance-none rounded-2xl border-0 bg-slate-50 pl-11 pr-10 font-medium text-slate-900 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-400"
              >
                {ETAPAS.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="mt-5">
            <Rotulo>Período</Rotulo>
            <div className="sem-scroll -mx-5 flex snap-x gap-2 overflow-x-auto scroll-smooth px-5 pb-1">
              {PERIODOS.map((p) => {
                const ativo = periodo === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriodo(p)}
                    aria-pressed={ativo}
                    className={cx(
                      "h-10 shrink-0 snap-start rounded-full px-4 text-[13.5px] font-semibold transition active:scale-95",
                      ativo ? "bg-indigo-600 text-white shadow-[0_4px_12px_-4px_rgb(79_70_229/0.6)]" : "bg-slate-100 text-slate-600",
                    )}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* CARD 2 */}
        <Card>
          <CardTitulo
            passo={2}
            titulo="Avaliação por eixos"
            descricao="Toque no que você observou. Pode marcar quantos quiser."
            icone={<BookOpen size={20} />}
          />
          <div className="space-y-2.5">
            {EIXOS.map((eixo) => {
              const aberto = eixoAberto === eixo.id;
              const qtd = selecao[eixo.id].length;
              return (
                <div key={eixo.id} className={cx("rounded-2xl ring-1 transition", aberto ? "bg-slate-50/70 ring-indigo-100" : "ring-slate-200")}>
                  <button
                    type="button"
                    onClick={() => setEixoAberto(aberto ? null : eixo.id)}
                    aria-expanded={aberto}
                    className="flex min-h-[60px] w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <span
                      className={cx(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-display text-[13px] font-bold",
                        qtd ? "bg-emerald-500 text-white" : "bg-indigo-50 text-indigo-600",
                      )}
                    >
                      {qtd || eixo.numero}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14.5px] font-semibold leading-tight text-slate-900">{eixo.titulo}</span>
                      <span className="block text-[12px] text-slate-500">
                        {qtd ? `${qtd} ${qtd === 1 ? "marcada" : "marcadas"} · ` : ""}
                        {eixo.subtitulo}
                      </span>
                    </span>
                    <ChevronDown size={19} className={cx("shrink-0 text-slate-400 transition-transform duration-300", aberto && "rotate-180")} />
                  </button>
                  <div className={cx("grid transition-[grid-template-rows] duration-300 ease-out", aberto ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                    <div className="overflow-hidden">
                      <div className="flex flex-wrap gap-2 px-4 pb-4">
                        {eixo.itens.map((item) => (
                          <Chip key={item} ativo={selecao[eixo.id].includes(item)} onClick={() => alternar(eixo.id, item)}>
                            {flexionar(item, genero)}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* CARD 3 */}
        <Card>
          <CardTitulo passo={3} titulo="Toque pessoal e estilo" icone={<PenLine size={20} />} />
          <Rotulo htmlFor="obs">Destaque ou observação individual (opcional)</Rotulo>
          <textarea
            id="obs"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value.slice(0, 600))}
            rows={3}
            placeholder="Ex.: evoluiu muito na escrita do próprio nome, faltou algumas aulas por saúde..."
            className="field-sizing-content block min-h-[96px] w-full resize-none rounded-2xl border-0 bg-slate-50 p-4 leading-relaxed text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-400"
          />
          <p className="mt-1 text-right text-[11.5px] tabular-nums text-slate-400">{observacao.length}/600</p>

          <div className="mt-3">
            <Rotulo>Tom do texto</Rotulo>
            <Segmentado<Tom>
              nome="Tom"
              valor={tom}
              onChange={setTom}
              opcoes={[
                { valor: "acolhedor", rotulo: "Acolhedor e Afetivo", icone: <Heart size={18} /> },
                { valor: "tecnico", rotulo: "Técnico e Pedagógico", icone: <GraduationCap size={18} /> },
              ]}
            />
          </div>
          <div className="mt-5">
            <Rotulo>Tamanho</Rotulo>
            <Segmentado<Tamanho>
              nome="Tamanho"
              valor={tamanho}
              onChange={setTamanho}
              opcoes={[
                { valor: "curto", rotulo: "Curto", detalhe: "2 parágrafos", icone: <Feather size={18} /> },
                { valor: "completo", rotulo: "Completo", detalhe: "3 a 4 parágrafos", icone: <BookOpen size={18} /> },
              ]}
            />
          </div>
        </Card>

        {texto && ultimoPedido && (
          <ResultadoCard
            ref={resultadoRef}
            nome={ultimoPedido.nome}
            periodo={ultimoPedido.periodo}
            texto={texto}
            onTexto={setTexto}
            gerando={gerando}
            onVariacao={() => gerar("variacao")}
            onSalvar={salvarEProximo}
            avisar={avisar}
          />
        )}

        <p className="px-6 pt-2 text-center text-[11.5px] leading-relaxed text-slate-400">
          Revise sempre o texto antes de enviar. Os pareceres ficam salvos apenas neste aparelho.
        </p>
      </main>

      {/* Barra inferior fixa com o botão principal */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[480px]">
        <div className="pb-safe pointer-events-auto bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/95 to-transparent px-4 pt-6">
          {erro && (
            <div role="alert" className="mb-2.5 flex animate-aparece items-start gap-2.5 rounded-2xl bg-rose-50 p-3.5 text-[13.5px] font-medium text-rose-700 ring-1 ring-rose-200">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span className="flex-1">{erro}</span>
              <button onClick={() => setErro(null)} aria-label="Fechar aviso" className="-m-1 p-1 text-rose-400">
                <X size={16} />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => gerar("novo")}
            disabled={!podeGerar}
            className={cx(
              "relative flex h-[58px] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl text-[16px] font-semibold text-white transition active:scale-[0.98]",
              podeGerar || gerando
                ? "bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-xl shadow-indigo-600/30"
                : "bg-slate-300 shadow-none",
            )}
          >
            {gerando ? (
              <>
                <span className="absolute inset-0 animate-pulse bg-white/10" />
                <span className="flex gap-1" aria-hidden="true">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-white" />
                </span>
                Escrevendo parecer pedagógico...
              </>
            ) : (
              <>
                <Sparkles size={20} /> Gerar Parecer Individualizado
              </>
            )}
          </button>
          <p className="h-5 pt-1 text-center text-[12px] text-slate-500">
            {!gerando && faltando.length > 0 && <>Falta: {faltando.join(", ")}</>}
          </p>
        </div>
      </div>

      <TurmaSheet
        aberto={turmaAberta}
        onFechar={() => setTurmaAberta(false)}
        turma={turma}
        onRemover={remover}
        onLimpar={limpar}
        avisar={avisar}
      />

      {aviso && (
        <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+76px)] z-[60] flex justify-center px-4">
          <div role="status" className="animate-aparece rounded-full bg-slate-900 px-4 py-2.5 text-[13.5px] font-medium text-white shadow-xl">
            {aviso}
          </div>
        </div>
      )}
    </div>
  );
}
