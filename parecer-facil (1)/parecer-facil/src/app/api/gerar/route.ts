import { ApiError, GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { EIXOS, ETAPAS, PERIODOS, TODOS_ITENS, type PedidoParecer, type Selecao } from "@/lib/dados";
import { SYSTEM_PROMPT, limparTexto, montarPrompt } from "@/lib/prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODELO = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

function erro(mensagem: string, status: number) {
  return NextResponse.json({ erro: mensagem }, { status });
}

/** Valida e normaliza o corpo recebido. Devolve string com o erro quando inválido. */
function validar(corpo: unknown): PedidoParecer | string {
  if (!corpo || typeof corpo !== "object") return "Dados do formulário inválidos.";
  const b = corpo as Record<string, unknown>;

  // LGPD: guarda apenas o primeiro nome
  const nome = String(b.nome ?? "").trim().split(/\s+/)[0]?.replace(/[^\p{L}'-]/gu, "").slice(0, 30) ?? "";
  if (!nome) return "Informe o primeiro nome do aluno.";

  if (b.genero !== "menino" && b.genero !== "menina") return "Selecione Menino ou Menina.";
  if (!ETAPAS.some((e) => e.id === b.etapa)) return "Selecione a etapa de ensino.";
  if (!PERIODOS.includes(b.periodo as (typeof PERIODOS)[number])) return "Selecione o período.";

  const selecaoBruta = (b.selecao ?? {}) as Record<string, unknown>;
  const selecao = {} as Selecao;
  for (const eixo of EIXOS) {
    const lista = Array.isArray(selecaoBruta[eixo.id]) ? (selecaoBruta[eixo.id] as unknown[]) : [];
    selecao[eixo.id] = lista.filter((i): i is string => typeof i === "string" && TODOS_ITENS.has(i) && eixo.itens.includes(i));
  }
  if (!EIXOS.some((e) => selecao[e.id].length)) return "Marque ao menos uma característica nos eixos.";

  const variacao = Number(b.variacao);
  return {
    nome: nome.charAt(0).toUpperCase() + nome.slice(1),
    genero: b.genero,
    etapa: b.etapa as string,
    periodo: b.periodo as string,
    selecao,
    observacao: String(b.observacao ?? "").replace(/"""/g, '"').trim().slice(0, 600),
    tom: b.tom === "tecnico" ? "tecnico" : "acolhedor",
    tamanho: b.tamanho === "completo" ? "completo" : "curto",
    variacao: Number.isInteger(variacao) && variacao >= 1 && variacao <= 5 ? variacao : 1 + Math.floor(Math.random() * 5),
  };
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return erro(
      "A chave da IA não está configurada. Adicione GEMINI_API_KEY no arquivo .env.local e reinicie o servidor.",
      500,
    );
  }

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return erro("Não foi possível ler os dados enviados.", 400);
  }

  const pedido = validar(corpo);
  if (typeof pedido === "string") return erro(pedido, 400);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const chamar = () =>
      ai.models.generateContent({
        model: MODELO,
        contents: montarPrompt(pedido),
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.95,
          topP: 0.95,
          maxOutputTokens: 1200,
        },
      });

    // Instabilidade momentânea do serviço (500/503): tenta de novo até 2 vezes antes de avisar
    let resposta;
    for (let tentativa = 0; ; tentativa++) {
      try {
        resposta = await chamar();
        break;
      } catch (e) {
        const st = e instanceof ApiError ? e.status : 0;
        if ((st === 503 || st === 500) && tentativa < 2) {
          await new Promise((r) => setTimeout(r, 800 * (tentativa + 1)));
          continue;
        }
        throw e;
      }
    }

    const texto = limparTexto(resposta.text ?? "");
    if (!texto) {
      return erro("A IA não devolveu texto desta vez. Toque em gerar novamente.", 502);
    }
    return NextResponse.json({ texto, variacao: pedido.variacao });
  } catch (e) {
    const status = e instanceof ApiError ? e.status : 0;
    const msg = e instanceof Error ? e.message : "";
    console.error("[api/gerar]", status, msg);

    if (status === 429 || /RESOURCE_EXHAUSTED|quota|rate/i.test(msg)) {
      return erro("Muitos pedidos seguidos, aguarde 10 segundos e tente novamente.", 429);
    }
    if (status === 401 || status === 403 || /API key not valid|API_KEY_INVALID|PERMISSION_DENIED/i.test(msg)) {
      return erro("A chave da IA é inválida ou não tem permissão. Confira GEMINI_API_KEY no .env.local.", 500);
    }
    if (status === 404 || /not found|is not supported/i.test(msg)) {
      return erro(`O modelo "${MODELO}" não está disponível para esta chave. Ajuste GEMINI_MODEL no .env.local.`, 500);
    }
    if (status === 503 || status === 500 || /overloaded|UNAVAILABLE/i.test(msg)) {
      return erro("O serviço de IA está sobrecarregado agora. Tente de novo em alguns instantes.", 503);
    }
    if (/fetch failed|ENOTFOUND|ECONNRESET|ETIMEDOUT/i.test(msg)) {
      return erro("Sem conexão com o serviço de IA. Verifique a internet do servidor.", 502);
    }
    return erro("Não foi possível gerar o parecer agora. Tente novamente.", 500);
  }
}
