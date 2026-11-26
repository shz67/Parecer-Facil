"use client";

import { useCallback, useEffect, useState } from "react";
import type { ParecerSalvo } from "./dados";

const CHAVE = "parecer-facil:turma:v1";

function ler(): ParecerSalvo[] {
  try {
    const bruto = localStorage.getItem(CHAVE);
    const lista = bruto ? (JSON.parse(bruto) as ParecerSalvo[]) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

function gravar(lista: ParecerSalvo[]) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista));
  } catch {
    /* armazenamento cheio ou bloqueado: mantém em memória */
  }
}

export function useTurma() {
  const [turma, setTurma] = useState<ParecerSalvo[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    setTurma(ler());
    setCarregado(true);
    const sincronizar = (e: StorageEvent) => e.key === CHAVE && setTurma(ler());
    window.addEventListener("storage", sincronizar);
    return () => window.removeEventListener("storage", sincronizar);
  }, []);

  const atualizar = useCallback((fn: (l: ParecerSalvo[]) => ParecerSalvo[]) => {
    setTurma((atual) => {
      const nova = fn(atual);
      gravar(nova);
      return nova;
    });
  }, []);

  const adicionar = useCallback(
    (p: Omit<ParecerSalvo, "id" | "criadoEm">) =>
      atualizar((l) => [...l, { ...p, id: crypto.randomUUID?.() ?? String(Date.now()), criadoEm: Date.now() }]),
    [atualizar],
  );
  const remover = useCallback((id: string) => atualizar((l) => l.filter((p) => p.id !== id)), [atualizar]);
  const limpar = useCallback(() => atualizar(() => []), [atualizar]);

  return { turma, carregado, adicionar, remover, limpar };
}
