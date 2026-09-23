import type { Question } from "../types";

/**
 * ARQUIVO GERADO a partir dos PNGs entregues pelo cliente (pasta "caminhos").
 *
 * Cada opção de cada pergunta do Builder tem uma arte pronta: o PNG É o card (moldura,
 * ícone, título, descrição, seta e caixa de seleção já fazem parte da imagem). Este mapa só
 * diz QUAL arquivo pertence a qual opção — nenhuma pergunta, id, ordem ou ramificação do
 * Builder foi alterada para acomodá-lo (a correspondência foi derivada da árvore existente).
 *
 * A chave inclui o TIPO da pergunta porque "design_servico" existe em duas variantes com
 * artes diferentes: escolha única (6 opções, com "Montar um pacote") e múltipla escolha
 * (as 5 do pacote, com caixa de seleção desenhada).
 *
 * `checkbox` = posição normalizada (0-1) da caixa VAZIA já desenhada no PNG de múltipla
 * escolha, medida pixel a pixel na própria arte, e `color` é a cor do traço dela. Serve para
 * o check marcado ser desenhado DENTRO do espaço que a arte já reserva, na cor que a própria
 * arte usa — nunca uma caixa HTML nova por cima nem uma cor inventada.
 *
 * `visualScale` corrige uma inconsistência real medida nas próprias artes: a peça útil (sem
 * a margem transparente ao redor) ocupa entre 67,6% e 98,6% da largura do canvas dependendo
 * do PNG — a mesma largura de container (100%) fazia algumas opções parecerem bem menores
 * que outras (pedido do usuário: "todas devem parecer pertencer ao mesmo sistema visual").
 * É um zoom óptico (`transform: scale`) sobre uma máscara com `overflow: hidden`, nunca uma
 * edição do arquivo — a arte original nunca é redesenhada, só a margem transparente que já
 * sobrava é que passa a ficar fora da área visível.
 */
export interface OptionAsset {
  src: string;
  width: number;
  height: number;
  visualScale: number;
  checkbox?: { x: number; y: number; w: number; h: number; color: string };
}

const OPTION_ASSETS: Record<string, OptionAsset> = {
  "site_tipo:single_choice:landing_page": { src: "/assets/builder/site/site_tipo/landing_page.png", width: 1080, height: 222, visualScale: 1.254 },
  "site_tipo:single_choice:site_institucional": { src: "/assets/builder/site/site_tipo/site_institucional.png", width: 1080, height: 222, visualScale: 1.254 },
  "site_tipo:single_choice:ecommerce": { src: "/assets/builder/site/site_tipo/ecommerce.png", width: 1080, height: 222, visualScale: 1.254 },
  "site_tipo:single_choice:sistema_plataforma": { src: "/assets/builder/site/site_tipo/sistema_plataforma.png", width: 1080, height: 222, visualScale: 1.254 },
  "site_tipo:single_choice:nao_sei": { src: "/assets/builder/site/site_tipo/nao_sei.png", width: 1080, height: 222, visualScale: 1.256 },
  "site_recursos:multi_choice:apresentacao_contato": { src: "/assets/builder/site/site_recursos/apresentacao_contato.png", width: 1080, height: 222, visualScale: 1.404, checkbox: { x: 0.7269, y: 0.3649, w: 0.0676, h: 0.3378, color: "#00ff7c" } },
  "site_recursos:multi_choice:formularios_leads": { src: "/assets/builder/site/site_recursos/formularios_leads.png", width: 1080, height: 222, visualScale: 1.405, checkbox: { x: 0.7269, y: 0.3559, w: 0.0676, h: 0.3378, color: "#00fe66" } },
  "site_recursos:multi_choice:agendamento_orcamento": { src: "/assets/builder/site/site_recursos/agendamento_orcamento.png", width: 1080, height: 222, visualScale: 1.404, checkbox: { x: 0.7269, y: 0.3604, w: 0.0676, h: 0.3333, color: "#00fd6d" } },
  "site_recursos:multi_choice:integracoes_ferramentas": { src: "/assets/builder/site/site_recursos/integracoes_ferramentas.png", width: 1080, height: 222, visualScale: 1.404, checkbox: { x: 0.7269, y: 0.3649, w: 0.0676, h: 0.3378, color: "#00fe6a" } },
  "site_recursos:multi_choice:catalogo_pedidos": { src: "/assets/builder/site/site_recursos/catalogo_pedidos.png", width: 1080, height: 222, visualScale: 1.152, checkbox: { x: 0.8046, y: 0.3649, w: 0.0759, h: 0.3784, color: "#00ff76" } },
  "site_recursos:multi_choice:pagamento_online": { src: "/assets/builder/site/site_recursos/pagamento_online.png", width: 1080, height: 222, visualScale: 1.155, checkbox: { x: 0.8046, y: 0.3559, w: 0.075, h: 0.3739, color: "#00fd76" } },
  "site_recursos:multi_choice:area_cliente": { src: "/assets/builder/site/site_recursos/area_cliente.png", width: 1080, height: 222, visualScale: 1.155, checkbox: { x: 0.8037, y: 0.3243, w: 0.0759, h: 0.3739, color: "#00fd79" } },
  "site_recursos:multi_choice:integracoes_estoque_pagamentos": { src: "/assets/builder/site/site_recursos/integracoes_estoque_pagamentos.png", width: 1080, height: 222, visualScale: 1.155, checkbox: { x: 0.8046, y: 0.3423, w: 0.075, h: 0.3694, color: "#00fe78" } },
  "site_recursos:multi_choice:login_area_restrita": { src: "/assets/builder/site/site_recursos/login_area_restrita.png", width: 1080, height: 222, visualScale: 1.181, checkbox: { x: 0.7852, y: 0.3649, w: 0.0778, h: 0.3784, color: "#00fd7b" } },
  "site_recursos:multi_choice:painel_dashboard": { src: "/assets/builder/site/site_recursos/painel_dashboard.png", width: 1080, height: 222, visualScale: 1.183, checkbox: { x: 0.7852, y: 0.3559, w: 0.0778, h: 0.3739, color: "#00fc79" } },
  "site_recursos:multi_choice:pagamentos_assinaturas": { src: "/assets/builder/site/site_recursos/pagamentos_assinaturas.png", width: 1080, height: 222, visualScale: 1.183, checkbox: { x: 0.7852, y: 0.3559, w: 0.0778, h: 0.3694, color: "#00fd81" } },
  "site_recursos:multi_choice:integracao_outros_sistemas": { src: "/assets/builder/site/site_recursos/integracao_outros_sistemas.png", width: 1080, height: 222, visualScale: 1.183, checkbox: { x: 0.7852, y: 0.3559, w: 0.0778, h: 0.3694, color: "#00fc7b" } },
  "site_situacao:single_choice:criar_do_zero": { src: "/assets/builder/site/site_situacao/criar_do_zero.png", width: 1080, height: 222, visualScale: 1.394 },
  "site_situacao:single_choice:refazer": { src: "/assets/builder/site/site_situacao/refazer.png", width: 1080, height: 222, visualScale: 1.392 },
  "site_situacao:single_choice:melhorar_expandir": { src: "/assets/builder/site/site_situacao/melhorar_expandir.png", width: 1080, height: 222, visualScale: 1.394 },
  "trafego_negocio:single_choice:negocio_local": { src: "/assets/builder/trafego-pago/trafego_negocio/negocio_local.png", width: 1080, height: 222, visualScale: 1.17 },
  "trafego_negocio:single_choice:delivery": { src: "/assets/builder/trafego-pago/trafego_negocio/delivery.png", width: 1080, height: 222, visualScale: 1.17 },
  "trafego_negocio:single_choice:servicos": { src: "/assets/builder/trafego-pago/trafego_negocio/servicos.png", width: 1080, height: 222, visualScale: 1.169 },
  "trafego_negocio:single_choice:ecommerce": { src: "/assets/builder/trafego-pago/trafego_negocio/ecommerce.png", width: 1080, height: 222, visualScale: 1.17 },
  "trafego_negocio:single_choice:evento": { src: "/assets/builder/trafego-pago/trafego_negocio/evento.png", width: 1080, height: 222, visualScale: 1.169 },
  "trafego_negocio:single_choice:outro": { src: "/assets/builder/trafego-pago/trafego_negocio/outro.png", width: 1080, height: 222, visualScale: 1.169 },
  "trafego_destino:single_choice:whatsapp": { src: "/assets/builder/trafego-pago/trafego_destino/whatsapp.png", width: 1080, height: 222, visualScale: 1.187 },
  "trafego_destino:single_choice:site_landing_page": { src: "/assets/builder/trafego-pago/trafego_destino/site_landing_page.png", width: 1080, height: 222, visualScale: 1.189 },
  "trafego_destino:single_choice:loja_virtual": { src: "/assets/builder/trafego-pago/trafego_destino/loja_virtual.png", width: 1080, height: 222, visualScale: 1.189 },
  "trafego_destino:single_choice:delivery_plataforma": { src: "/assets/builder/trafego-pago/trafego_destino/delivery_plataforma.png", width: 1080, height: 222, visualScale: 1.187 },
  "trafego_destino:single_choice:nao_sei": { src: "/assets/builder/trafego-pago/trafego_destino/nao_sei.png", width: 1080, height: 222, visualScale: 1.187 },
  "trafego_experiencia:single_choice:nunca_anunciei": { src: "/assets/builder/trafego-pago/trafego_experiencia/nunca_anunciei.png", width: 1080, height: 222, visualScale: 1.216 },
  "trafego_experiencia:single_choice:anunciei_algumas_vezes": { src: "/assets/builder/trafego-pago/trafego_experiencia/anunciei_algumas_vezes.png", width: 1080, height: 222, visualScale: 1.216 },
  "trafego_experiencia:single_choice:anuncio_atualmente": { src: "/assets/builder/trafego-pago/trafego_experiencia/anuncio_atualmente.png", width: 1080, height: 222, visualScale: 1.219 },
  "trafego_experiencia:single_choice:anunciei_sem_resultado": { src: "/assets/builder/trafego-pago/trafego_experiencia/anunciei_sem_resultado.png", width: 1080, height: 222, visualScale: 1.216 },
  "trafego_investimento:single_choice:ate_1000": { src: "/assets/builder/trafego-pago/trafego_investimento/ate_1000.png", width: 1080, height: 222, visualScale: 1.179 },
  "trafego_investimento:single_choice:de_1000_a_3000": { src: "/assets/builder/trafego-pago/trafego_investimento/de_1000_a_3000.png", width: 1080, height: 222, visualScale: 1.179 },
  "trafego_investimento:single_choice:de_3000_a_5000": { src: "/assets/builder/trafego-pago/trafego_investimento/de_3000_a_5000.png", width: 1080, height: 222, visualScale: 1.178 },
  "trafego_investimento:single_choice:acima_5000": { src: "/assets/builder/trafego-pago/trafego_investimento/acima_5000.png", width: 1080, height: 222, visualScale: 1.178 },
  "trafego_investimento:single_choice:nao_sei": { src: "/assets/builder/trafego-pago/trafego_investimento/nao_sei.png", width: 1080, height: 222, visualScale: 1.179 },
  "design_servico:single_choice:identidade_visual": { src: "/assets/builder/design-social/design_servico/identidade_visual.png", width: 1080, height: 199, visualScale: 1 },
  "design_servico:single_choice:design_redes_sociais": { src: "/assets/builder/design-social/design_servico/design_redes_sociais.png", width: 1080, height: 199, visualScale: 1 },
  "design_servico:single_choice:gestao_social_media": { src: "/assets/builder/design-social/design_servico/gestao_social_media.png", width: 1080, height: 199, visualScale: 1 },
  "design_servico:single_choice:criativos_anuncios": { src: "/assets/builder/design-social/design_servico/criativos_anuncios.png", width: 1080, height: 199, visualScale: 1 },
  "design_servico:single_choice:edicao_video": { src: "/assets/builder/design-social/design_servico/edicao_video.png", width: 1080, height: 199, visualScale: 1 },
  "design_servico:single_choice:quero_combinar_servicos": { src: "/assets/builder/design-social/design_servico/quero_combinar_servicos.png", width: 1080, height: 199, visualScale: 1 },
  "design_servico:multi_choice:identidade_visual": { src: "/assets/builder/design-social/design_servico-pacote/identidade_visual.png", width: 1080, height: 222, visualScale: 1.002, checkbox: { x: 0.0843, y: 0.4099, w: 0.0546, h: 0.2568, color: "#87c5ff" } },
  "design_servico:multi_choice:design_redes_sociais": { src: "/assets/builder/design-social/design_servico-pacote/design_redes_sociais.png", width: 1080, height: 222, visualScale: 1.001, checkbox: { x: 0.0843, y: 0.4189, w: 0.0537, h: 0.2568, color: "#7cc1ff" } },
  "design_servico:multi_choice:gestao_social_media": { src: "/assets/builder/design-social/design_servico-pacote/gestao_social_media.png", width: 1080, height: 222, visualScale: 1.001, checkbox: { x: 0.0843, y: 0.4189, w: 0.0537, h: 0.2523, color: "#89c5ff" } },
  "design_servico:multi_choice:criativos_anuncios": { src: "/assets/builder/design-social/design_servico-pacote/criativos_anuncios.png", width: 1080, height: 222, visualScale: 1.001, checkbox: { x: 0.0843, y: 0.4414, w: 0.0546, h: 0.2568, color: "#85c3fe" } },
  "design_servico:multi_choice:edicao_video": { src: "/assets/builder/design-social/design_servico-pacote/edicao_video.png", width: 1080, height: 222, visualScale: 1.001, checkbox: { x: 0.0843, y: 0.3649, w: 0.0546, h: 0.2568, color: "#84c4ff" } },
  "identidade_situacao:single_choice:sem_identidade": { src: "/assets/builder/design-social/identidade_situacao/sem_identidade.png", width: 1080, height: 222, visualScale: 1.161 },
  "identidade_situacao:single_choice:basico_profissionalizar": { src: "/assets/builder/design-social/identidade_situacao/basico_profissionalizar.png", width: 1080, height: 222, visualScale: 1.162 },
  "identidade_situacao:single_choice:tenho_quero_renovar": { src: "/assets/builder/design-social/identidade_situacao/tenho_quero_renovar.png", width: 1080, height: 222, visualScale: 1.162 },
  "identidade_escopo:single_choice:identidade_essencial": { src: "/assets/builder/design-social/identidade_escopo/identidade_essencial.png", width: 1080, height: 222, visualScale: 1.287 },
  "identidade_escopo:single_choice:identidade_completa": { src: "/assets/builder/design-social/identidade_escopo/identidade_completa.png", width: 1080, height: 222, visualScale: 1.286 },
  "identidade_escopo:single_choice:nao_sei_qual": { src: "/assets/builder/design-social/identidade_escopo/nao_sei_qual.png", width: 1080, height: 222, visualScale: 1.286 },
  "design_formato:single_choice:pacote_artes": { src: "/assets/builder/design-social/design_formato/pacote_artes.png", width: 1080, height: 222, visualScale: 1.206 },
  "design_formato:single_choice:conteudo_recorrente": { src: "/assets/builder/design-social/design_formato/conteudo_recorrente.png", width: 1080, height: 222, visualScale: 1.206 },
  "design_formato:single_choice:campanha_especifica": { src: "/assets/builder/design-social/design_formato/campanha_especifica.png", width: 1080, height: 222, visualScale: 1.207 },
  "marca_identidade:single_choice:sim": { src: "/assets/builder/design-social/marca_identidade/sim.png", width: 1080, height: 222, visualScale: 1.182 },
  "marca_identidade:single_choice:parcialmente": { src: "/assets/builder/design-social/marca_identidade/parcialmente.png", width: 1080, height: 222, visualScale: 1.183 },
  "marca_identidade:single_choice:nao": { src: "/assets/builder/design-social/marca_identidade/nao.png", width: 1080, height: 222, visualScale: 1.183 },
  "social_necessidade:single_choice:planejamento_conteudo": { src: "/assets/builder/design-social/social_necessidade/planejamento_conteudo.png", width: 1080, height: 222, visualScale: 1.152 },
  "social_necessidade:single_choice:criacao_recorrente": { src: "/assets/builder/design-social/social_necessidade/criacao_recorrente.png", width: 1080, height: 222, visualScale: 1.153 },
  "social_necessidade:single_choice:gestao_completa": { src: "/assets/builder/design-social/social_necessidade/gestao_completa.png", width: 1080, height: 222, visualScale: 1.154 },
  "social_necessidade:single_choice:nao_sei": { src: "/assets/builder/design-social/social_necessidade/nao_sei.png", width: 1080, height: 222, visualScale: 1.154 },
  "criativos_formato:single_choice:imagens": { src: "/assets/builder/design-social/criativos_formato/imagens.png", width: 1080, height: 222, visualScale: 1.238 },
  "criativos_formato:single_choice:videos": { src: "/assets/builder/design-social/criativos_formato/videos.png", width: 1080, height: 222, visualScale: 1.238 },
  "criativos_formato:single_choice:imagens_videos": { src: "/assets/builder/design-social/criativos_formato/imagens_videos.png", width: 1080, height: 222, visualScale: 1.238 },
  "criativos_material:single_choice:tenho_tudo": { src: "/assets/builder/design-social/criativos_material/tenho_tudo.png", width: 1080, height: 222, visualScale: 1.192 },
  "criativos_material:single_choice:tenho_parte": { src: "/assets/builder/design-social/criativos_material/tenho_parte.png", width: 1080, height: 222, visualScale: 1.194 },
  "criativos_material:single_choice:preciso_desenvolver": { src: "/assets/builder/design-social/criativos_material/preciso_desenvolver.png", width: 1080, height: 222, visualScale: 1.196 },
  "video_material:single_choice:videos_gravados": { src: "/assets/builder/design-social/video_material/videos_gravados.png", width: 1080, height: 222, visualScale: 1.257 },
  "video_material:single_choice:fotos_imagens": { src: "/assets/builder/design-social/video_material/fotos_imagens.png", width: 1080, height: 222, visualScale: 1.257 },
  "video_material:single_choice:videos_fotos": { src: "/assets/builder/design-social/video_material/videos_fotos.png", width: 1080, height: 222, visualScale: 1.259 },
  "video_material:single_choice:criar_materiais_graficos": { src: "/assets/builder/design-social/video_material/criar_materiais_graficos.png", width: 1080, height: 222, visualScale: 1.257 },
  "video_destino:single_choice:redes_sociais_reels": { src: "/assets/builder/design-social/video_destino/redes_sociais_reels.png", width: 1080, height: 222, visualScale: 1.141 },
  "video_destino:single_choice:anuncios": { src: "/assets/builder/design-social/video_destino/anuncios.png", width: 1080, height: 222, visualScale: 1.143 },
  "video_destino:single_choice:apresentacao_produto_servico": { src: "/assets/builder/design-social/video_destino/apresentacao_produto_servico.png", width: 1080, height: 222, visualScale: 1.143 },
  "video_destino:single_choice:outro": { src: "/assets/builder/design-social/video_destino/outro.png", width: 1080, height: 222, visualScale: 1.141 },
};

/** Chave de asset de uma opção — `id` + `type` da pergunta (ver comentário acima). */
export function getOptionAssetKey(question: Question, optionId: string): string {
  return `${question.id}:${question.type}:${optionId}`;
}

/** Arte da opção, ou `undefined` quando ainda não existe PNG para ela. */
export function getOptionAsset(question: Question, optionId: string): OptionAsset | undefined {
  return OPTION_ASSETS[getOptionAssetKey(question, optionId)];
}

/** Só para os testes de cobertura — nunca usado em runtime. */
export const ALL_OPTION_ASSET_KEYS = Object.keys(OPTION_ASSETS);
