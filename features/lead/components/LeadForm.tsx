"use client";

import { useEffect, useRef } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBuilder } from "@/features/builder/state/BuilderContext";
import { buildProjectSnapshot } from "@/features/builder/logic/buildProjectSnapshot";
import { useLeadDraft } from "../state/LeadContext";
import { leadFormSchema, type LeadFormSchemaInput, type LeadFormSchemaOutput } from "../logic/leadFormSchema";
import { buildLeadPayload } from "../logic/buildLeadPayload";
import { submitLead } from "../actions/submitLead";
import { trackEvent, trackFunnelMilestone } from "@/lib/analytics/trackEvent";
import Heading from "@/features/design-system/components/Heading";
import Text from "@/features/design-system/components/Text";
import Button from "@/features/design-system/components/Button";
import { useSceneNavigation } from "@/features/design-system/motion/SceneTransition";
import { playSound } from "@/features/design-system/motion/sound";
import LeadField from "./LeadField";
import styles from "./LeadForm.module.css";

/**
 * Formulário de contato (WF-10) — a continuação natural do Builder, não um formulário corporativo
 * separado. Usa React Hook Form + Zod (`docs/TECHNICAL-ARCHITECTURE.md`, Seção 18 — decisão já
 * aprovada na Fase 6, especificamente para este formulário).
 *
 * `mode: "onBlur"` (validar ao sair do campo) cobre "nunca mostra erro antes de qualquer
 * interação" e "valida ao sair do campo ou ao tentar enviar". Para "remover a mensagem assim que o
 * valor fica válido" (sem esperar um novo blur), cada campo revalida explicitamente via
 * `trigger(field)` a cada mudança — só quando aquele campo já tem um erro exibido (nunca antes da
 * primeira interação). Isso substitui o `reValidateMode: "onChange"` padrão do RHF, que nesta
 * combinação de versões (RHF 7 + zodResolver + Zod 4) não estava revalidando de forma confiável em
 * testes automatizados; `trigger()` funciona de forma determinística nos dois ambientes.
 */
export default function LeadForm() {
  const { state, startSubmitLead, submitLeadSuccess, submitLeadFailure, backToReview } = useBuilder();
  const { leadDraft, updateLeadDraft, idempotencyKey } = useLeadDraft();
  const { markBackward } = useSceneNavigation();
  /** Honeypot (Etapa 29, Seção 38) — campo invisível fora do fluxo do React Hook Form/Zod de
   * propósito: nunca deve aparecer em `errors`/mensagens de validação, nem ser persistido em
   * lugar nenhum. Só um `ref` lido no momento do envio; ler via RHF (`register`) faria o valor
   * viajar pelo `LeadFormSchemaOutput` sem necessidade. */
  const honeypotRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<LeadFormSchemaInput, unknown, LeadFormSchemaOutput>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: leadDraft,
    mode: "onBlur",
  });

  useEffect(() => {
    // `contact_started` (Fase 17) — `BuilderShell` renderiza este MESMO componente para
    // `step === "contact"` e `"submitting"` (nunca desmonta entre os dois, ver
    // `features/builder/components/BuilderShell.tsx`), então este efeito de montagem dispara uma
    // vez ao entrar na etapa de contato, nunca de novo só por enviar. `trackFunnelMilestone`
    // garante que só conta uma vez por sessão, mesmo que o usuário volte ao Resumo e entre em
    // contato de novo depois.
    trackFunnelMilestone("contact_started", {});
  }, []);

  function withLiveErrorClearing(field: FieldPath<LeadFormSchemaInput>) {
    const registration = register(field);
    return {
      ...registration,
      onChange: (event: Parameters<typeof registration.onChange>[0]) => {
        const result = registration.onChange(event);
        // Sincroniza cada tecla digitada com o LeadContext (Fase 14) — é o que permite ao hook de
        // persistência de sessão (features/builder/state/useBuilderSessionPersistence.ts) salvar
        // o progresso do formulário mesmo antes de o usuário navegar para outra tela ou enviar.
        persistDraft();
        if (errors[field]) {
          void trigger(field);
        }
        return result;
      },
    };
  }

  const isSubmitting = state.step === "submitting";

  function persistDraft() {
    updateLeadDraft(getValues());
  }

  function handleBackToProject() {
    persistDraft();
    markBackward();
    backToReview();
  }

  async function onValid(contact: LeadFormSchemaOutput, honeypotValue: string | undefined) {
    if (state.step !== "contact") return; // já enviando — ignora um segundo disparo
    persistDraft();
    startSubmitLead();

    const snapshot = buildProjectSnapshot(state.confirmedServices);
    const payload = buildLeadPayload(contact, snapshot, idempotencyKey);
    const serviceCount = Object.keys(state.confirmedServices).length;

    // `lead_submit_attempted` (Fase 17) — não gated por sessão: cada tentativa (inclusive um
    // retry depois de uma falha) é um evento próprio.
    trackEvent("lead_submit_attempted", {});

    const result = await submitLead(payload, honeypotValue);
    if (result.ok) {
      // `lead_submitted` (Fase 17) — só depois de uma persistência real bem-sucedida (nunca antes,
      // nunca otimisticamente). `idempotencyKey` permite associar esta sessão anônima ao projeto
      // convertido depois, sem devolver nenhum id do lead ao cliente (`lib/analytics/events.ts`).
      trackFunnelMilestone("lead_submitted", { serviceCount, idempotencyKey });
      submitLeadSuccess();
    } else {
      trackEvent("lead_submit_failed", { errorCategory: result.errorCategory ?? "unknown" });
      submitLeadFailure(result.message ?? "Não conseguimos enviar agora. Seus dados continuam preenchidos.");
    }
  }

  return (
    <div className={styles.wrapper}>
      <Heading variant="h2" as="h2" className={styles.title}>
        Deixe seus dados para analisarmos seu projeto.
      </Heading>

      <form
        className={styles.form}
        // Não passamos `handleSubmit(onValid)` diretamente: `honeypotRef.current` só pode ser lido
        // dentro de um handler de evento de verdade (ESLint `react-hooks/refs`), nunca dentro de
        // `onValid` (uma função comum, passada como argumento para `handleSubmit` — o linter não
        // consegue provar que ela só roda depois do render). Este wrapper inline É o handler real;
        // lê o ref aqui e repassa como argumento comum para `onValid`.
        onSubmit={(event) => {
          const honeypotValue = honeypotRef.current?.value;
          return handleSubmit((contact) => onValid(contact, honeypotValue))(event);
        }}
        noValidate
      >
        {/* Honeypot (Etapa 29, Seção 38): fora da tela via posicionamento (nunca `display: none`
         * ou `visibility: hidden`, que alguns leitores de tela/bots já sabem detectar e ignorar
         * igual), `tabIndex={-1}` para nunca receber foco por Tab, `aria-hidden` para nunca ser
         * anunciado, `autoComplete="off"` para navegadores não pré-preencherem por engano. Uma
         * pessoa nunca vê nem alcança este campo; só um preenchimento automatizado (bot) o atinge. */}
        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="company_website">Deixe este campo em branco</label>
          <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" ref={honeypotRef} />
        </div>

        <fieldset className={styles.fieldset} disabled={isSubmitting}>
          <LeadField
            id="name"
            label="Nome"
            registration={withLiveErrorClearing("name")}
            error={errors.name?.message}
            autoComplete="name"
          />
          <LeadField
            id="company"
            label="Empresa"
            registration={withLiveErrorClearing("company")}
            error={errors.company?.message}
            autoComplete="organization"
          />
          <LeadField
            id="whatsapp"
            label="WhatsApp"
            type="tel"
            inputMode="tel"
            registration={withLiveErrorClearing("whatsapp")}
            error={errors.whatsapp?.message}
            autoComplete="tel"
          />
          <LeadField
            id="email"
            label="E-mail"
            type="email"
            registration={withLiveErrorClearing("email")}
            error={errors.email?.message}
            autoComplete="email"
          />
          <LeadField
            id="websiteOrInstagram"
            label="Site ou Instagram"
            optional
            registration={withLiveErrorClearing("websiteOrInstagram")}
            error={errors.websiteOrInstagram?.message}
            autoComplete="url"
          />

          <Text as="p" size="caption" color="secondary" className={styles.privacyNote}>
            Ao enviar, você autoriza a Upgrade a utilizar estes dados para entrar em contato sobre este projeto.
          </Text>

          <div className={styles.actions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                playSound("ui_press");
                handleBackToProject();
              }}
            >
              Voltar ao projeto
            </Button>
            <Button type="submit" onClick={() => playSound("ui_press")}>
              {isSubmitting ? "Enviando..." : "Enviar meu projeto"}
            </Button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
