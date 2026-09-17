# PRIVACY DATA MAP — Inventário de Dados

> Fase LGPD. Inventário REAL — só o que o sistema efetivamente coleta hoje, verificado lendo o
> código (schemas, migrations, repositórios), nunca uma lista genérica de "o que um site
> normalmente coletaria". Ver `docs/PRIVACY-LGPD.md` para o racional completo por trás de cada
> classificação/base legal, e `docs/ANALYTICS.md`/`docs/ANALYTICS-EVENTS.md`/
> `docs/SESSION-PERSISTENCE.md`/`docs/ADMIN-CRM.md` para a documentação técnica original de cada
> sistema de origem.
>
> Formato por dado: **Dado → Finalidade → Local de armazenamento → Base legal → Retenção →
> Compartilhamento**.

## 1. Dados de contato (Lead)

Coletados uma única vez, no formulário final do Builder (`features/lead/components/LeadForm.tsx`),
gravados em `upgrade_leads` (Supabase) via `submitLead` → `createLead`.

| Dado | Finalidade | Armazenamento | Base legal | Retenção | Compartilhamento |
| --- | --- | --- | --- | --- | --- |
| Nome | Personalizar o contato comercial | `upgrade_leads.name` (Supabase) | Execução de procedimentos preliminares a contrato | Ver Seção "Retenção" de `docs/PRIVACY-LGPD.md` | Supabase (armazenamento); equipe interna da Upgrade |
| Empresa | Contexto comercial do projeto | `upgrade_leads.company` | Execução de procedimentos preliminares a contrato | Idem | Supabase; equipe interna |
| WhatsApp | Contato comercial direto | `upgrade_leads.whatsapp` (normalizado, `55DDNNNNNNNNN`) | Execução de procedimentos preliminares a contrato | Idem | Supabase; equipe interna; WhatsApp/Meta no momento em que um admin abre uma conversa (`buildWhatsAppLink.ts`) |
| E-mail | Contato/retorno comercial | `upgrade_leads.email` | Execução de procedimentos preliminares a contrato | Idem | Supabase; equipe interna |
| Site/Instagram (opcional) | Contexto adicional do negócio do lead | `upgrade_leads.website_or_instagram` (nulo se não informado) | Execução de procedimentos preliminares a contrato | Idem | Supabase; equipe interna |

## 2. Dados do projeto

| Dado | Finalidade | Armazenamento | Base legal | Retenção | Compartilhamento |
| --- | --- | --- | --- | --- | --- |
| Serviços selecionados | Saber o que o lead quer contratar | `upgrade_leads.project` (JSONB) | Execução de procedimentos preliminares a contrato | Igual ao registro do lead | Supabase; equipe interna |
| Respostas das perguntas do Builder | Preparar proposta compatível | `upgrade_leads.project.services[].answers` | Execução de procedimentos preliminares a contrato | Igual ao registro do lead | Supabase; equipe interna |

Nenhuma resposta de pergunta do Builder pede dado sensível (saúde, religião, biometria, opinião
política) — as perguntas cobrem só orçamento, prazo, tipo de site, experiência prévia com tráfego
pago, etc. (`features/builder/data/*.ts`).

## 3. Dado comercial interno (calculado, nunca enviado ao navegador)

| Dado | Finalidade | Armazenamento | Base legal | Retenção | Compartilhamento |
| --- | --- | --- | --- | --- | --- |
| Lead Score (`score`/`tier`/`breakdown`) | Priorização comercial interna (ver `docs/LEAD-SCORE.md`) | `upgrade_leads.lead_score*` | Legítimo interesse (gestão comercial interna) | Igual ao registro do lead | Nunca compartilhado — nem com o próprio lead, nem com terceiros |

Calculado só a partir de `project` (nunca de `contact`) — `calculateLeadScore.ts` não recebe nome/
e-mail/telefone como entrada. Não é uma decisão automatizada com efeito jurídico (ver
`docs/PRIVACY-LGPD.md`, Seção "Decisões automatizadas").

## 4. Dados técnicos de sessão (armazenamento local do navegador, não vão ao servidor sozinhos)

| Dado | Finalidade | Armazenamento | Base legal | Retenção | Compartilhamento |
| --- | --- | --- | --- | --- | --- |
| `session_id` (pseudônimo, gerado no navegador) | Lembrar progresso no Builder; agrupar eventos de analytics da mesma visita | `localStorage` (`upgrade-builder:v1`, `upgrade-analytics:session:v1`) + coluna `analytics_events.session_id` quando enviado | Legítimo interesse/necessidade funcional (Builder); consentimento (envio a analytics) | 7 dias de inatividade (expira sozinho) | Supabase (só se um evento de analytics for enviado, e só com consentimento de analytics) |
| Estado do Builder (serviço ativo, respostas em rascunho, serviços confirmados) | Recuperar progresso ao voltar/atualizar a página | `localStorage` (`upgrade-builder:v1`) | Legítimo interesse/necessidade funcional | 7 dias de inatividade | Nunca sai do navegador |
| Rascunho dos campos de contato (nome/empresa/WhatsApp/e-mail digitados, ainda não enviados) | Não perder o que a pessoa já digitou | `localStorage` (`upgrade-builder:v1`) | Legítimo interesse/necessidade funcional | 7 dias de inatividade | Nunca sai do navegador |
| Origem da visita (UTM, host do referrer, página de entrada) | Atribuição de marketing agregada | `localStorage` (`upgrade-analytics:session:v1`) | Consentimento (só é enviado ao servidor dentro de um evento de analytics) | 7 dias de inatividade no navegador | Supabase/GA4, só com consentimento de analytics |
| Marcos de funil já disparados nesta sessão | Evitar contar o mesmo evento duas vezes num refresh | `localStorage` (`upgrade-analytics:session:v1`) | Consentimento | 7 dias de inatividade | Nunca sai do navegador (é só uma lista de nomes de evento) |
| Preferência de consentimento (`analytics`/`marketing`) | Lembrar sua escolha de privacidade | `localStorage` (`upgrade-privacy-consent:v1`) | Não aplicável (é o próprio registro da decisão) | Até você mudar de ideia ou a política mudar de versão | Nunca sai do navegador |

## 5. Eventos de analytics (só com consentimento de analytics)

| Dado | Finalidade | Armazenamento | Base legal | Retenção | Compartilhamento |
| --- | --- | --- | --- | --- | --- |
| Nome do evento + propriedades (`serviceId`, `questionCount`, `path`, etc. — nunca nome/e-mail/telefone/texto livre, ver `lib/analytics/events.ts`) | Medir uso do funil (Builder → contato → envio) | `analytics_events` (Supabase); Google Analytics (se `NEXT_PUBLIC_GA4_MEASUREMENT_ID` configurada) | Consentimento | Ver `docs/PRIVACY-LGPD.md`, Seção "Retenção" | Google (GA4), se configurado e consentido |
| Evento `Lead` (conversão) | Medir eficácia de campanhas de anúncio | Meta (Pixel), se `NEXT_PUBLIC_META_PIXEL_ID` configurada | Consentimento (marketing) | Conforme política do Meta | Meta, se configurado e consentido |

## 6. Dados administrativos (uso interno da equipe, nunca sobre o próprio lead como titular externo)

| Dado | Finalidade | Armazenamento | Base legal | Retenção | Compartilhamento |
| --- | --- | --- | --- | --- | --- |
| Notas internas sobre um lead | Registro de atendimento comercial | `upgrade_lead_notes` (Supabase) | Legítimo interesse (gestão comercial) | Igual ao registro do lead | Nunca exposto ao próprio lead; só admins autenticados |
| Status do lead + histórico | Acompanhar o funil comercial | `upgrade_leads.status`, `upgrade_lead_status_history` | Legítimo interesse (gestão comercial) | Igual ao registro do lead | Só admins autenticados |
| Conta de administrador (e-mail de login) | Autenticação do time interno | Supabase Auth + `admin_users` | Obrigação/necessidade contratual (relação de trabalho) | Enquanto a pessoa for admin | Supabase (Auth) |

## 7. O que NÃO é coletado (confirmado por auditoria de código, não por suposição)

- IP, geolocalização, dados de dispositivo além do necessário para renderizar a página.
- Fingerprinting de qualquer tipo (proibido pelo briefing desta fase; nenhuma técnica desse tipo
  existe no código).
- Dados sensíveis (saúde, religião, orientação sexual, biometria, opinião política).
- CPF, RG, dados bancários/financeiros.
- Nome/e-mail/telefone em qualquer propriedade de evento de analytics (garantido pelos schemas
  `EVENT_PROPERTIES_SCHEMAS`, `lib/analytics/events.ts` — um evento com um campo a mais é
  rejeitado, nunca gravado "do jeito que veio").
- Payload completo do lead em nenhuma ferramenta de log de erro externa (nenhuma ferramenta desse
  tipo — Sentry, Bugsnag, etc. — está integrada ao projeto).
