# PRIVACY / LGPD

> **Esta implementação técnica não substitui revisão jurídica profissional.** Este documento e o
> código desta fase aplicam princípios de LGPD (transparência, minimização, finalidade, base
> legal, direitos do titular) da forma mais correta possível a partir da leitura do próprio
> código-fonte do projeto — não é, e não substitui, um parecer jurídico. Antes de operar
> comercialmente, um advogado ou DPO deve revisar este documento e a Política de Privacidade
> publicada (`/privacidade`), especialmente as Seções 5 ("Base legal"), 9 ("Retenção") e 11
> ("Controlador") abaixo, que dependem de decisões de negócio que só a Upgrade pode confirmar.

Ver `docs/PRIVACY-DATA-MAP.md` para o inventário completo dado a dado. Ver
`docs/IMPLEMENTATION-STAGE-28.md` para o resumo técnico desta fase (mudanças, testes, pendências).

## 1. Princípio geral desta fase

Transparência + minimização + controle + documentação (briefing, "Objetivo geral") — nunca:
banner genérico sem necessidade, coleta excessiva, "consentimento para tudo", texto jurídico
incompreensível, dark patterns ou checkbox pré-marcado. Nenhum desses cinco itens existe na
implementação (verificado nos testes automatizados desta fase, Seção 12 abaixo).

## 2. Auditoria realizada antes de qualquer mudança

Revisados: `features/lead/*` (schema de formulário e de payload), `lib/repositories/*.ts`
(gravação real no Supabase), `lib/analytics/*` (eventos, sessão, consentimento — já existente
desde a Fase 17), `features/admin/*` (RLS, grants, WhatsApp/mailto), `supabase/migrations/*.sql`
(policies reais), e uma busca no código inteiro por IP/geolocalização/fingerprinting/ferramentas
de log de erro externas (nenhuma encontrada). O inventário em `docs/PRIVACY-DATA-MAP.md` reflete
só o que essa auditoria confirmou existir — nenhum dado foi assumido "porque sites normalmente
coletam isso".

## 3. Minimização — o que foi avaliado e removido/reduzido

Nenhum campo de coleta foi removido nesta fase — a auditoria confirmou que o formulário de lead já
era mínimo desde a Fase 10/12 (5 campos: nome, empresa, WhatsApp, e-mail, site/Instagram opcional;
nenhum campo de orçamento livre, CPF, endereço ou dado sensível jamais existiu). O que foi
endurecido:

- **Logs de erro do servidor** (`lib/repositories/leads.ts`, `leadNotes.ts`) — os dois pontos que
  gravam dados pessoais (`createLead`, `addLeadNote`) logavam o objeto de erro do Postgres
  inteiro em caso de falha; `details`/`hint` do Postgres podem, em alguns tipos de erro, ecoar um
  fragmento do valor que causou o problema. Reduzido para só `code`/`message` (a categoria do
  erro, nunca o dado em si).
- **Consentimento padrão** (`lib/analytics/consent.ts`) — `analytics` tinha padrão `true` desde a
  Fase 17 (decisão marcada como provisória na época). Alterado para `false` (privacy by default) —
  ver `docs/DECISIONS.md`.

## 4. Dados sensíveis

Confirmado, lendo `features/builder/data/*.ts` (todas as perguntas do Builder), que nenhuma
pergunta pede saúde, religião, orientação sexual, biometria ou opinião política. O Builder não
precisa dessas categorias para configurar um projeto de site/tráfego/design — nada foi adicionado
nem removido aqui, só confirmado.

## 5. Base legal por tipo de tratamento

Ver `docs/PRIVACY-DATA-MAP.md` para o mapeamento completo dado a dado. Resumo do racional:

- **Dados de contato e do projeto** → execução de procedimentos preliminares a contrato (art. 7º,
  V, LGPD): a pessoa mesma inicia o relacionamento comercial ao preencher e enviar o Builder — não
  é uma base de "consentimento" porque o próprio ato de enviar o formulário já é a manifestação de
  interesse comercial, e pedir um consentimento formal separado para isso seria uma camada de
  fricção artificial ("consentimento falso só para parecer LGPD", que o briefing pede para
  evitar).
- **Persistência local do Builder** (essencial) → legítimo interesse/necessidade estrita para o
  funcionamento do próprio produto — nunca passa pelo mecanismo de consentimento
  (`lib/analytics/consent.ts` não cobre isso; `docs/SESSION-PERSISTENCE.md` já documentava essa
  separação desde a Fase 14).
- **Analytics** (medição de uso) → consentimento — mudou de "legítimo interesse" (postura da Fase
  17) para consentimento explícito nesta fase, agora que existe uma tela real para coletá-lo.
- **Marketing** (Meta Pixel) → consentimento — sem mudança em relação à Fase 17 (já era
  consentimento, só sem UI real para coletá-lo).
- **Notas/status internos do admin** → legítimo interesse (gestão comercial interna).

**Nenhuma base legal foi escolhida automaticamente** — cada uma está ligada a como o dado
realmente chega ao sistema (o próprio usuário inicia o contato vs. uma medição de uso que ele não
pediu ativamente).

## 6. Formulário de lead

`features/lead/components/LeadForm.tsx` não tem (e não ganhou nesta fase) nenhum checkbox de
"aceito os termos" — a base legal do tratamento não é consentimento, então exigir um checkbox
seria exatamente o "consentimento falso" que o briefing pede para evitar (Seção 7 do briefing:
"não exigir checkbox de consentimento se a base legal adequada não for consentimento"). O link
para a Política de Privacidade já existe no footer do site (presente em toda página pública,
incluindo as que levam ao Builder) — avaliado adicionar um texto extra dentro do próprio
formulário e descartado por redundância (o link já é alcançável em qualquer tela do fluxo via
footer/header).

## 7. Marketing e opt-in separado

Não existe, hoje, nenhum envio de e-mail/WhatsApp recorrente (newsletter, campanhas) na Upgrade —
o único contato pós-envio é o comercial, individual, sobre o próprio projeto da pessoa. Por isso,
nenhum opt-in de marketing recorrente foi criado (briefing, Seção 9: "se necessário, criar opt-in
separado" — não é necessário ainda, porque a funcionalidade de marketing recorrente não existe).
Quando/se essa funcionalidade for criada no futuro, ela precisa de um opt-in PRÓPRIO, nunca
inferido do envio do lead — isso já fica registrado aqui como requisito para essa fase futura.

## 8. Consent Manager — arquitetura

Já existia desde a Fase 17 o MECANISMO (`lib/analytics/consent.ts`, dois interruptores:
`analytics`/`marketing`); esta fase adicionou a UI real e a persistência:

- `lib/privacy/consentStorage.ts` — persistência versionada em `localStorage`
  (`upgrade-privacy-consent:v1`), mesmo padrão de `lib/persistence/builderSession.ts`/
  `lib/analytics/session.ts` (SSR-safe, falha silenciosa se storage indisponível).
- `lib/privacy/privacyConfig.ts` — `PRIVACY_POLICY_VERSION`, usada para invalidar uma decisão
  salva quando a política mudar de forma significativa (briefing, Seção 21).
- `lib/analytics/consent.ts` — hidrata do storage sob demanda (nunca durante SSR), dispara
  `CONSENT_CHANGE_EVENT` a cada mudança.
- `features/privacy/state/` — `useConsent`, `useHasConsentDecision`,
  `useConsentBannerVisible`, `consentBannerVisibility.ts` (reabertura manual) — todos
  `useSyncExternalStore`, mesmo padrão de hooks reativos já usado em `useSoundEnabled`/
  `useScrolled` (Fases anteriores).
- `features/privacy/components/ConsentBanner.tsx` — a UI (Seção 9 abaixo).

Deliberadamente simples (briefing, Seção 16: "não criar sistema complexo demais") — três
categorias (essencial/analytics/marketing), um componente, sem um "consent management platform"
de terceiro.

## 9. Banner — decisões de UX

- Barra fixa no rodapé da tela, nunca um modal de tela cheia com backdrop — não bloqueia o resto
  da página (`role="region"`, não `role="dialog"`), preservando a experiência premium (briefing,
  Seção 71).
- Três ações do MESMO tamanho/prominência: "Recusar não essenciais", "Configurar", "Aceitar
  todos" — nenhum dark pattern de botão grande vs. link escondido (Seção 18).
- "Configurar" expande dois checkboxes (Analytics, Marketing) + um terceiro sempre marcado e
  desabilitado ("Essenciais") — nenhum checkbox opcional vem pré-marcado (verificado por teste
  automatizado).
- Reaberto a qualquer momento pelo link "Preferências de privacidade" no footer (presente em toda
  página pública) — mesmo componente, nunca uma segunda tela de configuração.
- Funciona em 360px (verificado com Playwright), com teclado (Tab/Enter, HTML nativo, sem
  `tabindex` customizado) e com `prefers-reduced-motion` (a entrada do banner usa a mesma regra
  CSS global de `styles/tokens.css` que já zera qualquer `animation`/`transition` no site inteiro
  desde a Fase 18 — nenhum código específico do banner precisou tratar isso).

## 10. Analytics e Marketing — verificado que a técnica já usada desde a Fase 17 satisfaz o gate de consentimento

`trackEvent()` (`lib/analytics/trackEvent.ts`) já checava `getConsent().analytics`/`.marketing`
antes de chamar cada provider — o que mudou nesta fase foi só o VALOR PADRÃO desses dois campos
(Seção 3 acima) e a existência de uma UI real para a pessoa decidir. Confirmado (teste automatizado
e manual via Playwright) que, sem uma decisão de consentimento:

- `window.gtag`/`window.fbq` nunca são definidos (os scripts do GA4/Meta Pixel nunca são
  injetados no DOM) — não é só "o evento não é enviado", o SDK inteiro nunca carrega.
- Nenhuma linha é gravada em `analytics_events` (Supabase).

## 11. Controlador

A Agência Upgrade é o controlador dos dados tratados neste site. **CNPJ e endereço registrado não
aparecem em nenhum lugar do projeto** (nunca foram informados) — não inventados aqui, seguindo a
instrução explícita do briefing (Seção 26). **Pendência de pré-lançamento**: adicionar essa
identificação formal à Política de Privacidade (`/privacidade`, seção "Quem trata os seus dados")
assim que a Upgrade fornecer os dados reais.

## 12. Encarregado / canal de solicitação

Não existe um DPO formal nomeado — nenhum cargo foi inventado (briefing, Seção 27). Decisão
tomada em conjunto com o usuário nesta fase: solicitações de titular usam o MESMO canal do
atendimento comercial (WhatsApp/e-mail já trocados durante o atendimento do Builder) — o site não
tinha, antes desta fase, nenhum canal de contato geral publicado (nem e-mail institucional), então
reaproveitar o canal comercial já existente é mais honesto do que publicar um e-mail que não
existe de verdade. Documentado na própria política (`/privacidade`, "Como exercer seus direitos").

## 13. Fluxo administrativo de atendimento a uma solicitação

1. Pedido chega pelo canal comercial (WhatsApp/e-mail) já usado no atendimento daquele lead.
2. Um admin localiza o registro em `/admin` (busca por nome/e-mail/WhatsApp já suportada pela
   Fase 16).
3. Identidade validada de forma proporcional (o pedido chega pelo MESMO canal de contato já
   registrado para aquele lead — já é uma confirmação razoável de que é a mesma pessoa).
4. Ação executada:
   - **Acesso/correção**: admin consulta/atualiza o registro em `upgrade_leads` diretamente no
     Supabase (não existe uma tela de edição de lead no admin ainda — ver Pendências).
   - **Exclusão/anonimização**: ver Seção 14.
   - **Portabilidade**: ver Seção 15.
5. Atendimento registrado como uma nota interna do lead (`upgrade_lead_notes`) — cria uma trilha
   de auditoria mínima usando a estrutura que já existe, sem precisar de uma tabela nova
   (briefing, Seção 59: "documentar a possibilidade de audit trail", não necessariamente construir
   uma).

## 14. Exclusão / anonimização

Não implementada uma função dedicada nesta fase (briefing, Seção 58 pede "preparar o conceito",
não necessariamente uma UI completa). Hoje, a exclusão de um lead específico é uma operação manual
direta no Supabase (painel do Supabase ou SQL), restrita a quem tem acesso de `service_role`/
projeto — nunca exposta a `authenticated` (confirmado nas migrations: `authenticated` só tem
`grant update (status)`, nunca `delete`, em `upgrade_leads`). **Pendência**: uma Server Action
administrativa dedicada (`deleteLead`/`anonymizeLead`), só acessível a admins autenticados,
reaproveitando o mesmo padrão de `updateLeadStatus.ts` — registrada como pendência para a Etapa 29
por não ser urgente hoje (nenhum pedido de exclusão real ainda existe) e por exigir uma decisão de
negócio (excluir de verdade vs. anonimizar mantendo métricas agregadas) que vale mais a pena
tomar com um caso real em mãos do que especular agora.

## 15. Portabilidade / exportação

Mesmo raciocínio da Seção 14 — não implementada uma UI. Hoje, exportar os dados de um titular é
uma consulta direta (`select * from upgrade_leads where id = ...`) no Supabase, cujo resultado já
é JSON-serializável (o próprio formato de `AdminLeadDetail`). **Pendência**: uma Server Action
`exportLeadData(leadId)` que devolve um JSON com tudo que a Seção 1 de
`docs/PRIVACY-DATA-MAP.md` lista para aquele lead — mesma decisão de adiar para a Etapa 29 por não
ser urgente ainda.

## 16. Retenção

Política prática (briefing, Seção 32 — "não escolher prazo arbitrário sem justificativa"):

- **Leads sem avanço comercial**: sem uma rotina automática de limpeza ainda (briefing, Seção 34:
  "não precisa criar job complexo se não for necessário agora") — mantidos indefinidamente até uma
  decisão de negócio futura definir um prazo formal (proposta inicial: 24 meses de inatividade,
  alinhado ao ciclo comercial B2B típico, mas isso é uma proposta técnica, não uma definição
  jurídica — ver aviso no topo deste documento).
- **Projetos que viram cliente**: mantidos pelo tempo da relação contratual + qualquer prazo legal
  aplicável (fiscal, cível) — fora do escopo desta fase decidir esse prazo exato.
- **Sessão local do Builder/analytics**: já tem TTL técnico de 7 dias desde a Fase 14 (nenhuma
  mudança necessária).
- **Eventos de analytics** (`analytics_events`): sem TTL automático ainda — mesma pendência da
  Seção 33 abaixo.

## 17. Configuração central de retenção

Avaliado (briefing, Seção 33) e não criada uma configuração central de retenção nesta fase — não
existe ainda nenhuma rotina de expurgo automático para justificar uma configuração dedicada (seria
"arquitetura antes da necessidade"). Quando uma rotina de limpeza for implementada (Etapa 29+),
`lib/privacy/privacyConfig.ts` é o lugar natural para os prazos virarem constantes nomeadas.

## 18. Supabase (operador/suboperador)

Banco de dados dos leads, notas, histórico de status e eventos de analytics. Acesso controlado por
Row Level Security (RLS) em toda tabela que guarda dado pessoal — confirmado lendo
`supabase/migrations/*.sql`: nenhuma tabela com dado pessoal tem uma policy pública; só
`service_role` (processos do servidor) e `authenticated` que também aparecem em `admin_users`
(policies com `exists (select ... from admin_users)`) alcançam qualquer linha. **Região do
projeto Supabase e política de backup**: não documentadas no código-fonte (são configuração do
painel do Supabase, fora deste repositório) — **pendência**: confirmar no painel e registrar aqui
antes do lançamento.

## 19. Vercel

Hospedagem e execução do site/Server Actions. Como qualquer provedor de hosting, gera registros
técnicos de acesso (logs de requisição) que podem incluir a URL completa de cada requisição —
inclusive query strings (ver Seção 27 abaixo sobre a busca do admin). Tratamento técnico do
próprio provedor, fora do controle direto do código deste projeto; documentado aqui por
transparência (briefing, Seção 36), não configurado por este repositório.

## 20. Google (GA4)

Só ativo se `NEXT_PUBLIC_GA4_MEASUREMENT_ID` estiver definida (nunca um ID inventado — já era
assim desde a Fase 17) E com consentimento de analytics. Recebe os 12 eventos do funil, nenhum com
dado pessoal (Seção 13 do briefing, já satisfeita pelo contrato de tipos de
`lib/analytics/events.ts`).

## 21. Meta (Pixel)

Só ativo se `NEXT_PUBLIC_META_PIXEL_ID` estiver definida E com consentimento de marketing. Recebe
só o evento `Lead` (conversão) — nunca o funil inteiro (Seção 15 do briefing, já satisfeita desde
a Fase 17).

## 22. Terceiros (lista real, só os efetivamente integrados)

- **Supabase** — banco de dados (Seção 18).
- **Vercel** — hospedagem (Seção 19).
- **Google (GA4)** — analytics, opcional/condicionado a configuração + consentimento (Seção 20).
- **Meta (Pixel)** — marketing, opcional/condicionado a configuração + consentimento (Seção 21).

Nenhum outro fornecedor processa dado pessoal deste projeto hoje.

## 23. Transferência internacional

Supabase e Vercel podem processar/armazenar dados fora do Brasil, dependendo da região escolhida
no painel de cada serviço (não documentada neste repositório — ver Seção 18). Google e Meta
operam infraestrutura global própria. Nenhuma localização específica é inventada aqui — a
Política de Privacidade pública usa a formulação genérica "podem processar dados fora do Brasil,
seguindo as próprias políticas de proteção de dados internacionais" até que as regiões reais dos
provedores estejam confirmadas e documentadas.

## 24. Segurança

Medidas razoáveis já implementadas em fases anteriores, reaproveitadas (nenhuma nova nesta fase):
Row Level Security no Postgres (Seção 18), autenticação de sessão para o admin
(`lib/auth/adminSession.ts`), validação em duas camadas (cliente + servidor) de todo dado que
entra no sistema (Zod), grants de coluna restritos (`authenticated` só atualiza `status`, nunca
outra coluna de `upgrade_leads`). A Política de Privacidade pública descreve isso em termos gerais
("controle de acesso por linha, administradores autenticados") sem detalhar a arquitetura de
segurança (briefing, Seção 41: "não expor detalhes internos").

## 25. Admin access

Dados pessoais (leads, notas, histórico) só acessíveis a `authenticated` que também existe em
`admin_users` — confirmado nas RLS policies (Seção 18). Nenhuma rota pública do site expõe
qualquer campo de `upgrade_leads` além do que o próprio autor do lead já vê na tela de
confirmação (que não inclui nome/e-mail/etc. de volta, só o resumo do projeto).

## 26. Logs

Ver Seção 3 (minimização de logs de erro). Nenhum log da aplicação grava nome/e-mail/telefone
fora do INSERT legítimo em `upgrade_leads` (que é o próprio propósito da tabela, não um "log").

## 27. URLs / query strings

Confirmado (Seção 45 do briefing): nenhuma rota pública do site coloca nome/e-mail/telefone em
query string. A única exceção real é o campo de busca do admin (`/admin?q=...`, Fase 16) — um
admin AUTENTICADO pode digitar um nome/e-mail/WhatsApp para filtrar a própria lista de leads, e
esse termo aparece na URL da PRÓPRIA sessão do admin (nunca em uma página pública, nunca enviado a
analytics — `page_view` usa só `pathname`, nunca a query string, `AnalyticsPageView.tsx`).
Avaliado e mantido como está: é um padrão comum e esperado em qualquer ferramenta administrativa
(Gmail, CRMs), a URL nunca é pública, e reconstruir a busca do admin para evitar isso seria
desproporcional ao risco real (briefing: "adequar de forma prática e proporcional"). Registrado
aqui por transparência, não como um problema não resolvido.

## 28. WhatsApp

`buildWhatsAppLink.ts` (Fase 16, admin) inclui só o primeiro nome do lead numa saudação curta —
nenhum dado do projeto, nenhum outro campo de contato. É uma ação MANUAL de um admin autenticado
(nunca automática), usando um canal (WhatsApp) que o próprio lead já forneceu para esse exato
propósito (contato comercial).

## 29. Decisões automatizadas / profiling

O Lead Score é priorização comercial interna, nunca visível ao próprio lead, nunca usado para
negar/conceder nada automaticamente — toda decisão comercial final (responder, propor, fechar) é
tomada por uma pessoa da equipe. Não há, no projeto, nenhuma decisão exclusivamente automatizada
com efeito legal ou similarmente significativo sobre o titular (LGPD, art. 20) — documentado aqui
explicitamente porque não existe, não porque foi removido.

## 30. Direitos do titular

Ver a Política de Privacidade pública (`/privacidade`, "Seus direitos") para a lista voltada ao
usuário final. Tecnicamente, hoje: confirmação/acesso/correção são possíveis via consulta manual
no Supabase (Seção 13); exclusão/anonimização e portabilidade têm o conceito preparado mas não uma
função pronta (Seções 14/15); revogação de consentimento já é 100% self-service (banner/link do
footer, sem precisar de nenhum pedido manual).

## 31. Revogar consentimento

`withdrawConsent()` (`lib/analytics/consent.ts`) — apaga a preferência salva e volta ao padrão
restritivo; o link "Preferências de privacidade" do footer já cobre o caso de uso mais comum
(mudar de ideia), então `withdrawConsent` fica disponível como função de biblioteca (usada nos
testes) sem um botão dedicado "esquecer minha escolha" — reabrir as preferências e escolher
"Recusar não essenciais" produz o mesmo resultado prático pela UI.

## 32. Testes

`npx vitest run` — cobertura desta fase:

- `lib/analytics/consent.test.ts` (7) — padrão restritivo, persistência, hidratação, evento de
  mudança, `withdrawConsent`.
- `lib/analytics/trackEvent.test.ts` (9, reescrito) — nenhum provider dispara sem decisão de
  consentimento; GA4/interno só com analytics; Meta Pixel só com marketing.
- `features/privacy/state/consentBannerVisibility.test.ts` (4) — abrir/fechar/notificar.
- `features/privacy/state/useConsent.test.tsx` (3) — reatividade, e uma regressão real de
  `useSyncExternalStore` encontrada via Playwright (ver `docs/DECISIONS.md`).
- `features/privacy/components/ConsentBanner.test.tsx` (10) — aparece sem decisão salva; nenhum
  checkbox pré-marcado; "Essenciais" sempre marcado/desabilitado; as 3 ações fazem exatamente o
  que dizem; reabertura manual; link para a política presente.
- `features/site/components/SiteFooter.test.tsx` (+1) — o link do footer é um `<button>`, reabre
  o banner.
- Manual (Playwright): novo usuário vê o banner; Builder funciona sem decisão; aceitar/recusar/
  configurar persistem corretamente; reload não reabre o banner; reabertura manual funciona;
  `window.gtag`/`window.fbq` nunca definidos sem consentimento; teclado (Tab/Enter); 360px;
  `prefers-reduced-motion`.
