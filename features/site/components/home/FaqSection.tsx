"use client";

import { useRef } from "react";
import SectionContainer from "@/features/design-system/components/SectionContainer";
import Heading from "@/features/design-system/components/Heading";
import { getResponseTimeLabel } from "@/lib/contact/siteContact";
import { useRevealScrollMotion } from "../../motion/useRevealScrollMotion";
import styles from "./FaqSection.module.css";

interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Só entram perguntas cuja resposta é um FATO do produto de hoje (o que o Builder faz). Respostas
 * que dependem de política comercial ainda não definida NÃO aparecem aqui — estão listadas em
 * `docs/CONTENT-TODO.md` ("FAQ — aguardando definição"): quais tipos de projeto a Upgrade atende,
 * como funciona a contratação, preços e prazos de entrega.
 */
function buildFaq(): FaqItem[] {
  // Prazo só entra se a Upgrade o definir (`NEXT_PUBLIC_RESPONSE_TIME`); nunca um prazo inventado.
  const responseTime = getResponseTimeLabel();
  return [
    {
      question: "Posso contratar mais de um serviço?",
      answer:
        "Pode. Você combina Site, Tráfego Pago e Design e Social Media no mesmo Upgrade, e adiciona outro serviço a qualquer momento antes de enviar.",
    },
    {
      question: "Não sei exatamente o que preciso. E agora?",
      answer:
        "Sem problema. Várias perguntas têm a opção “Ainda não sei”, e você segue com o que souber. Depois, a equipe da Upgrade analisa o que você montou e continua a conversa com você.",
    },
    {
      question: "Preciso responder muita coisa?",
      answer:
        "São poucas perguntas por serviço. Seus dados de contato só são pedidos no final, depois de você ver o resumo do que montou.",
    },
    {
      question: "Posso mudar minhas respostas antes de enviar?",
      answer:
        "Pode. Antes de enviar, você revisa o resumo, edita qualquer serviço ou remove o que não quiser.",
    },
    {
      question: "O que acontece depois que eu envio?",
      answer: `A equipe da Upgrade analisa o que você montou e entra em contato pelos dados que você informou${
        responseTime ? `, ${responseTime}` : ""
      }.`,
    },
  ];
}

/**
 * Perguntas frequentes da Home — remove dúvidas que travam o clique em "Monte seu Upgrade" (dá para
 * combinar serviços? e se eu não souber? dá para editar? o que acontece depois?). Usa `<details>`
 * nativo: acessível por teclado e leitor de tela sem JavaScript, e o conteúdo fica no HTML inicial
 * (útil para SEO).
 */
export default function FaqSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  useRevealScrollMotion(sectionRef, { itemSelectors: [`.${styles.heading}`, `.${styles.item}`] });
  const items = buildFaq();

  return (
    <SectionContainer as="section" ref={sectionRef} className={styles.section} aria-labelledby="faq-title">
      <Heading variant="h2" id="faq-title" className={styles.heading}>
        Perguntas frequentes
      </Heading>
      <div className={styles.list}>
        {items.map((item) => (
          <details key={item.question} className={styles.item}>
            <summary className={styles.question}>{item.question}</summary>
            <p className={styles.answer}>{item.answer}</p>
          </details>
        ))}
      </div>
    </SectionContainer>
  );
}
