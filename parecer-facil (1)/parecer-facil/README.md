# Parecer Fácil

Pareceres descritivos individualizados, alinhados à BNCC, em segundos. Web app mobile-first instalável no celular (PWA).

## Rodar no computador

Precisa do Node.js 20 ou mais novo (nodejs.org).

```bash
npm install
cp .env.example .env.local      # no Windows: copy .env.example .env.local
```

Abra `.env.local` e cole sua chave do Google AI Studio (https://aistudio.google.com/apikey):

```
GEMINI_API_KEY=sua-chave-aqui
```

Depois:

```bash
npm run dev
```

Acesse http://localhost:3000. Para testar no celular na mesma rede Wi-Fi, use o IP do computador (ex.: http://192.168.0.10:3000).

## Produção

```bash
npm run build
npm start
```

Para publicar (Vercel, por exemplo), configure a variável `GEMINI_API_KEY` no painel do provedor. Não suba o `.env.local`.

## Instalar como app no celular

A instalação exige HTTPS (o site publicado, não o localhost pelo IP).

- **Android (Chrome):** menu ⋮ → "Instalar app" ou "Adicionar à tela inicial".
- **iPhone (Safari):** botão Compartilhar → "Adicionar à Tela de Início".

O app abre em tela cheia, sem barra do navegador.

## Configuração

| Variável | Obrigatória | Padrão |
|---|---|---|
| `GEMINI_API_KEY` | sim | — |
| `GEMINI_MODEL` | não | `gemini-3.5-flash-lite` |

## Onde mexer

- `src/lib/dados.ts` — etapas, períodos e características de cada eixo.
- `src/lib/prompt.ts` — instruções pedagógicas enviadas à IA.
- `src/app/api/gerar/route.ts` — chamada à IA e mensagens de erro.
- `src/components/` — telas (formulário, resultado, gaveta da turma).
- `public/manifest.json` e `public/icon*.svg/png` — instalação como app.

## Privacidade

- Só o primeiro nome do aluno é enviado à IA (o servidor descarta sobrenomes).
- O histórico da turma fica só no navegador do aparelho (localStorage). Limpar os dados do navegador apaga a turma.
"# Parecer-Facil" 
