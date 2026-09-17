# AWARD-SUBMISSION-CHECKLIST — Preparação para submissão (Etapa 36)

> Checklist de preparação, não uma avaliação de mérito (briefing, Seção 104: "não afirmar que o
> site ganharia prêmio — apenas avaliar preparação para submissão"). Ver `docs/AWARD-AUDIT.md` para
> a avaliação em Design/UX/Inovação/Conteúdo.

## Técnico

- [x] HTTPS (via Vercel, automático)
- [ ] Domínio próprio (pendente — `docs/DEPLOYMENT.md`, Seção 9; a maioria das galerias de design
      aceita `*.vercel.app`, mas um domínio próprio é preferível para submissão)
- [x] Mobile funcional com direção de arte própria (não desktop reduzido)
- [x] Som opt-in, nunca autoplay
- [x] Performance auditada (`docs/PERFORMANCE.md`, Etapa 30) — não remedida nesta etapa (sem
      mudança que justificasse, ver `docs/AWARD-LEVEL.md`, Seção 11)
- [x] Acessibilidade não regredida (motion reduzido, teclado, contraste — Etapas 24/31/32)
- [x] Favicon presente (`app/icon.tsx`/`app/apple-icon.tsx`, gerados, não um arquivo estático
      desatualizado)
- [ ] Social preview testado numa URL pública de verdade (não testável sem deploy real —
      `docs/DEPLOYMENT.md`, Seção 17)

## Conteúdo

- [x] Nenhum "Lorem ipsum"/placeholder visível (auditado na Etapa 33, reconfirmado nesta)
- [ ] **Cases reais** — ainda não existem (`ProjectsTeaserSection` já é honesta sobre isso desde a
      Fase 19); a maioria das galerias de design avalia um portfólio pela qualidade dos trabalhos
      mostrados — submeter antes de ter ao menos 1-2 cases reais entregues é um risco real de
      rejeição, não um detalhe técnico.
- [x] Copy revisada (Etapa 32 — Testes de UX)

## Créditos e licenças

- **Fontes**: Montserrat e Inter, via `next/font/google` — Google Fonts, licença Open Font License,
  uso livre incluindo comercial. Nenhuma fonte paga ou de terceiro fora desse pacote.
- **Áudio**: nenhum arquivo de áudio existe no projeto — todo som é sintetizado em tempo real via
  Web Audio API (osciladores gerados no navegador, `features/design-system/motion/sound.ts`). Não
  há licença a documentar porque não há asset: é matemática, não uma gravação.
- **Modelos 3D**: nenhum arquivo `.glb`/`.gltf`/textura existe no projeto — a geometria do monograma
  (`buildUpgradeMonogramGeometry.ts`) e o shader do brilho procedural (`shaders/proceduralAura.ts`)
  são gerados em código, sem asset externo.
- **Imagens**: `public/logo-mark.png` (logo oficial da Upgrade, fornecido pela própria agência —
  não um asset de terceiro). Nenhuma outra imagem/foto além dela existe no projeto hoje (sem cases
  reais ainda — ver acima).
- **Bibliotecas** (todas open-source, licenças permissivas — MIT/similar, conferir
  `package.json`/`package-lock.json` para a lista exata e versões): Next.js, React, GSAP
  (licença "no charge" da própria GreenSock para a maioria dos plugins usados; `ScrollTrigger` está
  incluído sem custo desde 2024 — confirmar a licença atual da GSAP se o uso comercial mudar de
  escala), Lenis, Three.js, Supabase (`@supabase/supabase-js`), React Hook Form, Zod, Vitest,
  Playwright.

## Formato de submissão (varia por plataforma — verificar em cada uma antes de enviar)

- Awwwards/CSS Design Awards costumam pedir: URL ao vivo, título, uma frase de descrição, categoria,
  cores predominantes, tecnologias usadas (lista acima serve de base), e frequentemente uma imagem/
  vídeo de capa — ver o plano de captura em `docs/AWARD-LEVEL.md`, Seção 13.
- Nenhuma dessas plataformas foi contatada nem uma submissão foi preparada de fato nesta etapa —
  isto é só a lista de pré-requisitos.

## Bloqueadores reais para uma submissão hoje

1. **Falta de cases reais** — o maior risco de rejeição, não corrigível por código.
2. **Sem domínio próprio** — corrigível assim que a Upgrade decidir e comprar um (`docs/DEPLOYMENT.md`).
3. **Sem deploy real ainda publicado** — `docs/DEPLOYMENT.md`/`docs/IMPLEMENTATION-STAGE-33.md`
   deixaram isso pendente da confirmação de auto-deploy do usuário.

Nenhum dos três é uma limitação de design/motion/tecnologia do site em si.
