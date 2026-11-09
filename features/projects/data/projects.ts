import type { ProjectCase } from "../types";

/**
 * Os dois cases reais da Upgrade (Etapa "Ver Projetos"). Só existem estes dois — nada de
 * "Projeto 03 em breve", contagem de portfólio ou case conceitual.
 *
 * Cada frase foi conferida no site ao vivo e/ou no código-fonte de cada projeto em 08/11/2026
 * (fonte de cada item: `docs/PROJECTS-CASES.md`). Antes de mudar um recurso aqui, confira de novo
 * se ele continua no ar — um case com recurso que não existe mais destrói exatamente a confiança
 * que esta página existe para construir.
 *
 * Mídia: capturas reais dos sites (provisórias). Para trocar por vídeo, preencha `media.video`
 * (ver `ProjectMediaConfig` em `../types.ts`) — o componente não muda.
 */
export const PROJECT_CASES: readonly ProjectCase[] = [
  {
    slug: "sm-design",
    index: "01",
    name: "SM Design",
    category: "E-commerce · Plataforma comercial",
    headline: "Um catálogo enorme, organizado para cada piloto achar o kit certo da própria moto.",
    summary:
      "A SM Design produz kits gráficos sob medida para motocross e off-road, além de acessórios, projeto 3D e identidade visual para equipes. O site reúne tudo isso e leva o cliente do filtro ao pagamento, com o pedido chegando completo para a produção.",
    context: {
      need: "Centenas de produtos que mudam conforme a marca, o modelo e o ano de cada moto, e pedidos personalizados que precisam chegar à produção sem informação faltando.",
      solution:
        "Uma loja virtual com busca guiada, personalização com preço na hora, pagamento online e um painel para a equipe acompanhar cada pedido.",
    },
    screen: [
      {
        title: "Filtros em sequência",
        text: "Marca, nacional ou importada, ano ou linha: cada escolha reduz as opções até sobrar o kit que serve na moto do cliente.",
      },
      {
        title: "Personalização com preço na hora",
        text: "O cliente escolhe entre 10 materiais de adesivo e informa a moto. O total e o prazo de produção mudam na tela conforme a escolha.",
      },
      {
        title: "Carrinho e pagamento online",
        text: "O pedido é fechado no próprio site, e o cliente acompanha a situação dele por um link exclusivo.",
      },
      {
        title: "Briefing de gráfico exclusivo",
        text: "Quem quer um gráfico do zero responde um passo a passo de 5 etapas que organiza a ideia antes da conversa com a equipe.",
      },
    ],
    backstage: [
      {
        title: "Banco de dados",
        text: "Produtos, materiais, preços e pedidos ficam guardados em um banco de dados. O valor final é calculado no servidor, não no navegador do cliente.",
      },
      {
        title: "Painel administrativo",
        text: "Com acesso restrito, a equipe cadastra produtos e acompanha pedidos, produção e financeiro em um só lugar.",
      },
      {
        title: "Integração com pagamento",
        text: "O site confere com a plataforma de pagamento se o pagamento foi aprovado antes de o pedido seguir para a produção.",
      },
      {
        title: "Imagens otimizadas",
        text: "Cada foto ganha versões leves, geradas automaticamente, para o catálogo abrir rápido até no celular.",
      },
    ],
    liveUrl: "https://www.smdesignoficial.com/",
    media: {
      domain: "smdesignoficial.com",
      desktop: {
        src: "/assets/projects/sm-design/desktop.webp",
        width: 1600,
        height: 1000,
        alt: "Catálogo da SM Design no computador: filtros por marca e por nacional ou importada ao lado de kits gráficos com preço e botão de compra.",
      },
      mobile: {
        src: "/assets/projects/sm-design/mobile.webp",
        width: 600,
        height: 1298,
        alt: "Página de um kit gráfico da SM Design no celular, com a moto adesivada, o código do produto e o preço.",
      },
    },
    accent: "#e5302a",
  },
  {
    slug: "kai-hikari",
    index: "02",
    name: "Kai Hikari",
    category: "Cardápio digital · Restaurante",
    headline: "Um cardápio que vira pedido em poucos toques, direto do celular.",
    summary:
      "O Kai Hikari é um restaurante japonês de Ilha Comprida (SP), com delivery para Ilha Comprida e Iguape. O site apresenta a casa com identidade própria e transforma o cardápio em pedido: o cliente monta a sacola, confirma e acompanha, e o restaurante recebe na hora.",
    context: {
      need: "Um cardápio extenso, cheio de combos e promoções, que precisava ser fácil de escolher pelo celular, e pedidos que chegassem completos ao restaurante.",
      solution:
        "Um site com a identidade da casa e um cardápio digital com sacola, pedido registrado e acompanhamento pelo celular.",
    },
    screen: [
      {
        title: "Cardápio por categorias",
        text: "19 categorias, de combos a bebidas, com preço promocional e a composição de cada combo desenhada peça por peça.",
      },
      {
        title: "Ficha do prato",
        text: "Adicionais, quantidade e observação na mesma tela. O botão + coloca o prato direto na sacola.",
      },
      {
        title: "Entrega ou retirada",
        text: "O cliente escolhe o bairro, vê a taxa de entrega e o pedido mínimo e informa a forma de pagamento e o troco.",
      },
      {
        title: "Acompanhamento do pedido",
        text: "Depois de confirmar, um link mostra a situação do pedido no celular.",
      },
      {
        title: "Experiência da marca",
        text: "Abertura em 3D com o símbolo da casa e animações que se desligam para quem prefere menos movimento.",
      },
    ],
    backstage: [
      {
        title: "Pedido registrado no banco",
        text: "Cada pedido é gravado em um banco de dados, que recalcula todos os valores. O preço não depende do que aparece na tela.",
      },
      {
        title: "Painel do restaurante",
        text: "O pedido aparece na hora no painel da equipe. O resumo pelo WhatsApp fica como opção do cliente.",
      },
      {
        title: "Cardápio editável",
        text: "Pratos, preços, fotos e categorias mudam pelo painel e aparecem no site em até 1 minuto, sem depender de programador.",
      },
      {
        title: "Privacidade (LGPD)",
        text: "Ferramentas de análise e de marketing só carregam depois que o visitante aceita os cookies.",
      },
    ],
    liveUrl: "https://kaihikari.somosupgrade.com.br/",
    media: {
      domain: "kaihikari.somosupgrade.com.br",
      desktop: {
        src: "/assets/projects/kai-hikari/desktop.webp",
        width: 1600,
        height: 1000,
        alt: "Abertura do site do Kai Hikari no computador: o título “Uma experiência japonesa” ao lado do símbolo dourado da casa.",
      },
      mobile: {
        src: "/assets/projects/kai-hikari/mobile.webp",
        width: 600,
        height: 1298,
        alt: "Cardápio digital do Kai Hikari no celular: um combo com preço promocional, foto e as peças desenhadas uma a uma.",
      },
    },
    accent: "#d6a63c",
  },
];
