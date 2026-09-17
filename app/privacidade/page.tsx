import type { Metadata } from "next";
import SiteHeader from "@/features/site/components/SiteHeader";
import SiteFooter from "@/features/site/components/SiteFooter";
import SectionContainer from "@/features/design-system/components/SectionContainer";
import Heading from "@/features/design-system/components/Heading";
import Text from "@/features/design-system/components/Text";
import PrivacyPreferencesButton from "@/features/privacy/components/PrivacyPreferencesButton";
import styles from "./page.module.css";

/** Indexável (Fase SEO, Seção 15 do briefing: "pode ser indexável se pública... não precisa ser
 * otimizada para ranking") — só título/descrição/canonical claros, nada além disso. */
export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como a Agência Upgrade coleta, usa e protege dados pessoais no site e no Builder.",
  alternates: { canonical: "/privacidade" },
};

/** Data em que este texto foi escrito/revisado pela última vez (Seção 25 do briefing: "última
 * atualização") — nunca uma data automática (`new Date()`), que mudaria a cada build sem o
 * CONTEÚDO ter mudado de verdade (mesma lição já registrada para `app/sitemap.ts` na Fase SEO). */
const LAST_UPDATED = "16 de setembro de 2026";

/**
 * Política de Privacidade real (Fase LGPD) — substitui o placeholder da Etapa 8. Ver
 * `docs/PRIVACY-LGPD.md` para o racional completo por trás de cada seção (inventário de dados,
 * base legal, retenção) e o aviso "esta implementação técnica não substitui revisão jurídica
 * profissional" (Seção 84 do briefing) — o aviso vive na documentação interna, não nesta página
 * pública, para não passar a impressão de uma política inacabada a quem está lendo.
 *
 * Nenhum dado de identificação formal da empresa (CNPJ, endereço registrado) aparece aqui — não
 * existem no projeto ainda (briefing, Seção 26: "não inventar"); ver `docs/PRIVACY-LGPD.md`,
 * Seção "Controlador", para o registro dessa pendência.
 */
export default function PrivacidadePage() {
  return (
    <>
      <SiteHeader />
      <SectionContainer as="main" className={styles.main}>
        <Heading variant="h1" as="h1">
          Política de Privacidade
        </Heading>
        <Text color="secondary" className={styles.lead}>
          Este texto explica quais dados a Agência Upgrade coleta quando você visita este site ou
          usa o Builder, para que servem, com quem podem ser compartilhados e quais direitos você
          tem sobre eles.
        </Text>
        <Text as="p" size="sm" color="disabled">
          Última atualização: {LAST_UPDATED}.
        </Text>

        <section className={styles.section}>
          <Heading variant="h2">Quem trata os seus dados</Heading>
          <Text as="p" color="secondary">
            A Agência Upgrade é responsável pelas decisões sobre os dados pessoais tratados neste
            site e no Builder.
          </Text>
        </section>

        <section className={styles.section}>
          <Heading variant="h2">Quais dados coletamos</Heading>
          <Text as="p" color="secondary">
            Coletamos só o que é necessário para o Builder funcionar e para dar continuidade ao seu
            contato comercial:
          </Text>
          <ul className={styles.list}>
            <li>
              <Text as="span" weight="semibold">
                Dados de contato (quando você envia um projeto):
              </Text>{" "}
              nome, empresa, WhatsApp, e-mail e, se você informar, site ou Instagram.
            </li>
            <li>
              <Text as="span" weight="semibold">
                Dados do projeto:
              </Text>{" "}
              os serviços escolhidos (site, tráfego pago, design) e as respostas dadas nas
              perguntas do Builder.
            </li>
            <li>
              <Text as="span" weight="semibold">
                Dados técnicos de sessão:
              </Text>{" "}
              um identificador anônimo gerado no seu navegador (para lembrar seu progresso no
              Builder e evitar contar a mesma visita duas vezes), a página de entrada e, se você
              chegou por um link de campanha, os parâmetros dessa campanha (UTM).
            </li>
            <li>
              <Text as="span" weight="semibold">
                Uso interno, depois do envio:
              </Text>{" "}
              uma pontuação de priorização comercial (ver “Decisões automatizadas” abaixo), status
              do atendimento e anotações da nossa equipe — nunca visíveis para você.
            </li>
          </ul>
          <Text as="p" color="secondary">
            Não pedimos nem usamos dados sensíveis (saúde, religião, orientação sexual, biometria,
            opinião política, etc.) — nada no Builder precisa disso.
          </Text>
        </section>

        <section className={styles.section}>
          <Heading variant="h2">Para que usamos esses dados</Heading>
          <ul className={styles.list}>
            <li>WhatsApp e e-mail: para entrar em contato sobre o seu projeto.</li>
            <li>Nome e empresa: para personalizar esse contato e entender o contexto comercial.</li>
            <li>Serviços e respostas do Builder: para preparar uma proposta compatível com o que você precisa.</li>
            <li>Identificador de sessão e origem (UTM): para entender, de forma agregada, quais canais trazem visitantes — nunca para identificar você pessoalmente fora do seu próprio atendimento.</li>
            <li>Pontuação interna: para a nossa equipe priorizar o atendimento de projetos com maior potencial.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <Heading variant="h2">Base legal</Heading>
          <ul className={styles.list}>
            <li>
              <Text as="span" weight="semibold">
                Contato e dados do projeto:
              </Text>{" "}
              execução de procedimentos preliminares a um possível contrato — você mesmo inicia
              esse contato ao preencher e enviar o Builder.
            </li>
            <li>
              <Text as="span" weight="semibold">
                Sessão do Builder (armazenamento local):
              </Text>{" "}
              legítimo interesse/necessidade funcional — sem isso, você perderia seu progresso ao
              atualizar a página.
            </li>
            <li>
              <Text as="span" weight="semibold">
                Analytics (medição de uso):
              </Text>{" "}
              consentimento — só ativamos depois da sua escolha no aviso de privacidade.
            </li>
            <li>
              <Text as="span" weight="semibold">
                Marketing (Meta Pixel):
              </Text>{" "}
              consentimento — desligado até você aceitar explicitamente.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <Heading variant="h2">Cookies e armazenamento local</Heading>
          <Text as="p" color="secondary">
            Usamos três categorias, que você controla no aviso de privacidade deste site:
          </Text>
          <ul className={styles.list}>
            <li>
              <Text as="span" weight="semibold">
                Essenciais:
              </Text>{" "}
              guardam seu progresso no Builder no seu próprio navegador. Sempre ativos — sem eles,
              a ferramenta não funciona.
            </li>
            <li>
              <Text as="span" weight="semibold">
                Analytics:
              </Text>{" "}
              Google Analytics (GA4) e um registro interno de eventos, sem nome/e-mail/telefone.
            </li>
            <li>
              <Text as="span" weight="semibold">
                Marketing:
              </Text>{" "}
              Meta Pixel, usado só para medir a eficácia de anúncios.
            </li>
          </ul>
          <PrivacyPreferencesButton />
        </section>

        <section className={styles.section}>
          <Heading variant="h2">Com quem compartilhamos</Heading>
          <Text as="p" color="secondary">
            Não vendemos dados pessoais. Compartilhamos o necessário com prestadores que ajudam a
            operar o site:
          </Text>
          <ul className={styles.list}>
            <li>
              <Text as="span" weight="semibold">
                Supabase:
              </Text>{" "}
              armazena os dados de contato e do projeto (banco de dados).
            </li>
            <li>
              <Text as="span" weight="semibold">
                Vercel:
              </Text>{" "}
              hospeda o site e processa as requisições técnicas (inclui registros de acesso do
              próprio provedor, não controlados diretamente por nós).
            </li>
            <li>
              <Text as="span" weight="semibold">
                Google (Analytics):
              </Text>{" "}
              recebe eventos de uso, só com consentimento de analytics.
            </li>
            <li>
              <Text as="span" weight="semibold">
                Meta (Pixel):
              </Text>{" "}
              recebe um evento de conversão, só com consentimento de marketing.
            </li>
          </ul>
          <Text as="p" color="secondary">
            Alguns desses prestadores podem processar dados fora do Brasil, seguindo as próprias
            políticas de proteção de dados internacionais.
          </Text>
        </section>

        <section className={styles.section}>
          <Heading variant="h2">Por quanto tempo guardamos</Heading>
          <ul className={styles.list}>
            <li>Projetos enviados sem retorno: mantidos por um período comercialmente razoável e depois avaliados para remoção.</li>
            <li>Projetos que avançam para cliente: mantidos pelo tempo necessário à relação contratual e às obrigações legais aplicáveis.</li>
            <li>Dados de sessão (armazenamento local): expiram automaticamente em até 7 dias de inatividade.</li>
            <li>Eventos de analytics: mantidos por um prazo mais curto, usados de forma agregada.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <Heading variant="h2">Segurança</Heading>
          <Text as="p" color="secondary">
            Dados de contato e de projeto ficam em um banco de dados com controle de acesso por
            linha, acessível apenas por processos autorizados do servidor e por administradores
            autenticados da Upgrade. Não compartilhamos detalhes técnicos de segurança nesta
            página.
          </Text>
        </section>

        <section className={styles.section}>
          <Heading variant="h2">Decisões automatizadas</Heading>
          <Text as="p" color="secondary">
            Calculamos uma pontuação interna a partir das respostas do seu projeto, usada só para a
            nossa equipe priorizar qual projeto atender primeiro. Essa pontuação não bloqueia,
            nega ou concede nada automaticamente — toda decisão comercial final é tomada por uma
            pessoa.
          </Text>
        </section>

        <section className={styles.section}>
          <Heading variant="h2">Seus direitos</Heading>
          <Text as="p" color="secondary">Você pode solicitar, a respeito dos seus dados:</Text>
          <ul className={styles.list}>
            <li>confirmação de que tratamos seus dados;</li>
            <li>acesso aos dados que temos sobre você;</li>
            <li>correção de dados incompletos ou desatualizados;</li>
            <li>anonimização, bloqueio ou exclusão de dados desnecessários ou tratados fora da lei;</li>
            <li>portabilidade dos dados a outro fornecedor;</li>
            <li>informação sobre com quem compartilhamos seus dados;</li>
            <li>revogação do consentimento, quando o tratamento depender dele.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <Heading variant="h2">Como exercer seus direitos</Heading>
          <Text as="p" color="secondary">
            Entre em contato pelo mesmo canal usado no seu atendimento comercial (o WhatsApp ou
            e-mail informado ao enviar seu projeto pelo Builder), informando o que deseja
            solicitar. Vamos confirmar sua identidade de forma proporcional ao pedido antes de
            executá-lo.
          </Text>
        </section>

        <section className={styles.section}>
          <Heading variant="h2">Alterações desta política</Heading>
          <Text as="p" color="secondary">
            Se mudarmos esta política de forma significativa, a data de “última atualização” no
            topo desta página muda e, quando fizer sentido, pedimos sua decisão de consentimento
            novamente.
          </Text>
        </section>
      </SectionContainer>
      <SiteFooter />
    </>
  );
}
