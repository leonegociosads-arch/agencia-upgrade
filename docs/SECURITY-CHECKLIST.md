# SECURITY CHECKLIST

> Checklist de verificação rápida — Etapa 29. Detalhamento e justificativa de cada item em
> `docs/SECURITY.md`. Reexecutar esta lista sempre que uma nova rota/Server Action/tabela for
> adicionada ao projeto.

## Dados

- [x] Nenhum dado sensível (saúde, biometria, opinião política, dados bancários) é coletado.
- [x] Nenhum `{ ...body }` é passado direto para o Supabase (mass assignment) — todo repositório
      monta o objeto de insert/update campo a campo.
- [x] Lead Score sempre calculado no servidor, nunca aceito do cliente.

## Autenticação

- [x] Admin usa Supabase Auth gerenciado — nenhum sistema de senha próprio.
- [x] `proxy.ts` faz a checagem otimista de sessão; `requireAdminSession()` é a fronteira real,
      chamada em toda página/Server Action privada.
- [x] Logout invalida a sessão no provedor (`supabase.auth.signOut()`), não só no cliente.
- [x] Rate limit de login (5 tentativas / 5 min por IP+e-mail).
- [ ] MFA para contas `admin_users` — recomendação forte, não configurada (é configuração do
      provedor, feita quando o primeiro admin real existir).

## Autorização

- [x] "Autenticado" nunca é tratado como "autorizado" — `admin_users` é checado em toda sessão.
- [x] Ninguém pode se auto-promover a admin pelo app (sem GRANT de escrita em `admin_users` para
      `authenticated`).
- [x] `changed_by`/`created_by` sempre vêm da sessão do servidor, nunca do cliente.

## RLS (Supabase)

- [x] `upgrade_leads`: RLS habilitada, sem policy pública; só `service_role` insere, só admins
      leem/atualizam `status` (GRANT de coluna).
- [x] `admin_users`: RLS habilitada; cada usuário só lê a própria linha.
- [x] `upgrade_lead_notes`/`upgrade_lead_status_history`: RLS habilitada, só admins.
- [x] `analytics_events`: RLS habilitada; escrita só via `service_role`; leitura só admins.
- [x] Nenhuma tabela concede SELECT/INSERT/UPDATE/DELETE público (`anon`).

## Rate limiting

- [x] `submitLead`: 5 / 10 min por IP.
- [x] `signInAdmin`: 5 / 5 min por IP+e-mail.
- [x] `recordEvent`: 60 / 5 min por sessão.
- [x] Honeypot no formulário de lead.

## Validação server-side

- [x] Toda entrada pública revalidada no servidor com Zod (nunca só no cliente).
- [x] `serviceId`/status/nome de evento validados por allowlist, nunca string livre.
- [x] Limites de tamanho em `answers`, serviços, nota administrativa, termo de busca.
- [x] IDs sempre validados como UUID antes de qualquer consulta.

## Secrets

- [x] `SUPABASE_SERVICE_ROLE_KEY` nunca tem prefixo `NEXT_PUBLIC_`; só importada em
      `lib/supabase/server.ts` (`import "server-only"`).
- [x] Nenhum segredo hardcoded no código-fonte (auditado).
- [x] `.env*` fora do Git; `.env.example` só com nomes.
- [x] Nenhum segredo real já commitado no histórico (verificado).

## Headers / CSP

- [x] Content-Security-Policy configurada (`next.config.ts`).
- [x] X-Frame-Options: DENY.
- [x] X-Content-Type-Options: nosniff.
- [x] Referrer-Policy: strict-origin-when-cross-origin.
- [x] Permissions-Policy bloqueando APIs não usadas.
- [x] Strict-Transport-Security.
- [x] `X-Powered-By` removido.
- [x] Cabeçalhos confirmados numa build de produção real (`next build` + `next start` + `curl`).

## Dependências

- [x] `npm audit` executado; achados classificados por impacto real (dev-only vs. produção).
- [x] Nenhum upgrade de major forçado sem avaliar impacto.
- [x] Nenhuma dependência não utilizada encontrada.
- [x] `package-lock.json` versionado.

## Logging

- [x] Nenhuma senha/token/service role logada.
- [x] Erros do Postgres reduzidos a `code`/`message` nos pontos que gravam dado pessoal.
- [x] Nenhuma ferramenta de log externa recebendo payload completo (nenhuma integrada).
- [x] WhatsApp pré-preenchido é curto, sem dado pessoal extra na URL.

## Testes de segurança

- [x] Rate limit (janela, reset, chaves independentes).
- [x] Honeypot rejeita sem gravar.
- [x] Payload/serviços/respostas grandes demais são rejeitados.
- [x] Score/tier/breakdown do cliente são ignorados.
- [x] Não-admin não acessa Server Actions privadas (`requireAdminSession` mockado retornando
      redirect/negação nos testes existentes).
- [x] Termo de busca é truncado antes de virar filtro.
- [x] Cabeçalhos de segurança presentes (`next.config.test.ts`).

## Pendências (ver `docs/IMPLEMENTATION-STAGE-29.md`)

- [ ] MFA para admins.
- [ ] Contador de rate limit persistente (só se abuso real justificar).
- [ ] Confirmar/documentar plano de backup do Supabase.
- [ ] Testar uma restauração de backup real.
- [ ] Upgrade do Vitest (major) numa janela de manutenção dedicada.
- [ ] Função administrativa de exclusão/exportação de lead (já pendente da Etapa 28/LGPD).
