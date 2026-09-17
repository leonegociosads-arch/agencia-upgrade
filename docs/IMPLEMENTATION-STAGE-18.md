# IMPLEMENTATION STAGE 18 — Design System da Agência Upgrade

> Fase 18 do roadmap. Cria a fundação visual (tokens + componentes-base) que a Etapa 19 vai usar
> para redesenhar as telas reais. Nenhuma tela existente (Home, Builder, admin) foi alterada
> visualmente nesta fase — só código novo, isolado. Ver `docs/DESIGN-SYSTEM.md` para o detalhamento
> completo de cada token/componente.

---

## 1. O que foi implementado

Tokens de design (`styles/tokens.css`, ~90 variáveis) cobrindo cor, tipografia, espaçamento, grid,
radius, sombra e motion; 15 componentes-base (`features/design-system/components/`); duas fontes
novas carregadas (`Montserrat`/`Inter`, ao lado das Geist já existentes); uma rota de showcase
(`/design-system`, bloqueada em produção). Nada disso foi aplicado a nenhuma tela real ainda.

## 2. Tokens

`styles/tokens.css`, importado uma vez em `app/globals.css`, prefixo `--ds-` (nunca colide com os
tokens antigos `--background`/`--foreground`/`--builder-*`, que continuam intocados porque o
Builder em produção depende deles). Dois temas completos (escuro = padrão/flagship, claro = via
`[data-theme="light"]`, sem mecanismo de alternância construído). Ver `docs/DESIGN-SYSTEM.md`,
Seções 2-6 e 14, para a tabela completa e o raciocínio de contraste por trás de cada valor.

## 3. Componentes

`features/design-system/components/`: `Button`, `Badge`, `Card`, `SectionContainer`, `Heading`,
`Text`, `FormField`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Alert`, `Spinner`,
`EmptyState` — 15 no total, cada um mapeado a uma seção explícita do briefing (nenhum componente
"extra" além do pedido). Utilitário `features/design-system/utils/cx.ts` para composição de
classes condicionais.

## 4. Decisões

Registradas em `docs/DECISIONS.md`, Fase 18 — resumo: tema escuro como padrão (não um "modo escuro
opcional"), texto sobre o verde da marca é sempre quase-preto (nunca branco — contraste medido),
`success`/`warning`/`error`/`info` como família de cor separada do verde de destaque,
`Checkbox`/`Radio` nativos estilizados via `accent-color` (não desenhados do zero), novo diretório
`features/design-system/` (preenchendo o `styles/` já reservado desde a Fase 6), showcase bloqueado
em produção.

## 5. Limitações

Ver `docs/DESIGN-SYSTEM.md`, Seção 18.

## 6. Pendências para a Etapa 19

- Aplicar a identidade a Home, Builder, formulário de contato e admin — nenhuma tela real foi
  tocada nesta fase.
- Decidir/implementar um mecanismo de alternância de tema (se algum dia fizer sentido) — hoje só os
  valores do tema claro existem, sem toggle.
- Compor os componentes-base em padrões maiores específicos do produto (ex.: o card de escolha de
  serviço do Builder, usando `Card selected`).
- Motion real (entrada, scroll, microinterações) — só os tokens de duração/easing existem.

## 7. Testes

**37 testes novos** (418 no total do projeto): um arquivo por componente (ou por grupo de
controles de formulário — `FormControls.test.tsx` cobre `Input`/`Textarea`/`Select`/`Checkbox`/
`Radio` juntos), cobrindo exatamente o que o briefing pediu (Seção 20): renderização, `disabled`,
foco, associação label↔input (`getByLabelText`), mensagens de erro (`role="alert"` +
`aria-describedby`), sem nenhum teste de valor visual pixel a pixel.

**Descoberta durante os testes**: o projeto não tem `@testing-library/jest-dom` instalado (nenhum
teste existente usa `toHaveAttribute`/`toBeDisabled`/etc.) — os testes desta fase foram escritos
com `expect()` puro sobre propriedades/atributos do DOM (`element.disabled`,
`element.getAttribute(...)`, `document.activeElement`), consistente com o resto do projeto, em vez
de adicionar uma dependência nova só para isto.

**Descoberta durante os testes**: `fireEvent.click` do Testing Library, em cima do jsdom, não
respeita o atributo `disabled` de um `<input type="checkbox">` do jeito que um navegador real
respeitaria (o `checked` muda mesmo assim) — limitação conhecida do jsdom, não um bug do
componente. O teste de "desabilitado" para `Checkbox` verifica a propriedade `disabled` em si, não
o resultado de um clique simulado.

## 8. Revisão

- **Lint**: 0 erros.
- **Typecheck**: 0 erros.
- **Testes**: 418/418 passando.
- **Build**: sucesso; `/design-system` aparece como rota estática no build, mas responde 404 ao
  rodar `next start` em produção (confirmado manualmente) — o bloqueio funciona.
- **Manual**: showcase verificado no navegador (cores, tipografia, botões — incluindo `loading`
  com `aria-busy`, card selecionado com a marca de check, input com erro exibindo a mensagem), sem
  overflow horizontal em viewport de 375px, sem erros de JavaScript. Builder testado em produção
  depois do build desta fase — continua funcionando exatamente como antes (nenhuma regressão).
