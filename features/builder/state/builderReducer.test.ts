import { describe, expect, it } from "vitest";
import {
  builderReducer,
  canFinalizeProject,
  hasPendingDraft,
  initialBuilderState,
  isDraftReadyToAutoSave,
  type BuilderAction,
} from "./builderReducer";
import type { BuilderState } from "../types";

function run(state: BuilderState, ...actions: BuilderAction[]): BuilderState {
  return actions.reduce(builderReducer, state);
}

function confirmedEcommerceSite(): BuilderState {
  // Estado confirmado de partida para os testes de edição: Site = E-commerce, já salvo.
  // Em produção, quem chama SAVE_SERVICE_DRAFT ao concluir uma configuração NOVA é a UI
  // (QuestionRenderer), guiada por `isDraftReadyToAutoSave` — o reducer em si não decide isso
  // sozinho, por isso o teste dispara SAVE_SERVICE_DRAFT explicitamente.
  return run(
    initialBuilderState,
    { type: "START_NEW_SERVICE", serviceId: "site" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "site_tipo", value: "ecommerce" },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "site_recursos", value: ["pagamento_online"] },
    { type: "UPDATE_DRAFT_ANSWER", questionId: "site_situacao", value: "criar_do_zero" },
    { type: "SAVE_SERVICE_DRAFT" },
  );
}

describe("isDraftReadyToAutoSave", () => {
  it("verdadeiro para uma configuração NOVA (não edição) assim que o mini-fluxo termina", () => {
    const state = run(
      initialBuilderState,
      { type: "START_NEW_SERVICE", serviceId: "site" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_tipo", value: "nao_sei" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_situacao", value: "criar_do_zero" },
    );
    expect(isDraftReadyToAutoSave(state)).toBe(true);
  });

  it("falso durante uma EDIÇÃO, mesmo com o mini-fluxo completo — exige confirmação explícita", () => {
    const confirmed = confirmedEcommerceSite();
    const editingComplete = run(
      confirmed,
      { type: "START_EDITING_SERVICE", serviceId: "site" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_tipo", value: "ecommerce" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_recursos", value: ["pagamento_online"] },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_situacao", value: "criar_do_zero" },
    );
    expect(isDraftReadyToAutoSave(editingComplete)).toBe(false);
  });
});

describe("builderReducer — configuração de um serviço novo", () => {
  it("selecionar um serviço novo entra em modo de configuração com rascunho vazio", () => {
    const state = run(initialBuilderState, { type: "START_NEW_SERVICE", serviceId: "site" });
    expect(state.activeService).toBe("site");
    expect(state.editingService).toBeNull();
    expect(state.serviceDraft).toEqual({});
  });

  it("concluir as perguntas de um serviço novo salva automaticamente em confirmedServices", () => {
    const state = confirmedEcommerceSite();
    expect(state.confirmedServices.site?.answers.site_tipo).toBe("ecommerce");
    expect(state.confirmedServices.site?.status).toBe("complete");
    expect(state.step).toBe("service_complete");
  });

  it("não duplica a mesma categoria — clicar numa categoria já configurada edita, nunca cria uma segunda", () => {
    const confirmed = confirmedEcommerceSite();
    const editing = run(confirmed, { type: "START_EDITING_SERVICE", serviceId: "site" });
    expect(Object.keys(editing.confirmedServices)).toEqual(["site"]);
    expect(editing.editingService).toBe("site");
  });

  it("projeto vazio: nenhum serviço confirmado até salvar", () => {
    const state = run(initialBuilderState, { type: "START_NEW_SERVICE", serviceId: "site" }, {
      type: "UPDATE_DRAFT_ANSWER",
      questionId: "site_tipo",
      value: "ecommerce",
    });
    expect(state.confirmedServices).toEqual({});
  });

  it("suporta múltiplos serviços confirmados simultaneamente, sem dado cruzado", () => {
    const withSite = confirmedEcommerceSite();
    const withBoth = run(
      withSite,
      { type: "GO_TO_ENTRY" },
      { type: "START_NEW_SERVICE", serviceId: "trafego" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_negocio", value: "ecommerce" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_destino", value: "loja_virtual" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_experiencia", value: "nunca_anunciei" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_investimento", value: "acima_5000" },
      { type: "SAVE_SERVICE_DRAFT" },
    );
    expect(Object.keys(withBoth.confirmedServices).sort()).toEqual(["site", "trafego"]);
    expect(withBoth.confirmedServices.site?.answers.site_tipo).toBe("ecommerce");
    expect(withBoth.confirmedServices.trafego?.answers.trafego_negocio).toBe("ecommerce");
  });

  it("remover um serviço não afeta os demais", () => {
    const withSite = confirmedEcommerceSite();
    const withBoth = run(
      withSite,
      { type: "GO_TO_ENTRY" },
      { type: "START_NEW_SERVICE", serviceId: "trafego" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_negocio", value: "ecommerce" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_destino", value: "loja_virtual" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_experiencia", value: "nunca_anunciei" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_investimento", value: "acima_5000" },
      { type: "SAVE_SERVICE_DRAFT" },
    );
    const afterRemoval = run(withBoth, { type: "REMOVE_SERVICE", serviceId: "trafego" });
    expect(afterRemoval.confirmedServices.trafego).toBeUndefined();
    expect(afterRemoval.confirmedServices.site?.answers.site_tipo).toBe("ecommerce");
  });
});

describe("builderReducer — navegação (Etapa 9)", () => {
  it("TESTE 5 — voltar preserva a resposta anterior, some só a última", () => {
    const state = run(
      initialBuilderState,
      { type: "START_NEW_SERVICE", serviceId: "site" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_tipo", value: "ecommerce" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_recursos", value: ["pagamento_online"] },
      { type: "BACK_DRAFT" },
    );
    expect(state.serviceDraft.site_tipo).toBe("ecommerce");
    expect(state.serviceDraft.site_recursos).toBeUndefined();
  });

  it("TESTE 6 — alterar uma resposta anterior recalcula o caminho seguinte", () => {
    const withRecursos = run(
      initialBuilderState,
      { type: "START_NEW_SERVICE", serviceId: "site" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_tipo", value: "ecommerce" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_recursos", value: ["pagamento_online"] },
    );
    expect(withRecursos.serviceDraft.site_recursos).toEqual(["pagamento_online"]);

    // Volta e muda site_tipo para "Ainda não sei": site_recursos deixa de existir e de fazer
    // sentido; o próximo passo do fluxo passa a ser direto site_situacao.
    const changed = run(
      withRecursos,
      { type: "BACK_DRAFT" },
      { type: "BACK_DRAFT" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_tipo", value: "nao_sei" },
    );
    expect(changed.serviceDraft.site_recursos).toBeUndefined();
  });

  it("TESTE 16 — editar o Site já confirmado não afeta o Tráfego Pago já confirmado", () => {
    const withSite = confirmedEcommerceSite();
    const withBoth = run(
      withSite,
      { type: "GO_TO_ENTRY" },
      { type: "START_NEW_SERVICE", serviceId: "trafego" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_negocio", value: "ecommerce" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_destino", value: "loja_virtual" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_experiencia", value: "nunca_anunciei" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_investimento", value: "acima_5000" },
      { type: "SAVE_SERVICE_DRAFT" },
    );

    const editedSite = run(
      withBoth,
      { type: "START_EDITING_SERVICE", serviceId: "site" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_tipo", value: "site_institucional" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_recursos", value: ["formularios_leads"] },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_situacao", value: "criar_do_zero" },
      { type: "SAVE_SERVICE_DRAFT" },
    );

    expect(editedSite.confirmedServices.site?.answers.site_tipo).toBe("site_institucional");
    expect(editedSite.confirmedServices.trafego?.answers.trafego_negocio).toBe("ecommerce");
    expect(editedSite.confirmedServices.trafego?.answers.trafego_investimento).toBe("acima_5000");
  });
});

describe("builderReducer — edição com rascunho (pendência crítica das Fases 4/6/7)", () => {
  it("TESTE 1 — iniciar edição carrega o draft com os dados confirmados; o confirmado permanece intacto", () => {
    const confirmed = confirmedEcommerceSite();
    const editing = run(confirmed, { type: "START_EDITING_SERVICE", serviceId: "site" });
    expect(editing.serviceDraft.site_tipo).toBe("ecommerce");
    expect(editing.confirmedServices.site?.answers.site_tipo).toBe("ecommerce");
  });

  it("TESTE 2 — alterar o draft não muda o confirmado antes de salvar", () => {
    const confirmed = confirmedEcommerceSite();
    const editing = run(
      confirmed,
      { type: "START_EDITING_SERVICE", serviceId: "site" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_tipo", value: "site_institucional" },
    );
    expect(editing.serviceDraft.site_tipo).toBe("site_institucional");
    expect(editing.confirmedServices.site?.answers.site_tipo).toBe("ecommerce");
  });

  it("TESTE 3 — cancelar a edição descarta o rascunho e mantém o confirmado; editingService volta a neutro", () => {
    const confirmed = confirmedEcommerceSite();
    const cancelled = run(
      confirmed,
      { type: "START_EDITING_SERVICE", serviceId: "site" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_tipo", value: "site_institucional" },
      { type: "CANCEL_SERVICE_DRAFT" },
    );
    expect(cancelled.confirmedServices.site?.answers.site_tipo).toBe("ecommerce");
    expect(cancelled.serviceDraft).toEqual({});
    expect(cancelled.editingService).toBeNull();
    expect(cancelled.activeService).toBeNull();
  });

  it("TESTE 4 — salvar a edição aplica o draft ao confirmado", () => {
    const confirmed = confirmedEcommerceSite();
    const saved = run(
      confirmed,
      { type: "START_EDITING_SERVICE", serviceId: "site" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_tipo", value: "site_institucional" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_recursos", value: ["formularios_leads"] },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_situacao", value: "criar_do_zero" },
      { type: "SAVE_SERVICE_DRAFT" },
    );
    expect(saved.confirmedServices.site?.answers.site_tipo).toBe("site_institucional");
  });

  it("TESTE 5 — resposta dependente é removida do draft, não do confirmado", () => {
    const confirmed = confirmedEcommerceSite();
    const editing = run(
      confirmed,
      { type: "START_EDITING_SERVICE", serviceId: "site" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_tipo", value: "site_institucional" },
    );
    expect(editing.serviceDraft.site_recursos).toBeUndefined();
    expect(editing.confirmedServices.site?.answers.site_recursos).toEqual(["pagamento_online"]);
  });

  it("TESTE 6 — cancelar depois da alteração conserva o confirmado original com product_count (site_recursos) intacto", () => {
    const confirmed = confirmedEcommerceSite();
    const cancelled = run(
      confirmed,
      { type: "START_EDITING_SERVICE", serviceId: "site" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_tipo", value: "site_institucional" },
      { type: "CANCEL_SERVICE_DRAFT" },
    );
    expect(cancelled.confirmedServices.site?.answers.site_tipo).toBe("ecommerce");
    expect(cancelled.confirmedServices.site?.answers.site_recursos).toEqual(["pagamento_online"]);
  });

  it("TESTE 7 — salvar depois da alteração aplica Institucional e remove site_recursos de e-commerce", () => {
    const confirmed = confirmedEcommerceSite();
    const saved = run(
      confirmed,
      { type: "START_EDITING_SERVICE", serviceId: "site" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_tipo", value: "site_institucional" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_recursos", value: ["formularios_leads"] },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_situacao", value: "criar_do_zero" },
      { type: "SAVE_SERVICE_DRAFT" },
    );
    expect(saved.confirmedServices.site?.answers.site_tipo).toBe("site_institucional");
    expect(saved.confirmedServices.site?.answers.site_recursos).toEqual(["formularios_leads"]);
  });

  it("editar não cria uma cópia mutável compartilhada — alterar o draft não deve alterar o array já confirmado", () => {
    const confirmed = confirmedEcommerceSite();
    const editing = run(confirmed, { type: "START_EDITING_SERVICE", serviceId: "site" });
    (editing.serviceDraft.site_recursos as string[]).push("area_cliente");
    expect(confirmed.confirmedServices.site?.answers.site_recursos).toEqual(["pagamento_online"]);
  });

  it("EDIT_DRAFT_FIELD reabre uma pergunta específica do rascunho, com cascata de invalidação", () => {
    const confirmed = confirmedEcommerceSite();
    const editing = run(confirmed, { type: "START_EDITING_SERVICE", serviceId: "site" });
    // Antes de reabrir: rascunho completo, nenhuma pergunta pendente.
    expect(editing.serviceDraft.site_tipo).toBe("ecommerce");
    const reopened = run(editing, { type: "EDIT_DRAFT_FIELD", questionId: "site_tipo" });
    expect(reopened.serviceDraft.site_tipo).toBeUndefined();
    // site_recursos dependia de site_tipo — cai junto ao reabrir a pergunta da qual depende.
    expect(reopened.serviceDraft.site_recursos).toBeUndefined();
    expect(reopened.serviceDraft.site_situacao).toBe("criar_do_zero");
  });

  it("salvar sem responder tudo não altera o confirmado e registra um erro", () => {
    const confirmed = confirmedEcommerceSite();
    const attempt = run(
      confirmed,
      { type: "START_EDITING_SERVICE", serviceId: "site" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "site_tipo", value: "site_institucional" },
      { type: "SAVE_SERVICE_DRAFT" },
    );
    expect(attempt.confirmedServices.site?.answers.site_tipo).toBe("ecommerce");
    expect(attempt.error).not.toBeNull();
  });
});

describe("Meu Upgrade — finalização e remoção durante edição (Etapa 10)", () => {
  it("TESTE 11 — projeto vazio: canFinalizeProject é falso e FINALIZE_PROJECT não muda o estado", () => {
    expect(canFinalizeProject(initialBuilderState)).toBe(false);
    const attempt = run(initialBuilderState, { type: "FINALIZE_PROJECT" });
    expect(attempt.step).toBe("choosing_service");
  });

  it("TESTE 12 — com um serviço confirmado, FINALIZE_PROJECT avança para 'reviewing' (PROJECT_REVIEW)", () => {
    const confirmed = confirmedEcommerceSite();
    expect(canFinalizeProject(confirmed)).toBe(true);
    const reviewing = run(confirmed, { type: "FINALIZE_PROJECT" });
    expect(reviewing.step).toBe("reviewing");
  });

  it("TESTE 13 — draft de edição ativo: FINALIZE_PROJECT nunca ignora silenciosamente a alteração pendente", () => {
    const confirmed = confirmedEcommerceSite();
    const editing = run(confirmed, { type: "START_EDITING_SERVICE", serviceId: "site" });
    expect(hasPendingDraft(editing)).toBe(true);

    const attempt = run(editing, { type: "FINALIZE_PROJECT" });
    expect(attempt.step).not.toBe("reviewing");
    expect(attempt.activeService).toBe("site"); // nada foi descartado nem finalizado por conta própria.
  });

  it("uma configuração NOVA sem nenhuma resposta ainda não conta como rascunho pendente (nada a perder)", () => {
    const withOneConfirmed = confirmedEcommerceSite();
    const startingSecond = run(withOneConfirmed, { type: "GO_TO_ENTRY" }, { type: "START_NEW_SERVICE", serviceId: "trafego" });
    expect(hasPendingDraft(startingSecond)).toBe(false);
  });

  it("logo após uma configuração NOVA salvar sozinha (tela de conclusão), não há mais rascunho pendente", () => {
    const justSaved = confirmedEcommerceSite();
    // `activeService` continua "site" aqui (para a tela de conclusão saber o que mostrar), mas o
    // rascunho já foi limpo pelo próprio SAVE_SERVICE_DRAFT — não deve travar o "Finalizar".
    expect(justSaved.activeService).toBe("site");
    expect(hasPendingDraft(justSaved)).toBe(false);
    const reviewing = run(justSaved, { type: "FINALIZE_PROJECT" });
    expect(reviewing.step).toBe("reviewing");
  });

  it("draft de uma configuração NOVA com pelo menos uma resposta já dada impede FINALIZE_PROJECT", () => {
    const withOneConfirmed = confirmedEcommerceSite();
    const startingSecond = run(
      withOneConfirmed,
      { type: "GO_TO_ENTRY" },
      { type: "START_NEW_SERVICE", serviceId: "trafego" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_negocio", value: "servicos" },
    );
    expect(hasPendingDraft(startingSecond)).toBe(true);
    const attempt = run(startingSecond, { type: "FINALIZE_PROJECT" });
    expect(attempt.step).not.toBe("reviewing");
  });

  it("remoção durante edição — remover o serviço que está sendo editado agora limpa o rascunho órfão e volta a um estado seguro", () => {
    const confirmed = confirmedEcommerceSite();
    const editing = run(confirmed, {
      type: "START_EDITING_SERVICE",
      serviceId: "site",
    });
    expect(editing.activeService).toBe("site");

    const afterRemoval = run(editing, { type: "REMOVE_SERVICE", serviceId: "site" });
    expect(afterRemoval.confirmedServices.site).toBeUndefined();
    expect(afterRemoval.activeService).toBeNull();
    expect(afterRemoval.editingService).toBeNull();
    expect(afterRemoval.serviceDraft).toEqual({});
    expect(afterRemoval.step).toBe("choosing_service");
  });

  it("remover um serviço diferente do que está em edição não afeta o rascunho em andamento", () => {
    const withSite = confirmedEcommerceSite();
    const withBoth = run(
      withSite,
      { type: "GO_TO_ENTRY" },
      { type: "START_NEW_SERVICE", serviceId: "trafego" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_negocio", value: "servicos" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_destino", value: "whatsapp" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_experiencia", value: "nunca_anunciei" },
      { type: "UPDATE_DRAFT_ANSWER", questionId: "trafego_investimento", value: "ate_1000" },
      { type: "SAVE_SERVICE_DRAFT" },
    );
    const editingSite = run(withBoth, { type: "START_EDITING_SERVICE", serviceId: "site" });
    const afterRemovingTrafego = run(editingSite, { type: "REMOVE_SERVICE", serviceId: "trafego" });
    expect(afterRemovingTrafego.confirmedServices.trafego).toBeUndefined();
    // O rascunho de edição do Site continua intacto — remover outro serviço não o afeta.
    expect(afterRemovingTrafego.activeService).toBe("site");
    expect(afterRemovingTrafego.editingService).toBe("site");
    expect(afterRemovingTrafego.serviceDraft.site_tipo).toBe("ecommerce");
  });
});
