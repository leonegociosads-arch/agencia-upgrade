# PROJECTS-CASES — registro do que foi conferido nos cases de `/projetos`

Regra interna (não aparece na página): cada recurso citado em `features/projects/data/projects.ts` precisa
estar **confirmado** no site ao vivo e/ou no código-fonte do projeto. O que é só **inferido** não entra
como fato. Conferência feita em **08/11/2026**. Antes de mudar um case, confira de novo: recurso que saiu do
ar precisa sair da página.

Fontes:
- Site ao vivo (navegador e HTML público).
- Código local: SM Design em `C:\Users\leone\Videos\site SM` (branch `master`) e `..\sm-release` (branch
  `release/brand-manual`, a que vai para produção); Kai Hikari em `C:\Users\leone\Videos\kaihikari`.

---

## 01 · SM Design — https://www.smdesignoficial.com/

| Afirmação na página | Status | Onde foi confirmado |
|---|---|---|
| Kits gráficos sob medida, acessórios, projeto 3D e identidade visual | Confirmado | Home ao vivo (Gráficos, Kit Grip, Acessórios, Serviços: Projeto 3D e Identidade Visual) |
| Centenas de produtos | Confirmado | `/graficos` ao vivo mostra "277 produtos" (número não usado na copy porque muda) |
| Filtros em sequência: marca → nacional/importada → ano ou linha | Confirmado | `/graficos` ao vivo + `src/components/product/GraficosCatalog.tsx` (3 níveis) |
| 10 materiais de adesivo; total e prazo mudam na tela | Confirmado | Página de produto ao vivo (Brilhante … Metalizado, adicional e prazo por material) |
| Dados da moto no pedido | Confirmado | Página de produto ao vivo ("Dados da moto: marca, modelo, ano") |
| Carrinho e pagamento online | Confirmado | `/checkout` ao vivo devolve `onlinePayment: true`; integração Mercado Pago em `server/mercadopago.ts` |
| Acompanhamento por link exclusivo | Confirmado | Rota `/pedido/[token]` (linha do tempo e status público) |
| Briefing de gráfico em 5 etapas | Confirmado | `/grafico-personalizado` ao vivo ("01 / 05") |
| Valor final calculado no servidor | Confirmado | Função `create_order` no banco soma o adicional do material (`CURRENT-STATE.md`, 29/10) |
| Painel com produtos, pedidos, produção e financeiro (acesso restrito) | Confirmado | Rotas `src/app/admin/*` na branch de produção; login obrigatório |
| Pagamento conferido com o Mercado Pago antes da produção | Confirmado | `reconcileOrderPayments`/webhook reconsultam o pagamento; Kanban só recebe pedido pago |
| Fotos em versões leves geradas automaticamente | Confirmado | HTML ao vivo de `/graficos` usa `__640.webp`; `src/server/product-image-variants.ts` |
| Next.js, Supabase, Mercado Pago | Confirmado | `package.json` e código |

Não citado (fora da página de propósito):
- **E-mails automáticos (Resend):** existem no código, mas a documentação marca etapas e migrations como não
  rodadas. Sem confirmação de que estão ativos em produção.
- **Alterações de ERP de 07/11** (prazo de despacho, pedido avulso, arquivos da gráfica): exigem migration que
  ainda precisa rodar antes de publicar.
- **Números de desempenho** (ex.: fotos de ~795 KB para ~30 KB): estão na documentação interna, mas não foram
  medidos no site ao vivo nesta conferência.

## 02 · Kai Hikari — https://kaihikari.somosupgrade.com.br/

| Afirmação na página | Status | Onde foi confirmado |
|---|---|---|
| Restaurante japonês em Ilha Comprida (SP), delivery para Ilha Comprida e Iguape | Confirmado | Home ao vivo |
| 19 categorias, preço promocional, composição do combo desenhada | Confirmado | `/menu` ao vivo (lista de categorias, "De/por", ícones com contagem de peças) |
| Ficha do prato: adicionais, quantidade, observação; "+" adiciona direto | Confirmado | `/menu` ao vivo + `docs/kai-hikari-site.md` |
| Entrega ou retirada, bairro com taxa, pedido mínimo, pagamento e troco | Confirmado | `/menu` ao vivo (pedido mínimo) + sacola em `src/components/site/cart/` + tabela `delivery_zones` |
| Acompanhamento do pedido por link | Confirmado | Rota `/acompanhar/[token]` (`get_public_order`) |
| Abertura 3D e animações desligadas em movimento reduzido | Confirmado | Home ao vivo + seção "Motion" de `docs/kai-hikari-site.md` |
| Pedido gravado no banco, valores recalculados | Confirmado | `src/lib/orders/placeOrder.ts` → função `place_order` |
| Pedido aparece na hora no painel; WhatsApp opcional | Confirmado | `docs/kai-hikari-site.md` ("aparece na hora no painel"; "resumo pelo WhatsApp é opcional") |
| Cardápio editável pelo painel, no site em até 1 minuto | Confirmado | `revalidate = 60` em `src/app/(site)/layout.tsx` + guia de manutenção |
| Análise/marketing só depois do consentimento | Confirmado | README (variáveis só carregam após consentimento) + `src/lib/consent/` |
| Next.js, Supabase, GSAP | Confirmado | `package.json` |

Não citado:
- **Nome da plataforma do painel** ("Upgrade Negócios"): é um produto à parte da Upgrade; citar ou não é decisão
  comercial sua. A página diz só "painel do restaurante".
- **Base inicial de código aberto:** parte da configuração inicial veio de um projeto público com licença MIT
  (README do Kai Hikari). Por isso a página não usa "construído do zero".

---

## Pendência visível no site do Kai Hikari (fora desta página)

O site ao vivo ainda mostra marcadores de conteúdo pendente: `[INSERIR NOME DO PRATO ASSINATURA]`,
`[FOTO DO PRATO ASSINATURA]`, `[INSERIR RESUMO DA HISTÓRIA …]` e `[INSERIR INSTAGRAM]`. Como o CTA "Ver projeto
ao vivo" leva o visitante até lá, vale preencher antes de divulgar `/projetos`. Ver `docs/CONTENT-TODO.md`.
