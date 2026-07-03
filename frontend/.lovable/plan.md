# Plano de implementação

## Estrutura de pastas

```text
src/
  components/
    base/           # BrandMark, Button, Badge, campos, Tabs, Toggle, Slider, Modal
    cards/          # SelectableCard, MetricCard, ProductCard, AvatarCard, PriceCard
    feedback/       # LoadingScreen, EmptyState, Toast de venda, estados de erro/vazio
    navigation/     # Header, FloatingToolbar, Stepper, PageHeader
    studio/         # TakesSelector, TakeEditor, VoiceConfig, AssetCard, PromptResult
  features/
    auth/           # login, cadastro, aprovação pendente
    launchpad/      # home e busca/mineração
    dashboard/      # faturamento, tendências, gráfico, vendas ao vivo
    admin/          # usuários, métricas e notificações de vendas
    products/       # mineração, filtros, catálogo e produto próprio
    creation/       # formatos e wizards UGC, POV e Cinematográfico
    trends/         # entrada e wizards Novelinha, Objetos e Polêmicas
    avatars/        # criação, variações e modelo salvo
    tools/          # ferramentas IA e créditos
    prompts/        # galeria e cópia
    editor/         # TokEditor em cinco etapas
    academy/        # player, módulos e aulas
    referral/       # indicação e ganhos
    settings/       # perfil, limites, tema e notificações
  layouts/
    AppShell.tsx    # header + toolbar persistentes + conteúdo
    AuthShell.tsx   # auth centralizado
    SignatureBackground.tsx
  mock/
    products.ts     # catálogo amplo e categorias
    avatars.ts
    dashboard.ts
    users.ts
    academy.ts
    prompts.ts
    notifications.ts
  routes/           # rotas TanStack navegáveis, com metadados por tela
  lib/
    mock-session.tsx # papel admin/user, auth visual, créditos e preferências em memória
    formatters.ts
    constants.ts
```

## Fundação visual e componentes base

1. Mapear os tokens fornecidos para variáveis CSS e Tailwind v4, mantendo os valores exatos e criando tokens semânticos para superfícies, textos, bordas, estados, gradientes e sombras.
2. Carregar Inter no `head`, aplicar tipografia, foco visível, `tabular-nums`, animações e `prefers-reduced-motion`.
3. Construir o background global com grid mascarado, glows radiais e 14 light rods animados.
4. Reestilizar os componentes essenciais e criar a biblioteca solicitada: botões, badges, inputs, cards selecionáveis, stepper, toggles, métricas, produtos, avatares, editor de takes, voz, seletor de takes, modal, loading, toolbar, header, empty state, tabs, tooltip, slider, accordion e cards de preço.
5. Criar apenas o símbolo geométrico da marca, sem nome textual em qualquer tela.

## Navegação e estado mock

1. Criar um contexto de sessão totalmente local para login simulado, papel `admin | user`, créditos, notificações e preferências.
2. Montar `AuthShell` e `AppShell`; proteger visualmente a área logada sem autenticação real.
3. Criar Header e FloatingToolbar responsivos com indicação do módulo ativo.
4. Implementar todas as rotas públicas e internas com TanStack Router, links reais e metadata específica.

## Ordem de construção das telas

1. **Auth:** Login, Cadastro e aprovação pendente.
2. **Núcleo de trabalho:** Launchpad, Dashboard com visões Tendências/Faturamento, Produtos Virais e modal de produto próprio.
3. **Estúdio:** seleção de formato; wizards completos Original, Imersivo e Cinematográfico; loading entre etapas; Criação Final compartilhada.
4. **Trend Boost:** seleção de template; Novelinha, Objetos Falantes e Polêmicas completos; Resultado compartilhado com prompt, cópia e hashtags.
5. **Avatares:** wizard, loading, escolha de variação, preview final, histórico e salvamento mock.
6. **Conteúdo e utilidades:** Ferramentas IA, Galeria de Prompts, TokEditor, Creator Academy.
7. **Admin:** Usuários, edição manual de métricas e Notificações de Vendas, visíveis somente para admin.
8. **Conta:** Programa de Indicação, Créditos/Limites, Configurações e central de notificações.
9. **SEO técnico inicial:** `sitemap.xml` e `robots.txt` apenas para rotas públicas indexáveis.

## Estratégia para os fluxos

- Um componente `WizardShell` controla etapa, direção da transição, progresso e loading simulado.
- Etapas usam configurações tipadas e componentes compartilhados para evitar duplicação.
- “Gerar com IA” alterna para loading temporário e injeta conteúdo mock coerente.
- Resultados finais compartilham `PromptResult`; os três formatos do Estúdio compartilham `CreationFinal`.
- Formulários, uploads, planos, métricas, bloqueios, compras e salvamentos alteram somente estado em memória.

## Dados e estados

- Gerar catálogo mock amplo de produtos por categoria, avatares brasileiros, usuários pendentes/ativos, séries de gráfico, aulas, prompts e notificações.
- Incluir estados vazio, selecionado, carregando e resultado onde aplicável.
- Simular venda ao vivo e contagem regressiva apenas no cliente, sem rede.

## Validação final

- Verificar build automatizado, navegação e interações críticas no navegador.
- Validar desktop e viewport menor, contraste, foco por teclado e redução de movimento.
- Conferir a checklist: preto dominante, roxo pontual, sem nome de marca, cores semânticas corretas, papéis admin/user, todos os wizards e ausência total de backend/API/autenticação real.
