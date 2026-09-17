import { trackEvent } from "./trackEvent";

/**
 * TESTE 20 (obrigatório) — "eventos inválidos devem ser impossíveis ou detectáveis pelo
 * TypeScript". Este arquivo nunca é importado por nenhum outro módulo (não faz parte do runtime) —
 * ele só existe para o `tsc --noEmit` (`npm run typecheck`) verificar as linhas `@ts-expect-error`
 * abaixo. Se qualquer uma delas parar de ser um erro de tipo de verdade, o typecheck FALHA (um
 * `@ts-expect-error` num trecho que compila sem erro é, ele próprio, um erro do TypeScript) — é
 * assim que este arquivo prova, na verificação obrigatória de cada etapa, que o contrato de
 * eventos continua rejeitando chamadas inválidas.
 */

// @ts-expect-error — nome de evento que não existe no AnalyticsEventMap.
trackEvent("evento_que_nao_existe", {});

// @ts-expect-error — `service_selected` exige `serviceId`, não `service_id`.
trackEvent("service_selected", { service_id: "site" });

// @ts-expect-error — `serviceId` precisa ser um ServiceId conhecido, não qualquer string.
trackEvent("service_selected", { serviceId: "video_institucional" });

// @ts-expect-error — `page_view` exige `path`; não pode ser chamado sem propriedades.
trackEvent("page_view", {});

// Chamada válida — não deve gerar nenhum erro de tipo (prova negativa: o contrato não é
// excessivamente restritivo a ponto de rejeitar o uso correto).
trackEvent("service_selected", { serviceId: "site" });
trackEvent("builder_started", {});
