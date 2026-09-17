# IMPLEMENTATION-STAGE-36 — Versão Award-Level / Polimento Final

> Ver `docs/AWARD-AUDIT.md` (auditoria completa antes da implementação) e `docs/AWARD-LEVEL.md`
> (direção de arte/assinatura visual final) para os documentos complementares. Ver
> `docs/AWARD-SUBMISSION-CHECKLIST.md` para a preparação de submissão.

## 1. Abordagem

Seguido à risca o pedido do briefing (Seção 1: "não começar programando") — a auditoria completa
(`docs/AWARD-AUDIT.md`) foi feita e classificada em CRÍTICO/ALTO IMPACTO/REFINAMENTO/OPCIONAL antes
de qualquer edição de código. Resultado: **nenhum problema crítico**, **4 achados de alto impacto**
(implementados), e um volume grande de itens onde a auditoria confirmou que o sistema já atendia ao
critério do briefing — registrados como tal, não forçados a virar mudança de código só para haver
"trabalho visível" (briefing, Seção 117: "não adicione efeitos apenas para poder dizer que o site
possui mais tecnologia").

## 2. Refinamentos implementados

### 2.1 Motion — diferenciação entre as duas seções "leves" da Home

**Achado**: `ProjectsTeaserSection` e `FinalCtaSection` usavam o mesmo hook
(`useRevealScrollMotion`) com os mesmos parâmetros — a única diferença entre as duas entradas era o
texto.

**Correção**: `useRevealScrollMotion.ts` ganhou um parâmetro opcional `scaleFrom` (padrão `1`, sem
mudança de comportamento para quem não o usa). `ProjectsTeaserSection.tsx` passa `scaleFrom: 0.96`;
`FinalCtaSection.tsx` continua sem o parâmetro. As duas seções agora têm uma pequena diferença de
assinatura de motion, sem sair da simplicidade que ambas pedem.

### 2.2 Cartões do Builder — profundidade

**Achado**: `.card` (`ServiceSelector.module.css`) e `.option` (`QuestionRenderer.module.css`)
tinham só borda + cor de fundo, sem nenhuma sombra em qualquer estado — mais próximo de uma caixa
de formulário do que de um cartão com peso físico.

**Correção**: sombra sutil (`--ds-shadow-sm`/`--ds-shadow-md`, tokens já existentes desde a Fase 18
— nenhum valor novo inventado) em `.card:hover`, `.cardConfigured`, `.option:hover`/`:focus-visible`
e `.optionSelected`.

### 2.3 Tipografia — tracking em display/h1

**Achado**: `Typography.module.css` definia tamanho/peso/`line-height` para os 4 níveis de heading,
sem nenhum `letter-spacing` — em títulos grandes, a ausência de tracking costuma deixar a tipografia
parecendo "a fonte ampliada", não desenhada.

**Correção**: `letter-spacing: -0.02em` em `.display`, `-0.015em` em `.h1`. `.h2`/`.h3` e todos os
estilos de corpo de texto ficaram intocados (tracking negativo em texto pequeno prejudicaria a
leitura).

### 2.4 Footer — momento de marca no fechamento

**Achado**: o footer terminava com uma borda cinza genérica, sem nenhum elemento reconhecível da
marca — o briefing pede que o final da Home pareça intencional (Seção 66) e sugere reaproveitar
elementos visuais já usados em outro lugar do site (Seção 30).

**Correção**: um traço de 2×64px na cor de destaque (`--ds-color-accent`), centralizado, no topo do
footer (`::before`, puramente decorativo, `aria-hidden` implícito por não ter papel semântico).

## 3. O que foi avaliado e mantido sem alteração

Ver `docs/AWARD-AUDIT.md`, seção "REFINAMENTO" — sound design, troca de cena do Builder, tokens de
motion centralizados, variedade de técnica entre Hero/Capabilities, e os momentos de marca já
existentes (monograma 3D, brilho procedural, easter egg do grafismo) foram todos revisados e
confirmados como já adequados ao critério do briefing, sem uma mudança de código para justificar.

## 4. O que ficou fora do alcance desta etapa (não é um problema de código)

- Cases reais (depende de trabalho comercial entregue pela Upgrade, fora do escopo de uma sessão de
  desenvolvimento).
- Teste em dispositivo físico/múltiplos monitores reais (sem acesso a hardware nesta sessão).
- Vídeo de apresentação do site (plano documentado em `docs/AWARD-LEVEL.md`, Seção 13; não
  produzido, como o próprio briefing permite).

## 5. Regras de negócio — confirmação

Nenhuma pergunta do Builder, regra de ramificação, cálculo de score, política de RLS, endpoint ou
fluxo de analytics foi tocado nesta etapa (briefing, Seção 111). Todas as mudanças desta etapa são
CSS/tokens de design ou uma prop opcional em um hook de motion já existente.

## 6. Regressão

```
lint:      0 erros, 0 avisos
typecheck: 0 erros
tests:     622/622 (Vitest) — inclui os testes de ProjectsTeaserSection/FinalCtaSection/Typography
           tocados pelas mudanças desta etapa
E2E:       ver seção abaixo
build:     ver seção abaixo
```

## 7. Limitações desta etapa

- Auditoria feita por leitura de código, não por observação de pessoas reais nem por um ambiente de
  testes visuais automatizado de regressão (screenshot diffing) — mesma limitação já registrada nas
  Etapas 30-32.
- Performance não foi remedida com Lighthouse nesta etapa: as 4 mudanças implementadas são CSS puro
  ou uma prop de hook já existente, sem novo asset/biblioteca/requisição — julgado que remedir não
  traria informação nova o suficiente para justificar o tempo, já que `docs/PERFORMANCE.md` (Etapa
  30) continua sendo a medição de referência válida.

## 8. Pendências para a Etapa 37 (ou além)

- Cases reais assim que a Upgrade tiver projetos entregues para mostrar.
- Deploy real publicado (`docs/IMPLEMENTATION-STAGE-33.md`) — pré-requisito para social preview e
  qualquer submissão de galeria de design.
- Gravação do vídeo de apresentação, seguindo o roteiro de `docs/AWARD-LEVEL.md`, Seção 13.
- Pendências já carregadas de etapas anteriores (MFA, backup Supabase, teste com usuários reais,
  domínio próprio) continuam de pé, sem relação direta com esta etapa.
