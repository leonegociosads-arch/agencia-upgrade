import { notFound } from "next/navigation";
import SectionContainer from "@/features/design-system/components/SectionContainer";
import Heading from "@/features/design-system/components/Heading";
import Text from "@/features/design-system/components/Text";
import Button from "@/features/design-system/components/Button";
import Badge from "@/features/design-system/components/Badge";
import Card from "@/features/design-system/components/Card";
import FormField from "@/features/design-system/components/FormField";
import Input from "@/features/design-system/components/Input";
import Textarea from "@/features/design-system/components/Textarea";
import Select from "@/features/design-system/components/Select";
import Checkbox from "@/features/design-system/components/Checkbox";
import Radio from "@/features/design-system/components/Radio";
import Alert from "@/features/design-system/components/Alert";
import EmptyState from "@/features/design-system/components/EmptyState";
import Spinner from "@/features/design-system/components/Spinner";
import styles from "./page.module.css";

const COLOR_TOKENS = [
  { name: "bg", varName: "--ds-color-bg" },
  { name: "bg-secondary", varName: "--ds-color-bg-secondary" },
  { name: "surface", varName: "--ds-color-surface" },
  { name: "surface-elevated", varName: "--ds-color-surface-elevated" },
  { name: "border", varName: "--ds-color-border" },
  { name: "accent", varName: "--ds-color-accent" },
  { name: "success", varName: "--ds-color-success" },
  { name: "warning", varName: "--ds-color-warning" },
  { name: "error", varName: "--ds-color-error" },
  { name: "info", varName: "--ds-color-info" },
];

const SPACING_TOKENS = ["1", "2", "3", "4", "6", "8", "12", "16", "24"];

/**
 * Showcase interno do Design System (Fase 18, Seção 18) — só para desenvolvimento/validação, nunca
 * linkado na navegação pública. Bloqueado em produção (`notFound()`) porque é uma ferramenta
 * interna, não uma página real do site (`docs/DESIGN-SYSTEM.md`, Seção "Showcase").
 */
export default function DesignSystemShowcasePage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div className={styles.page} data-theme="dark">
      <SectionContainer as="main" className={styles.stack}>
        <header className={styles.stack}>
          <Badge tone="accent">Showcase interno — não indexado</Badge>
          <Heading variant="display">Design System — Agência Upgrade</Heading>
          <Text size="lg" color="secondary">
            Fundação visual da Fase 18: tokens e componentes-base. Nenhuma tela real do site usa
            isto ainda — ver <code>docs/DESIGN-SYSTEM.md</code>.
          </Text>
        </header>

        <section className={styles.stack}>
          <Heading variant="h2">Cores</Heading>
          <div className={styles.swatchGrid}>
            {COLOR_TOKENS.map((token) => (
              <div key={token.varName} className={styles.swatchCard}>
                <div className={styles.swatch} style={{ background: `var(${token.varName})` }} />
                <Text size="sm" weight="semibold">
                  {token.name}
                </Text>
                <Text size="caption" color="secondary">
                  {token.varName}
                </Text>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.stack}>
          <Heading variant="h2">Tipografia</Heading>
          <div className={styles.stack}>
            <Heading variant="display">Display</Heading>
            <Heading variant="h1">Heading H1</Heading>
            <Heading variant="h2">Heading H2</Heading>
            <Heading variant="h3">Heading H3</Heading>
            <Text size="lg">Body Large — parágrafo de destaque, para abertura de seção.</Text>
            <Text size="body">Body — texto corrido padrão, usado na maior parte do conteúdo.</Text>
            <Text size="sm" color="secondary">
              Body Small — detalhes e legendas.
            </Text>
            <Text size="label">Label — rótulos de campo</Text>
            <Text size="caption" color="secondary">
              Caption — metadados, datas, contagens.
            </Text>
          </div>
        </section>

        <section className={styles.stack}>
          <Heading variant="h2">Espaçamento</Heading>
          <div className={styles.stack}>
            {SPACING_TOKENS.map((token) => (
              <div key={token} className={styles.spacingRow}>
                <Text size="caption" color="secondary" className={styles.spacingLabel}>
                  --ds-space-{token}
                </Text>
                <div className={styles.spacingBar} style={{ width: `var(--ds-space-${token})` }} />
              </div>
            ))}
          </div>
        </section>

        <section className={styles.stack}>
          <Heading variant="h2">Botões</Heading>
          <div className={styles.row}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
          <div className={styles.row}>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className={styles.row}>
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
          </div>
        </section>

        <section className={styles.stack}>
          <Heading variant="h2">Badges</Heading>
          <div className={styles.row}>
            <Badge tone="neutral">Neutral</Badge>
            <Badge tone="accent">Accent</Badge>
            <Badge tone="success">Success</Badge>
            <Badge tone="warning">Warning</Badge>
            <Badge tone="error">Error</Badge>
            <Badge tone="info">Info</Badge>
          </div>
        </section>

        <section className={styles.stack}>
          <Heading variant="h2">Inputs</Heading>
          <div className={styles.formGrid}>
            <FormField label="Nome" htmlFor="ds-name" hint="Como aparece no seu documento.">
              <Input id="ds-name" placeholder="Seu nome" />
            </FormField>
            <FormField label="E-mail" htmlFor="ds-email" error="Digite um e-mail válido.">
              <Input id="ds-email" type="email" defaultValue="nao-e-um-email" />
            </FormField>
            <FormField label="Empresa" htmlFor="ds-company-disabled">
              <Input id="ds-company-disabled" disabled defaultValue="Campo desabilitado" />
            </FormField>
            <FormField label="Status" htmlFor="ds-status">
              <Select id="ds-status" defaultValue="new">
                <option value="new">Novo</option>
                <option value="contacted">Contatado</option>
                <option value="won">Fechado</option>
              </Select>
            </FormField>
            <FormField label="Mensagem" htmlFor="ds-message" hint="Opcional.">
              <Textarea id="ds-message" placeholder="Conte mais sobre o projeto" />
            </FormField>
          </div>
          <div className={styles.row}>
            <Checkbox id="ds-check" label="Aceito os termos" />
            <Radio id="ds-radio-1" name="ds-radio" label="Opção 1" defaultChecked />
            <Radio id="ds-radio-2" name="ds-radio" label="Opção 2" />
          </div>
        </section>

        <section className={styles.stack}>
          <Heading variant="h2">Cards e estados de seleção</Heading>
          <div className={styles.cardGrid}>
            <Card>
              <Text weight="semibold">Card padrão</Text>
              <Text size="sm" color="secondary">
                Superfície base, borda sutil.
              </Text>
            </Card>
            <Card elevated>
              <Text weight="semibold">Card elevado</Text>
              <Text size="sm" color="secondary">
                Superfície elevada, com sombra.
              </Text>
            </Card>
            <Card selected>
              <Text weight="semibold">Card selecionado</Text>
              <Text size="sm" color="secondary">
                Borda + fundo + marca de check — nunca só cor.
              </Text>
            </Card>
          </div>
        </section>

        <section className={styles.stack}>
          <Heading variant="h2">Feedback</Heading>
          <div className={styles.stack}>
            <Alert tone="success">Projeto enviado com sucesso.</Alert>
            <Alert tone="warning">Revise os dados antes de continuar.</Alert>
            <Alert tone="error">Não foi possível enviar. Tente novamente.</Alert>
            <Alert tone="info">Seus dados ficam salvos automaticamente.</Alert>
            <div className={styles.row}>
              <Spinner />
              <Text size="sm" color="secondary">
                Loading
              </Text>
            </div>
            <EmptyState
              title="Nenhum projeto ainda"
              description="Assim que um projeto for configurado, ele aparece aqui."
              action={<Button size="sm">Começar</Button>}
            />
          </div>
        </section>
      </SectionContainer>
    </div>
  );
}
