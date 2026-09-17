"use client";

import { useEffect, useRef, useState } from "react";
import { useBuilder } from "./BuilderContext";
import { useLeadDraft } from "@/features/lead/state/LeadContext";
import { clearBuilderSession, loadBuilderSession, saveBuilderSession } from "@/lib/persistence/builderSession";
import { getOrCreateAnalyticsSession, resetAnalyticsSession } from "@/lib/analytics/session";
import { trackFunnelMilestone } from "@/lib/analytics/trackEvent";

/**
 * A partir da Fase 17, o `sessionId` do Builder não é mais gerado por conta própria — vem de
 * `lib/analytics/session.ts` (`getOrCreateAnalyticsSession`), o dono canônico do id agora que
 * `page_view` precisa existir mesmo fora do Builder (Home, `/projetos`). O formato/TTL do id em si
 * não muda para quem já tinha uma sessão salva antes desta fase (mesmo `crypto.randomUUID()`); só
 * a ORIGEM do id passou a ser compartilhada, para satisfazer o pedido explícito do briefing da
 * Fase 17: "Utilizar o session_id da Etapa 14... todos os eventos do mesmo fluxo devem
 * compartilhar o mesmo session_id" (`docs/DECISIONS.md`, Fase 17).
 */
function currentLocation() {
  return { searchParams: new URLSearchParams(window.location.search), pathname: window.location.pathname };
}

/**
 * Pequeno atraso antes de gravar no `localStorage` por causa do `leadDraft` (o único campo
 * "digitado" que este hook observa) — evita uma escrita a cada tecla. Aplicado só a ele: mudanças
 * do Builder (clique em algo — responder, salvar, cancelar, remover) gravam IMEDIATAMENTE, sem
 * esperar esse atraso.
 *
 * Descoberto durante o teste manual desta fase (Teste C): com um único debounce cobrindo os dois
 * casos, um refresh disparado poucos instantes depois de uma ação discreta (ex.: "Cancelar
 * edição") podia perder exatamente essa última mudança, porque a gravação ainda não tinha
 * acontecido — o próprio cenário que "Cancelar edição" deveria ter resolvido continuava
 * restaurado como estava ANTES do cancelamento. Ver `docs/SESSION-PERSISTENCE.md`, Seção
 * "Auto-save", para os detalhes.
 */
const LEAD_DRAFT_SAVE_DEBOUNCE_MS = 300;

/** "Seu progresso foi recuperado." some sozinho depois de alguns segundos — mensagem discreta, não
 * uma confirmação que o usuário precisa dispensar manualmente. */
const RESTORED_BANNER_MS = 4000;

/**
 * Orquestra a persistência de sessão do Builder (Fase 14): hidrata na montagem (uma vez, só no
 * cliente, para nunca gerar hydration mismatch de SSR — `docs/TECHNICAL-ARCHITECTURE.md`, Seção
 * 23), e depois salva automaticamente sempre que o estado relevante mudar. Chamado uma única vez,
 * em `BuilderShell` (que já está dentro de `BuilderProvider` + `LeadProvider`).
 *
 * Não é um Context — é só um hook, porque nada além de `BuilderShell` precisa das flags de
 * hidratação; `resetSession` (a única função que outros componentes realmente chamam) é passada
 * como prop para quem precisa (`BuilderNavigation`, `SubmissionSuccess`), evitando um terceiro
 * Provider só para isso.
 */
export function useBuilderSessionPersistence() {
  const { state, hydrateSession, resetBuilder } = useBuilder();
  const { leadDraft, updateLeadDraft, resetLeadDraft } = useLeadDraft();

  const [isHydrating, setIsHydrating] = useState(true);
  const [justRestored, setJustRestored] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const hasHydratedRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Sempre o `state` mais atual, para o `setTimeout` do efeito debounced (abaixo) nunca gravar uma
  // versão obsoleta — um `useEffect([sessionId, leadDraft])` sozinho fecha sobre o `state` de
  // quando o timer foi agendado, não o de quando ele dispara; se `leadDraft` não mudar de novo
  // nesse intervalo, o timer dispara com o `state` antigo e sobrescreve gravações mais recentes do
  // efeito do Builder. Descoberto no teste manual desta fase (Teste A: um clique no Builder logo
  // depois de montar a página perdia sozinho a resposta, porque o timer do leadDraft, agendado no
  // instante da hidratação, disparava 300ms depois com o estado ainda vazio daquele momento).
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Hidratação — roda uma única vez, depois do primeiro render no cliente. `localStorage` é um
  // sistema externo ao React (exatamente o caso de uso que `useEffect` existe para sincronizar,
  // não o anti-padrão de "estado derivado de props" que a regra `set-state-in-effect` normalmente
  // pega) — e só pode ser lido depois da montagem, nunca durante o render, para nunca produzir um
  // hydration mismatch de SSR (docs/TECHNICAL-ARCHITECTURE.md, Seção 23). Por isso o disable
  // abaixo é uma exceção justificada, não uma supressão genérica.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const analyticsSession = getOrCreateAnalyticsSession(currentLocation().searchParams, currentLocation().pathname);
    // `builder_started` (Fase 17): "não disparar só porque /builder carregou, se ainda houver uma
    // intro separada" — este app não tem uma (`ServiceSelector` já é a primeira tela real), então
    // chegar aqui hidratado É o início de verdade. `trackFunnelMilestone` garante que só conta uma
    // vez por sessão, mesmo com múltiplos refreshes dentro do mesmo fluxo.
    trackFunnelMilestone("builder_started", {});

    const result = loadBuilderSession();
    if (result.status === "ok") {
      setSessionId(analyticsSession.sessionId);
      hydrateSession(result.session.builder);
      updateLeadDraft(result.session.leadDraft);
      setJustRestored(true);
      const bannerTimeout = setTimeout(() => setJustRestored(false), RESTORED_BANNER_MS);
      hasHydratedRef.current = true;
      setIsHydrating(false);
      return () => clearTimeout(bannerTimeout);
    }

    setSessionId(analyticsSession.sessionId);
    hasHydratedRef.current = true;
    setIsHydrating(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- roda só na montagem, de propósito.
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Auto-save do Builder — imediato, sempre que `state` mudar (uma ação de cada vez, nunca
  // "digitação"; perder a janela de um debounce aqui é o que causava o bug descrito acima).
  useEffect(() => {
    if (!hasHydratedRef.current || !sessionId) return;
    saveBuilderSession({ sessionId, builder: state, leadDraft });
    // `leadDraft` é lido no valor mais atual por fechamento (closure); não deve disparar ESTE
    // efeito de novo por conta própria — ele tem o próprio efeito debounced logo abaixo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, state]);

  // Auto-save do leadDraft — com um pequeno debounce (ver constante acima), porque este SIM muda a
  // cada tecla digitada no formulário de contato.
  useEffect(() => {
    if (!hasHydratedRef.current || !sessionId) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveBuilderSession({ sessionId, builder: stateRef.current, leadDraft });
    }, LEAD_DRAFT_SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [sessionId, leadDraft]);

  /**
   * "Começar de novo" (Fase 14) — limpa tudo: storage, Builder e leadDraft, e começa uma sessão
   * nova (novo `sessionId`, já que é uma jornada anônima diferente).
   */
  function resetSession() {
    clearBuilderSession();
    resetBuilder();
    resetLeadDraft();
    const { searchParams, pathname } = currentLocation();
    setSessionId(resetAnalyticsSession(searchParams, pathname).sessionId);
  }

  return { isHydrating, justRestored, resetSession };
}
