# TEST RESULTS — Etapa 31 (Testes Funcionais)

> Ver `docs/FUNCTIONAL-TESTS.md` (estratégia/ambiente) e `docs/IMPLEMENTATION-STAGE-31.md` (bugs
> encontrados/corrigidos, decisões, pendências) para os documentos complementares.

## 1. Resumo

| Camada | Resultado |
| --- | --- |
| Unitário/integração (Vitest) | **622/622 PASS** |
| E2E — Chromium (suíte completa, ~60 testes) | **58/60 PASS** (2 flakes conhecidos, ver Seção 4) |
| E2E — Firefox (fumaça, 4 testes) | **4/4 PASS** |
| E2E — WebKit (fumaça, 4 testes) | **4/4 PASS** (depois da correção do bug HSTS — ver Seção 3) |
| E2E — Mobile Chrome (fumaça, 4 testes) | 3/4 PASS (1 flake, mesma causa da Seção 4) |
| E2E — Mobile Safari (fumaça, 4 testes) | 3/4 PASS (1 flake, mesma causa da Seção 4) |
| Lint | 0 erros, 0 avisos |
| Typecheck | 0 erros |
| Build | sucesso, 15 rotas inalteradas |

## 2. PASS — por fluxo

- **Builder**: Home → Builder → seleção de serviço → perguntas → conclusão → Meu Upgrade → resumo
  → contato → envio → sucesso — PASS, para os 3 serviços individualmente e em combinações (Site+
  Tráfego, Site+Tráfego+Design).
- **Duplicação**: reabrir um serviço já configurado entra em edição, nunca cria uma segunda
  entrada — PASS.
- **Draft vs. confirmed (teste crítico, Seção 9/10)**: editar, mudar o tipo de site (invalidando
  `site_recursos`), CANCELAR — o confirmed continua exatamente como estava; o mesmo fluxo até
  SALVAR — o confirmed passa a refletir a nova escolha, sem sobra da resposta antiga — PASS.
- **Dependências**: trocar `site_tipo` remove a resposta obsoleta de `site_recursos`; "Voltar"
  preserva respostas válidas anteriores — PASS.
- **Meu Upgrade**: estado vazio, adicionar/editar/remover (último, intermediário, entre vários),
  cancelar remoção — PASS.
- **Persistência de sessão**: refresh em cada etapa (seleção, meio das perguntas, Meu Upgrade,
  resumo) restaura o progresso com o banner "Seu progresso foi recuperado."; teste crítico da
  Seção 19 (confirmed E-commerce + draft Institucional sobrevivendo SEPARADOS a um refresh) —
  PASS; `localStorage` corrompido ou com versão incompatível não trava o app — PASS; "Começar de
  novo" limpa a sessão — PASS.
- **Formulário de lead**: validação por campo (nome/empresa/WhatsApp/e-mail), formatos comuns de
  WhatsApp aceitos, e-mail claramente inválido rejeitado sem tentar validar RFC completa, campo
  opcional aceito vazio, dados preservados ao voltar/retornar, duplo clique não duplica envio —
  PASS.
- **Falha + retry + idempotência (Seções 37-39)**: uma falha simulada de banco mostra erro claro,
  preserva os dados digitados, e um retry com a MESMA `idempotencyKey` tem sucesso sem duplicar —
  PASS.
- **Admin**: login (credenciais válidas/inválidas), sem sessão redireciona ao login, logout
  invalida a sessão, lista carrega/ordena/filtra/busca, estado vazio em filtro sem resultado,
  detalhe mostra contato/serviços/score/status/notas, links de WhatsApp/e-mail corretos
  (`target="_blank" rel="noreferrer"` no WhatsApp), alterar status persiste a um refresh, criar
  nota persiste, conteúdo de nota com `<script>` é tratado como texto puro (nunca executa) — PASS.
- **Consentimento**: banner para novo visitante, aceitar todos/recusar não essenciais/configurar
  gravam a decisão corretamente (nunca pré-marcado), site continua funcional depois de recusar,
  reabrir preferências pelo rodapé funciona, uma versão de política antiga reabre o banner — PASS.
- **Segurança (reexecução da Etapa 29 via UI)**: honeypot rejeita sem criar lead, rate limit de
  login bloqueia a 6ª tentativa com mensagem clara (testado em pequena escala, nunca um ataque
  real), nenhum open redirect — PASS.
- **Acessibilidade/motion**: fluxo principal navegável só com teclado (Tab/Enter/Espaço), Esc
  fecha o drawer "Meu Upgrade" e o diálogo de remoção, `prefers-reduced-motion` mantém o fluxo
  inteiro utilizável, WebGL desativado não impede o Builder de funcionar (fallback assume), scroll
  trava enquanto o drawer está aberto, uma rota inexistente mostra 404 real — PASS.

## 3. Bugs CRITICAL/HIGH encontrados e corrigidos

Ver `docs/IMPLEMENTATION-STAGE-31.md`, Seção 2, para o detalhamento técnico completo de cada um.
Lista classificada por severidade (briefing, Seções 111-113):

1. **[CRITICAL] HSTS/`upgrade-insecure-requests` quebravam a aplicação inteira no WebKit/Safari em
   desenvolvimento** — o WebKit aplica HSTS de forma mais estrita que Chromium/Firefox mesmo em
   `localhost`; depois da primeira resposta, toda requisição seguinte (fontes, CSS, chunks) era
   forçada para HTTPS contra um servidor que só fala HTTP, quebrando silenciosamente (nenhum erro
   visível na tela, só "SSL connect error" no console). **Não afeta usuários reais em produção**
   (lá o site já é servido por HTTPS de verdade) — mas teria bloqueado qualquer desenvolvimento/
   teste real em Safari indefinidamente. Corrigido tornando os dois cabeçalhos condicionais a
   `NODE_ENV !== "development"`.
2. **[HIGH] O painel "Meu Upgrade" bloqueava a interação com a tela por trás dele** — o overlay do
   Drawer cobria a tela inteira (`inset: 0`) e capturava todo clique, mesmo esse painel sendo
   documentadamente "uma seção persistente, não um modal" (o usuário podia editar um serviço ou
   voltar ao seletor com o painel ainda aberto, mas não conseguia clicar em nada da tela por trás).
   Nunca visível em teste unitário (`jsdom` não calcula sobreposição real). Corrigido com
   `pointer-events: none` no overlay (mantendo o escurecido visual) e `pointer-events: auto` só no
   painel em si.
3. **[HIGH] Um controle específico ("Cancelar edição"/"← Voltar") ficava geometricamente sob o
   painel "Meu Upgrade" em telas ~1280px** — mesmo depois da correção acima, a barra superior da
   tela de perguntas caía na faixa de 420px do painel (sempre clicável, de propósito). Corrigido
   dando à barra um `z-index` acima do Drawer.

## 4. Flakiness conhecida (não bugs de aplicação)

Dois testes (Chromium, suíte completa) e um teste de login em cada viewport mobile podem falhar
esporadicamente SÓ quando a suíte inteira roda com paralelismo — nunca em isolamento:

- `admin.spec.ts` — "Seção 51 — alterar o status persiste": confirmado 10/10 passando ao rodar
  `admin.spec.ts` sozinho com `--workers=1`. Causa raiz: `lib/testing/e2eStore.ts` é um único
  módulo em memória compartilhado por toda requisição concorrente ao mesmo `next dev` — sob carga
  de outros arquivos rodando ao mesmo tempo, uma leitura ocasionalmente não reflete a escrita mais
  recente. Mitigado (não eliminado) com `workers: 2` e execução serial interna do arquivo.
- `accessibility-motion.spec.ts` — "Seção 90/91 — fluxo por teclado": mesma classe de
  sensibilidade a tempo sob carga (o servidor de dev único atende toda a concorrência).
- `core.smoke.spec.ts` — "login do admin" em `mobile-chrome-smoke`/`mobile-safari-smoke`: mesma
  causa (concorrência com os outros projetos de navegador rodando contra o mesmo servidor).

Nenhum dos três é um bug da aplicação — todos reproduzem 100% de sucesso em isolamento; a causa é
a infraestrutura de teste local (um único `next dev` + um backend fake sem isolamento por worker),
documentada como pendência de melhoria (Etapa 32) se a suíte crescer o suficiente para justificar.

## 5. Testes manuais (fora do escopo automatizável desta fase)

- Qualidade visual/subjetiva de scroll storytelling (Home) sob mouse/trackpad/touch reais —
  Playwright simula scroll programático, não a sensação de um trackpad de verdade.
- Lighthouse/DevTools Performance — já cobertos com profundidade em `docs/PERFORMANCE.md` (Etapa
  30); não repetidos aqui para não duplicar trabalho.
- Teste em dispositivo físico de baixo desempenho — Playwright emula viewport/user-agent, não
  hardware real (briefing, Seção 84/107, já registrado como limitação na Etapa 30).

## 6. Lint/Typecheck/Tests/Build

```
lint:      0 erros, 0 avisos
typecheck: 0 erros
tests:     622/622 (Vitest)
E2E:       58/60 Chromium + 4/4 Firefox + 4/4 WebKit + 3/4 Mobile Chrome + 3/4 Mobile Safari
build:     sucesso, 15 rotas inalteradas
```
