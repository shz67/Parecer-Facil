export type Genero = "menino" | "menina";
export type Tom = "acolhedor" | "tecnico";
export type Tamanho = "curto" | "completo";

export interface Etapa {
  id: string;
  label: string;
  curto: string;
  infantil: boolean;
}

export const ETAPAS: Etapa[] = [
  { id: "bercario", label: "Berçário / Maternal (0 a 3 anos)", curto: "Berçário / Maternal", infantil: true },
  { id: "pre", label: "Pré-escola (4 a 5 anos)", curto: "Pré-escola", infantil: true },
  { id: "alfabetizacao", label: "1º ao 2º Ano (Ciclo de Alfabetização)", curto: "1º ao 2º Ano", infantil: false },
  { id: "fundamental", label: "3º ao 5º Ano (Ensino Fundamental I)", curto: "3º ao 5º Ano", infantil: false },
];

export const PERIODOS = [
  "1º Bimestre",
  "2º Bimestre",
  "3º Bimestre",
  "4º Bimestre",
  "1º Semestre",
  "2º Semestre",
  "Diagnóstico Inicial",
] as const;

export interface Eixo {
  id: "convivencia" | "linguagem" | "corpo";
  numero: number;
  titulo: string;
  subtitulo: string;
  itens: string[];
}

export const EIXOS: Eixo[] = [
  {
    id: "convivencia",
    numero: 1,
    titulo: "Convivência e Autonomia",
    subtitulo: "O Eu, o Outro e o Nós",
    itens: [
      "Ótima interação com colegas",
      "Participativo(a) nas rodas de conversa",
      "Respeita combinados e regras",
      "Demonstra autonomia na rotina",
      "Prestativo(a) e empático(a)",
      "Tímido(a) / perfil observador",
      "Em processo de adaptação",
      "Conflitos na divisão de brinquedos",
      "Necessita mediação nas relações",
    ],
  },
  {
    id: "linguagem",
    numero: 2,
    titulo: "Linguagem, Leitura e Pensamento",
    subtitulo: "Oralidade, escrita e raciocínio",
    itens: [
      "Expressão oral clara e articulada",
      "Interesse por histórias e livros",
      "Reconhece letras e sons",
      "Em fase de alfabetização",
      "Lê e interpreta pequenos textos",
      "Bom raciocínio lógico-matemático",
      "Curioso(a) e questionador(a)",
      "Dificuldade de manter o foco",
      "Necessita apoio na escrita/leitura",
    ],
  },
  {
    id: "corpo",
    numero: 3,
    titulo: "Corpo, Movimento e Expressão",
    subtitulo: "Motricidade e linguagens artísticas",
    itens: [
      "Boa coordenação motora fina (lápis/tesoura)",
      "Boa coordenação motora ampla",
      "Coordenação motora em desenvolvimento",
      "Interesse por artes, pintura e música",
      "Participa ativamente das brincadeiras",
    ],
  },
];

export const TODOS_ITENS = new Set(EIXOS.flatMap((e) => e.itens));

/** "Curioso(a)" -> "Curioso" / "Curiosa"; "questionador(a)" -> "questionador" / "questionadora". */
export function flexionar(texto: string, genero: Genero | null): string {
  if (!genero) return texto;
  return texto.replace(/([\p{L}]+)\(a\)/gu, (_, palavra: string) => {
    if (genero === "menino") return palavra;
    return palavra.endsWith("o") ? palavra.slice(0, -1) + "a" : palavra + "a";
  });
}

export type Selecao = Record<Eixo["id"], string[]>;

export const SELECAO_VAZIA: Selecao = { convivencia: [], linguagem: [], corpo: [] };

export interface ParecerSalvo {
  id: string;
  nome: string;
  genero: Genero;
  etapa: string;
  periodo: string;
  texto: string;
  criadoEm: number;
}

export interface PedidoParecer {
  nome: string;
  genero: Genero;
  etapa: string;
  periodo: string;
  selecao: Selecao;
  observacao: string;
  tom: Tom;
  tamanho: Tamanho;
  variacao: number;
}
