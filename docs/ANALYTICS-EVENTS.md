# ANALYTICS EVENTS — Referência de Eventos

> Fase 17 do roadmap. Tabela de referência de cada evento implementado. Definição formal (nomes,
> propriedades, validação) em `lib/analytics/events.ts`; contexto e princípios em
> `docs/ANALYTICS.md`.

| Evento | Momento | Propriedades | Finalidade | Provider(s) | Consentimento | Conversão? |
|---|---|---|---|---|---|---|
| `page_view` | Uma página relevante é visualizada (carregamento inicial e cada mudança de rota) | `path` | Medir visitas/origem de entrada | GA4, Interno | `analytics` | Não |
| `builder_started` | Builder hidratado e pronto pela primeira vez nesta sessão | — | Marco 1 do funil | GA4, Interno | `analytics` | Não |
| `service_selected` | Uma configuração NOVA de serviço começa (não reabrir um já configurado) | `serviceId` | Qual serviço é mais escolhido | GA4, Interno | `analytics` | Não |
| `service_completed` | Um serviço NOVO é confirmado (auto-save ao final do mini-fluxo) | `serviceId`, `questionCount` | Taxa de conclusão por serviço | GA4, Interno | `analytics` | Não |
| `service_edited` | Uma edição de serviço já confirmado é salva | `serviceId` | Distinguir edição de conclusão nova | GA4, Interno | `analytics` | Não |
| `service_removed` | Um serviço confirmado é removido | `serviceId` | Entender remoções/indecisão | GA4, Interno | `analytics` | Não |
| `upgrade_reviewed` | Chegada ao Resumo do Projeto (uma vez por sessão) | `serviceCount`, `serviceIds` | Marco do funil (chegada à revisão) | GA4, Interno | `analytics` | Não |
| `contact_started` | Entrada na etapa de contato (uma vez por sessão) | — | Marco do funil (início do contato) | GA4, Interno | `analytics` | Não |
| `lead_submit_attempted` | Clique em "Enviar meu projeto" (toda tentativa, inclusive retry) | — | Medir tentativas x sucessos | GA4, Interno | `analytics` | Não |
| `lead_submitted` | Persistência do lead confirmada com sucesso (uma vez por sessão) | `serviceCount`, `idempotencyKey` | Conversão principal | GA4, Meta Pixel (`Lead`), Interno | `analytics` (+ `marketing` para o Meta Pixel) | **Sim** |
| `lead_submit_failed` | Envio falha (validação ou persistência) | `errorCategory` (`validation`\|`persistence`\|`unknown`) | Diagnosticar falhas do funil | GA4, Interno | `analytics` | Não |
| `whatsapp_clicked` | Preparado — sem ponto de disparo real ainda (ver `docs/ANALYTICS.md`, Seção 4) | — | Reservado para um futuro CTA público de WhatsApp | GA4, Interno | `analytics` | Não |

## Notas de leitura

- **Provider(s)**: todos os eventos vão para GA4 e para o provider Interno quando `analytics` está
  habilitado; só `lead_submitted` também vai para o Meta Pixel (mapeado para o evento padrão
  `Lead`), e só quando `marketing` está habilitado.
- **"Uma vez por sessão"** (`builder_started`, `upgrade_reviewed`, `contact_started`,
  `lead_submitted`): disparado via `trackFunnelMilestone` (não `trackEvent`) — um refresh ou uma
  remontagem do componente não conta uma segunda vez para a mesma sessão. Os demais eventos podem
  se repetir livremente (ex.: `service_selected` uma vez por serviço escolhido).
- **Nenhuma propriedade contém dado pessoal** — só IDs de serviço (`site`/`trafego`/`design`),
  contagens, categorias fixas, e o `idempotencyKey` (um UUID técnico, não um dado da pessoa).
- Eventos avaliados e **não implementados nesta fase** (`question_answered`, um `service_started`
  separado): ver `docs/ANALYTICS.md`, Seção 4, e `docs/DECISIONS.md`, Fase 17.
