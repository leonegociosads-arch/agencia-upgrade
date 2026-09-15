import { describe, expect, it } from "vitest";
import { invalidateAnswersForQuestions, invalidateDependentAnswers } from "./invalidateDependentAnswers";
import type { Question } from "../types";

describe("invalidateDependentAnswers", () => {
  it("remove site_recursos ao mudar site_tipo de ecommerce para site_institucional (Cenário 7, USER-FLOW.md)", () => {
    const answers = {
      site_tipo: "ecommerce",
      site_recursos: ["pagamento_online", "area_cliente"],
      site_situacao: "criar_do_zero",
    };
    const next = invalidateDependentAnswers("site", "site_tipo", {
      ...answers,
      site_tipo: "site_institucional",
    });
    expect(next.site_recursos).toBeUndefined();
    expect(next.site_situacao).toBe("criar_do_zero");
    expect(next.site_tipo).toBe("site_institucional");
  });

  it("não afeta site_recursos quando as opções continuam válidas", () => {
    const next = invalidateDependentAnswers("site", "site_situacao", {
      site_tipo: "ecommerce",
      site_recursos: ["pagamento_online"],
      site_situacao: "refazer",
    });
    expect(next.site_recursos).toEqual(["pagamento_online"]);
  });

  it("remove site_recursos por completo ao mudar site_tipo para 'Ainda não sei'", () => {
    const next = invalidateDependentAnswers("site", "site_tipo", {
      site_tipo: "nao_sei",
      site_recursos: ["catalogo_pedidos"],
    });
    expect(next.site_recursos).toBeUndefined();
  });

  it("Tráfego Pago nunca invalida nada (fluxo fixo sem dependência entre perguntas)", () => {
    const answers = {
      trafego_negocio: "ecommerce",
      trafego_destino: "loja_virtual",
      trafego_experiencia: "nunca_anunciei",
      trafego_investimento: "acima_5000",
    };
    const next = invalidateDependentAnswers("trafego", "trafego_negocio", answers);
    expect(next).toEqual(answers);
  });

  it("Design: mudar design_servico para um único serviço remove respostas de outro combinado anteriormente", () => {
    const answers = {
      design_servico: ["identidade_visual", "design_redes_sociais"],
      identidade_situacao: "sem_identidade",
      identidade_escopo: "identidade_essencial",
      design_formato: "pacote_artes",
      marca_identidade: "nao",
    };
    const next = invalidateDependentAnswers("design", "design_servico", {
      ...answers,
      design_servico: "criativos_anuncios",
    });
    expect(next.identidade_situacao).toBeUndefined();
    expect(next.identidade_escopo).toBeUndefined();
    expect(next.design_formato).toBeUndefined();
    expect(next.marca_identidade).toBeUndefined();
  });

  it("Design: marca_identidade compartilhada permanece ao trocar entre dois serviços que a usam", () => {
    const answers = {
      design_servico: ["design_redes_sociais", "gestao_social_media"],
      design_formato: "pacote_artes",
      marca_identidade: "sim",
      social_necessidade: "gestao_completa",
    };
    const next = invalidateDependentAnswers("design", "design_servico", {
      ...answers,
      design_servico: ["gestao_social_media"],
    });
    expect(next.marca_identidade).toBe("sim");
    expect(next.social_necessidade).toBe("gestao_completa");
    expect(next.design_formato).toBeUndefined();
  });

  it("TESTE 8 (Etapa 9) — dependência em cadeia (A invalida B, B invalidava C): B e C são removidos em uma única passagem, sem loop", () => {
    // Fixture isolada, sem depender dos dados reais do projeto: B só existe se A = "sim";
    // C só existe se B = "sim". Testa `invalidateAnswersForQuestions` diretamente, a função
    // genérica por trás de `invalidateDependentAnswers`.
    const A: Question = {
      id: "a",
      service: "site",
      title: "A",
      type: "single_choice",
      required: true,
      options: [
        { id: "sim", label: "Sim" },
        { id: "nao", label: "Não" },
      ],
    };
    const B: Question = {
      id: "b",
      service: "site",
      title: "B",
      type: "single_choice",
      required: true,
      options: [
        { id: "sim", label: "Sim" },
        { id: "nao", label: "Não" },
      ],
      condition: (answers) => answers.a === "sim",
    };
    const C: Question = {
      id: "c",
      service: "site",
      title: "C",
      type: "single_choice",
      required: true,
      options: [{ id: "qualquer", label: "Qualquer" }],
      condition: (answers) => answers.b === "sim",
    };

    const answers = { a: "sim", b: "sim", c: "qualquer" };
    const next = invalidateAnswersForQuestions([A, B, C], "a", { ...answers, a: "nao" });

    expect(next.a).toBe("nao");
    expect(next.b).toBeUndefined();
    expect(next.c).toBeUndefined();
  });
});
