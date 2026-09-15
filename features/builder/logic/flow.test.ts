import { describe, expect, it } from "vitest";
import { estimateTotalSteps, getNextQuestion, isServiceComplete } from "./flow";

describe("flow: Site", () => {
  it("pede site_tipo primeiro", () => {
    expect(getNextQuestion("site", {})?.id).toBe("site_tipo");
  });

  it("pula site_recursos quando site_tipo = nao_sei", () => {
    expect(getNextQuestion("site", { site_tipo: "nao_sei" })?.id).toBe("site_situacao");
    expect(estimateTotalSteps("site", { site_tipo: "nao_sei" })).toBe(2);
  });

  it("pede site_recursos para os demais tipos", () => {
    expect(getNextQuestion("site", { site_tipo: "ecommerce" })?.id).toBe("site_recursos");
    expect(estimateTotalSteps("site", { site_tipo: "ecommerce" })).toBe(3);
  });

  it("está completo com as 3 perguntas respondidas", () => {
    const answers = { site_tipo: "ecommerce", site_recursos: ["pagamento_online"], site_situacao: "criar_do_zero" };
    expect(getNextQuestion("site", answers)).toBeNull();
    expect(isServiceComplete("site", answers)).toBe(true);
  });

  it("TESTE 4 (Etapa 9) — responder a primeira pergunta avança para a pergunta correta seguinte", () => {
    expect(getNextQuestion("site", { site_tipo: "ecommerce" })?.id).toBe("site_recursos");
    expect(getNextQuestion("site", { site_tipo: "nao_sei" })?.id).toBe("site_situacao");
  });

  it("TESTE 10 (Etapa 9) — pergunta obrigatória sem resposta não permite concluir o serviço", () => {
    expect(isServiceComplete("site", { site_tipo: "ecommerce", site_recursos: ["pagamento_online"] })).toBe(false);
  });
});

describe("flow: Tráfego Pago", () => {
  it("tem exatamente 4 perguntas fixas, sempre", () => {
    expect(estimateTotalSteps("trafego", {})).toBe(4);
    expect(getNextQuestion("trafego", {})?.id).toBe("trafego_negocio");
    expect(getNextQuestion("trafego", { trafego_negocio: "ecommerce" })?.id).toBe("trafego_destino");
    expect(
      getNextQuestion("trafego", {
        trafego_negocio: "ecommerce",
        trafego_destino: "loja_virtual",
        trafego_experiencia: "nunca_anunciei",
      })?.id,
    ).toBe("trafego_investimento");
  });

  it("está completo só depois das 4 respostas", () => {
    const answers = {
      trafego_negocio: "ecommerce",
      trafego_destino: "loja_virtual",
      trafego_experiencia: "nunca_anunciei",
    };
    expect(isServiceComplete("trafego", answers)).toBe(false);
    expect(isServiceComplete("trafego", { ...answers, trafego_investimento: "acima_5000" })).toBe(true);
  });

  it("TESTE 9 (Etapa 9) — a última pergunta respondida marca o serviço como completo", () => {
    const answers = {
      trafego_negocio: "ecommerce",
      trafego_destino: "loja_virtual",
      trafego_experiencia: "nunca_anunciei",
      trafego_investimento: "acima_5000",
    };
    expect(getNextQuestion("trafego", answers)).toBeNull();
    expect(isServiceComplete("trafego", answers)).toBe(true);
  });
});

describe("flow: Design/Social Media", () => {
  it("pede design_servico primeiro", () => {
    expect(getNextQuestion("design", {})?.id).toBe("design_servico");
  });

  it("mini-fluxo de um único serviço tem 3 perguntas no total", () => {
    expect(estimateTotalSteps("design", { design_servico: "identidade_visual" })).toBe(3);
  });

  it("resolve o mini-fluxo de Identidade Visual passo a passo", () => {
    let answers: Record<string, string | string[]> = { design_servico: "identidade_visual" };
    expect(getNextQuestion("design", answers)?.id).toBe("identidade_situacao");
    answers = { ...answers, identidade_situacao: "sem_identidade" };
    expect(getNextQuestion("design", answers)?.id).toBe("identidade_escopo");
    answers = { ...answers, identidade_escopo: "identidade_essencial" };
    expect(getNextQuestion("design", answers)).toBeNull();
  });

  it("'Montar um pacote' encadeia os mini-fluxos escolhidos sem repetir marca_identidade", () => {
    let answers: Record<string, string | string[]> = { design_servico: "quero_combinar_servicos" };
    const combo = getNextQuestion("design", answers);
    expect(combo?.type).toBe("multi_choice");

    answers = { design_servico: ["design_redes_sociais", "gestao_social_media"] };
    expect(getNextQuestion("design", answers)?.id).toBe("design_formato");
    answers = { ...answers, design_formato: "pacote_artes" };
    expect(getNextQuestion("design", answers)?.id).toBe("marca_identidade");
    answers = { ...answers, marca_identidade: "sim" };
    // marca_identidade não é perguntada de novo — vai direto para o campo próprio de GSM.
    expect(getNextQuestion("design", answers)?.id).toBe("social_necessidade");
    answers = { ...answers, social_necessidade: "gestao_completa" };
    expect(getNextQuestion("design", answers)).toBeNull();
  });
});
