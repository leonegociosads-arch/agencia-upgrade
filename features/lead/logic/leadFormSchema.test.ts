import { describe, expect, it } from "vitest";
import { leadFormSchema } from "./leadFormSchema";

function validData() {
  return {
    name: "João Silva",
    company: "ABC Móveis",
    whatsapp: "(13) 99999-9999",
    email: "joao@teste.com",
    websiteOrInstagram: "@abcmoveis",
  };
}

function issuesFor(data: Record<string, string>) {
  const result = leadFormSchema.safeParse(data);
  if (result.success) return [];
  return result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
}

describe("leadFormSchema", () => {
  it("dados completos e válidos são aceitos e normalizados", () => {
    const result = leadFormSchema.parse(validData());
    expect(result).toEqual({
      name: "João Silva",
      company: "ABC Móveis",
      whatsapp: "5513999999999",
      email: "joao@teste.com",
      websiteOrInstagram: "@abcmoveis",
    });
  });

  it("TESTE 1 (Etapa 12) — formulário vazio não é válido", () => {
    const result = leadFormSchema.safeParse({ name: "", company: "", whatsapp: "", email: "", websiteOrInstagram: "" });
    expect(result.success).toBe(false);
  });

  it("TESTE 2 — nome vazio produz uma mensagem de erro clara, não técnica", () => {
    const issues = issuesFor({ ...validData(), name: "" });
    expect(issues.find((i) => i.path === "name")?.message).toBe("Informe seu nome.");
  });

  it("TESTE 3 — empresa vazia produz o erro correto", () => {
    const issues = issuesFor({ ...validData(), company: "" });
    expect(issues.find((i) => i.path === "company")?.message).toBe("Informe o nome da empresa.");
  });

  it("TESTE 4 — WhatsApp inválido produz o erro correto", () => {
    const issues = issuesFor({ ...validData(), whatsapp: "123" });
    expect(issues.find((i) => i.path === "whatsapp")?.message).toBe("Informe um WhatsApp válido, com DDD.");
  });

  it("TESTE 5 — e-mail inválido produz o erro correto", () => {
    const issues = issuesFor({ ...validData(), email: "não-é-um-email" });
    expect(issues.find((i) => i.path === "email")?.message).toBe("Digite um e-mail válido.");
  });

  it("TESTE 6 — campo opcional vazio: o formulário continua válido", () => {
    const result = leadFormSchema.safeParse({ ...validData(), websiteOrInstagram: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.websiteOrInstagram).toBeUndefined();
  });

  it("aceita website/Instagram em formatos variados sem bloquear o envio", () => {
    for (const value of ["https://empresa.com.br", "empresa.com.br", "https://instagram.com/empresa", "@empresa"]) {
      expect(leadFormSchema.safeParse({ ...validData(), websiteOrInstagram: value }).success).toBe(true);
    }
  });

  it("TESTE 8 — nome e empresa têm espaços externos removidos", () => {
    const result = leadFormSchema.parse({ ...validData(), name: "  João Silva  ", company: "  ABC Móveis  " });
    expect(result.name).toBe("João Silva");
    expect(result.company).toBe("ABC Móveis");
  });

  it("TESTE 9 — e-mail é normalizado de forma segura (trim + minúsculas)", () => {
    const result = leadFormSchema.parse({ ...validData(), email: "  JOAO@TESTE.com  " });
    expect(result.email).toBe("joao@teste.com");
  });

  it("nome só com espaços é tratado como vazio (não aceita 'apenas espaços')", () => {
    const result = leadFormSchema.safeParse({ ...validData(), name: "   " });
    expect(result.success).toBe(false);
  });

  it("não usa mensagem técnica em nenhum caso", () => {
    const issues = issuesFor({ name: "", company: "", whatsapp: "", email: "", websiteOrInstagram: "" });
    for (const issue of issues) {
      expect(issue.message.toLowerCase()).not.toContain("invalid_string");
      expect(issue.message.toLowerCase()).not.toContain("zodissue");
      expect(issue.message.toLowerCase()).not.toContain("validationerror");
    }
  });
});
