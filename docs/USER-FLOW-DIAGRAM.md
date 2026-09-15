# USER FLOW DIAGRAM — Diagramas do Fluxo do Site da Agência Upgrade

> Fase 4 do roadmap (revisão), corrigida na Fase 5. Diagramas complementares a `docs/USER-FLOW.md`,
> alinhados às 3 categorias e às perguntas realmente implementadas em `lib/builder/config/`. Cada
> diagrama cobre um recorte específico — nenhum tenta mostrar o sistema inteiro de uma vez.
>
> **Correção da Fase 5**: o diagrama 6 ("Me ajude a descobrir", com pergunta e recomendação automática
> de categoria) foi removido — essa função de diagnóstico avançado saiu do escopo do Builder. Os
> diagramas 1 e 2 também tiveram os ramos de recomendação automática entre serviços removidos.
>
> **Alinhamento pré-Etapa 8**: a imagem "Upgrade Builder — Árvore de Escolhas" passa a ser referência
> visual oficial da mesma lógica descrita nestes diagramas, ao lado de `docs/USER-FLOW.md` e do código em
> `lib/builder/config/*.ts`. Os diagramas 2 e 4 foram atualizados para refletir a pergunta
> `trafego_investimento` (Tráfego Pago, agora 4 perguntas) e o rótulo "Montar um pacote" (antes "Quero
> combinar serviços") — ver `docs/DECISIONS.md`. Em caso de conflito futuro entre a imagem e este
> documento/código, o texto/código aprovado prevalece.

---

## 1. Fluxo principal (um serviço, do início ao fim)

```mermaid
flowchart TD
    A[Entrada: Home / Menu / Campanha / URL direta] --> B[Escolha de categoria: Site, Trafego Pago ou Design]
    B -.->|opcao secundaria, menor peso| X[Fale com a Upgrade - sai do Builder, sem pergunta]
    B --> C[Mini-fluxo de perguntas da categoria]
    C --> D[Mini-fluxo concluido: servico entra no Meu Upgrade automaticamente]
    D --> E{Proxima acao}
    E -->|Finalizar meu projeto - principal| F[Resumo do projeto]
    E -->|Adicionar outro servico - secundario| B
    F --> G[Captura de contato]
    G --> H[Envio]
    H --> I[Lead criado]
    I --> J[Confirmacao final]
```

"Fale com a Upgrade" é uma saída direta para contato humano — não abre pergunta, não recomenda
categoria, não faz parte do motor de perguntas do Builder.

## 2. Fluxo de múltiplos serviços (adicionados manualmente)

```mermaid
flowchart TD
    A[Escolha de categoria] --> B[Configura Site: site_tipo, site_recursos, site_situacao]
    B --> C[Site concluido - entra no Meu Upgrade]
    C --> D[Tela de conclusao: Finalizar meu projeto - principal / Adicionar outro servico - secundario]
    D -->|Usuario escolhe adicionar outro, por conta propria| A
    A --> E[Configura Trafego Pago: 4 perguntas fixas, inclui investimento mensal]
    E --> F[Trafego Pago concluido - entra no Meu Upgrade]
    F --> G[Meu Upgrade: Site + Trafego Pago]
    G --> H{Proxima acao}
    H -->|Adicionar mais um| A
    H -->|Finalizar meu projeto| I[Resumo do projeto]
```

Nenhuma recomendação aparece entre os passos — o segundo serviço só é configurado porque o usuário
decidiu isso por conta própria em "Adicionar outro serviço".

## 3. Fluxo de edição

```mermaid
flowchart TD
    A[Meu Upgrade ou Resumo] --> B[Clica Editar Site]
    B --> C[Abre configuracao existente - modo rascunho temporario]
    C --> D[Usuario altera uma resposta, ex.: site_tipo]
    D --> E{Alguma resposta posterior ficou incompativel?}
    E -->|Sim| F[Remove automaticamente so as respostas dependentes daquela categoria]
    E -->|Nao| G[Mantem as demais respostas]
    F --> H[Usuario confirma alteracoes]
    G --> H
    H --> I[Rascunho substitui a configuracao anterior]
    C -->|Cancelar edicao a qualquer momento| J[Descarta rascunho, mantem configuracao anterior]
    I --> K{De onde a edicao comecou?}
    J --> K
    K -->|Meu Upgrade| L[Volta ao Meu Upgrade]
    K -->|Resumo| M[Volta ao Resumo atualizado]
```

## 4. Fluxo de Design + Social Media com serviços combinados

```mermaid
flowchart TD
    A[design_servico: O que sua marca precisa?] --> B[Montar um pacote]
    B --> C[Selecionar quais incluir, ex.: Design para Redes Sociais + Gestao de Social Media]
    C --> D[Pergunta design_formato - Design para Redes Sociais]
    D --> E[Pergunta marca_identidade - compartilhada pelos dois servicos]
    E --> F[Pergunta social_necessidade - Gestao de Social Media]
    F --> G[marca_identidade NAO e perguntada de novo - ja respondida]
    G --> H[Mini-fluxo combinado concluido]
    H --> I[Ambos os servicos entram no Meu Upgrade]
```

Esta combinação é sempre uma escolha manual do usuário na Pergunta 1 de Design — o sistema não sugere
combinar serviços, apenas evita perguntar a mesma coisa duas vezes quando o próprio usuário combina.

## 5. Fluxo de finalização

```mermaid
flowchart TD
    A[Meu Upgrade com 1+ servico concluido] --> B[Finalizar meu projeto]
    B --> C[Resumo do projeto - compila respostas, sem analise]
    C --> D{Usuario confere tudo}
    D -->|Quer editar algo| E[Editar servico - ver diagrama 3]
    E --> C
    D -->|Quer remover algo| R[Remover servico - confirma e atualiza Meu Upgrade]
    R --> C
    D -->|Esta tudo certo| F[Seguir para contato]
    F --> G[Formulario de contato: nome, empresa, WhatsApp, e-mail]
    G --> H{Validacao}
    H -->|Invalido| I[Mostra erro no campo, mantem dados preenchidos]
    I --> G
    H -->|Valido| J[Envio - lead preparado para salvar]
    J --> K{Envio OK?}
    K -->|Falhou| L[Mostra erro, mantem dados, permite tentar novamente]
    L --> G
    K -->|Sucesso| M[Lead criado/salvo]
    M --> N[Confirmacao final: Recebemos o que voce procura]
    N -.->|possibilidade futura| O[CTA: Falar com a Upgrade pelo WhatsApp]
```

O lead é considerado criado/salvo **antes** de qualquer redirecionamento ao WhatsApp — o CTA de WhatsApp
é uma continuidade comercial opcional, não implementada nesta fase.
