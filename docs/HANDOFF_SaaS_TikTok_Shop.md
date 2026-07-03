# HANDOFF — Plataforma SaaS TikTok Shop

> **Para a próxima IA / dev:** este documento é o contexto completo do projeto. Leia inteiro antes de escrever qualquer código. Ele descreve o que construir, em que ordem, com quais convenções e quais decisões **já foram travadas**. Itens marcados `[A DEFINIR]` ainda não têm resposta — **pergunte ao dono antes de assumir**.

---

## 0. Stack e decisões travadas (não rediscutir sem o dono pedir)

- **Backend:** Java 21 + Spring Boot 4.0.x + Spring Security 7.x.
- **Banco:** PostgreSQL 18.x. Migrations com **Flyway**.
- **Frontend:** React + TypeScript.
- **Arquitetura:** **monolito modular** (um único projeto Spring Boot, organizado por módulos internos — não microsserviços).
- **Repositório:** **monorepo** (backend + frontend no mesmo repo).
- **Autenticação:** **já existe e está pronta** (JWT access + refresh, padrão da skill `spring-security-hardening`). **NÃO reimplementar login.** As novas features apenas consomem a auth existente.
- **Notificações:** **Web Push real** (VAPID + Service Worker) — chega com a aba fechada / no celular. Som = **som padrão do sistema operacional** (sem áudio custom). Imagem do produto entra por **URL** (não arquivo). Disparo **manual** pelo admin, com segmentação.
- **Métricas do dashboard:** **manuais** — o admin digita os valores. Não vêm do TikTok.
- **Créditos:** schema nasce na fundação (Fase 0). Cobrança/enforcement pode ser ativado depois.
- **Persistência de configs voláteis (Fase 4):** usar **JSONB**, não colunas rígidas (o PDF tem dezenas de opções "a definir" que vão mudar).

### Pendência bloqueante para o BANCO (entrega final)
- A tabela de usuário **já existe** (auth pronta). O dono vai enviar os campos reais. Até lá, as FKs das demais tabelas referenciam um placeholder `users(id)`. **Não invente a estrutura de `users`.**

---

## 1. Convenções de código (obrigatórias)

- Camadas: **Controller → Service → Repository**. Controller fino, regra de negócio no Service.
- **DTOs de criação usam o sufixo `Create`** (ex.: `NotificationCreate`, `ProductCreate`). DTOs de saída usam sufixo `Response`.
- **Validação** com Bean Validation (`@NotNull`, `@NotBlank`, `@Size`, etc.) nos DTOs.
- **Queries:** preferir **Native Query** (`@Query(nativeQuery = true)`). Usar JPQL só em consultas muito pequenas/triviais.
- Prefixo de rotas: `/api/**`. Rotas de admin: `/api/admin/**` (protegidas com `hasRole('ADMIN')`). Rotas públicas: `/api/auth/**`, `/api/public/**`.
- Proteção fina por endpoint com `@PreAuthorize`. Sempre validar **ownership** (prevenção de IDOR) em GET/PUT/DELETE por id.
- Rate limit: aplicar nos endpoints de **funções de IA** (geração) e respeitar o limite de tentativas mensal.
- Língua do código/comentários/commits: **pt-BR**.

### Estrutura de pacotes sugerida (monolito modular)
```
com.empresa.saas
├── shared/            # config, security (já existe), exceptions, utils
├── user/              # gestão de usuários, planos, aprovação (Fase 1)
├── dashboard/         # métricas manuais (Fase 2)
├── product/           # mineração de produtos (Fase 3)
├── studio/            # estúdio de criação, 3 fluxos (Fase 4)
├── notification/      # web push manual (Fase 5)
└── credit/            # carteira e transações de crédito (transversal, Fase 0)
```

---

## 2. Roadmap — ordem de execução (0 → 5)

A ordem é **dependência-first**. Cada fase só começa após a anterior estar com os critérios de aceite fechados.

### Resumo
| Fase | Módulo | Depende de |
|------|--------|------------|
| 0 | Fundação + Créditos (schema) | — |
| 1 | Acesso & Admin (usuários/planos) | 0 |
| 2 | Dashboard (métricas manuais) | 1 |
| 3 | Mineração de Produtos | 1 |
| 4 | Estúdio de Criação (3 fluxos) | 3 + 0(créditos) |
| 5 | Notificações (web push manual) | 1 |

---

## FASE 0 — Fundação + Créditos (schema)

**Objetivo:** preparar o projeto e o esqueleto de dados que todo o resto usa.

**Tasks**
1. Setup do projeto Spring Boot 4 + dependências (web, data-jpa, validation, flyway, postgresql, security já presente).
2. Configurar Flyway e `application.yml` (datasource via variáveis de ambiente).
3. Integrar com a tabela `users` existente (aguardar campos do dono).
4. Criar **schema de créditos** (mesmo sem cobrar ainda).

**Entidades (DDL detalhado vem na entrega final do banco)**
- `credit_wallets` — saldo por usuário (`user_id` FK, `balance`, `updated_at`).
- `credit_transactions` — histórico (`wallet_id` FK, `amount` +/-, `reason`, `reference_id`, `created_at`).

**Regra de negócio**
- Toda função de IA (Fase 4 e Avatar) **debita crédito** antes de processar. Saldo insuficiente → erro 402/409.

**Casos de borda**
- Débito concorrente na mesma carteira (usar lock otimista ou `UPDATE ... WHERE balance >= ?`).
- Estorno quando a geração externa falha.

**Critério de aceite**
- App sobe, conecta no Postgres, Flyway aplica a migration de créditos, carteira é criada no primeiro acesso do usuário.

---

## FASE 1 — Acesso & Admin

**Objetivo:** o admin controla quem usa a plataforma e em qual plano.

**Tasks**
1. Listar usuários (com destaque para `PENDING`).
2. Aprovar / bloquear acesso (muda `status`).
3. Definir plano: `MONTHLY` ou `LIFETIME` (trimestral existe no PDF mas não está em uso → `[A DEFINIR]` se entra agora — adiado junto com o gateway de pagamento, dono já tem provedor em mente).
4. **Bloqueio automático**: job diário que bloqueia plano `MONTHLY` vencido (30 dias).
5. **Desbloqueio manual** após pagamento.

**Entidades**
- `plans` — tipo, duração em dias, preço `[A DEFINIR]` — adiado junto com o gateway de pagamento.
- `user_subscriptions` — `user_id`, `plan_id`, `started_at`, `expires_at`, `status`.

**Endpoints (admin)**
- `GET /api/admin/users` · `PATCH /api/admin/users/{id}/approve` · `PATCH /api/admin/users/{id}/block` · `PATCH /api/admin/users/{id}/plan`

**Regra de negócio**
- Conta nova nasce `PENDING`; sem aprovação, não acessa nada além de login.
- Plano `LIFETIME` nunca expira; `MONTHLY` expira em 30 dias.

**Casos de borda**
- Usuário pago expira no fim de semana (job precisa rodar mesmo assim).
- Reativação de quem foi bloqueado: recalcular `expires_at` a partir da data de reativação.
- Admin tentando bloquear a própria conta admin.

**Critério de aceite**
- Admin aprova/bloqueia/define plano; usuário `MONTHLY` é bloqueado automaticamente ao vencer.

---

## FASE 2 — Dashboard (métricas manuais)

**Objetivo:** painel com duas visões e níveis de acesso.

**Tasks**
1. CRUD de métricas manuais por período (admin edita: faturamento, pedidos, comissão, ticket médio).
2. **Visão Faturamento** — só `ADMIN`.
3. **Visão Tendências** — tela inicial do `USER` (sem dados financeiros).
4. Filtros: Hoje, Esta semana, 7d, 15d, Este mês, 30d, personalizado.

**Entidades**
- `dashboard_metrics` — chave por (`period_type`, `period_ref`), campos: `revenue`, `orders`, `commission`, `avg_ticket`. Atualizado pelo admin.

**Endpoints**
- `GET /api/dashboard` (retorna conforme role) · `PUT /api/admin/dashboard/metrics` (admin edita).

**Regra de negócio**
- `USER` **nunca** recebe os campos financeiros no payload (filtrar no backend, não só esconder no front).

**Casos de borda**
- Período sem dados cadastrados → retornar zeros, não erro.
- Período personalizado com data fim < data início.

**Critério de aceite**
- Admin vê Faturamento + Tendências e edita números; user vê só Tendências; troca de período reflete os valores.

---

## FASE 3 — Mineração de Produtos

**Objetivo:** vitrine de produtos em alta que o usuário escolhe para promover.

**Tasks**
1. CRUD de produtos pelo admin (vendas/visualizações são valores **manuais**).
2. Categorias: Favoritos, Top Produtos, Beleza & Cuidados, Casa & Mais, Saúde & Fitness, Moda, Tecnologia, Acessórios.
3. Busca textual + filtro por categoria.
4. Janelas de horário (00–06, 06–12, 12–18, 18–00) — **decidido: só visual/manual**, não reordena automaticamente.
5. "Usar meu próprio produto" — usuário adiciona imagem (URL), nome, descrição → entra no fluxo do estúdio.
6. Favoritar produto.
7. Botão de afiliação (link externo para o TikTok Shop).

**Entidades**
- `products` — nome, descrição, imagem (URL), categoria, vendas, visualizações, link de afiliação, `created_by_admin`.
- `user_products` — produtos próprios do usuário.
- `favorites` — `user_id` + `product_id`.

**Endpoints**
- `GET /api/products` (busca + filtro) · `POST /api/products/mine` (usar meu produto) · `POST /api/products/{id}/favorite`
- Admin: `POST/PUT/DELETE /api/admin/products`

**Casos de borda**
- Imagem por URL quebrada (validar formato de URL, não baixar o arquivo).
- Produto removido pelo admin que estava no estúdio de um usuário.

**Critério de aceite**
- Usuário busca, filtra, favorita, adiciona produto próprio e segue para o estúdio.

---

## FASE 4 — Estúdio de Criação (3 fluxos)

**Objetivo:** montar conteúdo com avatar de IA e gerar os prompts/imagem para finalizar em ferramentas externas (Grok / VEO3). **A plataforma só gera prompts e imagem de referência — não gera o vídeo.**

> **DECISÃO-CHAVE:** as configs de cada passo são **voláteis** (PDF cheio de "a definir"). Persistir como **JSONB**, não como dezenas de colunas. A próxima IA refina os campos do JSON conforme o front evoluir.

**Os 3 formatos**
- **Original (UGC)** — 4 passos: Produto → Câmera & Influenciador → Áudio & Roteiro → Criação Final.
- **Imersivo (POV)** — 4 passos: Produto → Configuração (mãos/cenário) → Áudio & Roteiro → Criação Final (+ melhorias opcionais: 8K, mãos perfeitas, anti-IA...).
- **Cinematográfico** — 5 passos: Produto → Influenciador → Cenário & Interação → Movimento → Criação Final.

**Tasks**
1. Criar sessão de criação escolhendo o formato.
2. Salvar config de cada passo (JSONB).
3. Geração de **prompts de texto** (mesclagem + movimento) na Criação Final.
4. Geração de **imagem de referência** via API externa de imagem → **debita crédito** (Fase 0).
5. Telas de loading entre passos (responsabilidade do front; backend só sinaliza status).

**Entidades**
- `creation_sessions` — `user_id`, `product_id`, `format` (`UGC`/`POV`/`CINEMATIC`), `status`, `config` (JSONB), `created_at`.
- `creation_steps` — opcional, se quiser histórico por passo; ou tudo dentro do `config` JSONB.
- `avatars` — ver Fase Avatar abaixo.

**Endpoints**
- `POST /api/studio/sessions` · `PATCH /api/studio/sessions/{id}/step` · `POST /api/studio/sessions/{id}/generate`

**Decidido**
- API de geração de imagem: **Google Gemini (Nano Banana / Gemini 2.5 Flash Image)**.
- Custo em créditos por formato: Estúdio 15cr, Avatar 20cr, Trend Boost 15cr, Editar Imagem 10cr, Nano Banana Pro 20cr, Influencer Studio 30cr.
- Os prompts são montados por template no backend ou vêm prontos?

**Casos de borda**
- Geração externa falha → estornar crédito.
- Usuário fecha o navegador no meio → sessão fica `DRAFT` e pode retomar.
- Limite mensal de tentativas atingido (Fase Créditos).

**Critério de aceite**
- Usuário percorre os 3 fluxos, salva configs e recebe prompts + imagem na tela final, com débito de crédito.

### Sub-módulo: Criar Avatar IA ("Meus Avatares")
- 4 passos (Básico → Pele & Cabelo → Estilo & Cenário → Finalizar) → gera 2 variações, escolhe favorita, renomeia, salva.
- Consome crédito e respeita limite de tentativas.
- Entidade `avatars` — `user_id`, `name`, `config` (JSONB), `image_url`.

---

## FASE 5 — Notificações (web push manual) — FOCO DO DONO

**Objetivo:** o admin dispara manualmente um aviso de "produto que está vendendo" (dados copiados do outro site do dono), com **imagem do produto + som do sistema**, para **pessoas específicas ou todo mundo**.

**Como funciona o push real (entenda antes de codar)**
- Front registra um **Service Worker** e pede permissão de notificação → gera uma `PushSubscription` (endpoint + chaves) → backend salva.
- Backend assina o envio com **chaves VAPID** e manda para o endpoint do navegador.
- **Limite de ~4KB no payload** → a **imagem vai como URL**, o navegador baixa. A URL precisa ser pública (outro site do dono ou storage).
- Som = **som padrão do SO**. Áudio custom **não** funciona com aba fechada (limitação dos navegadores) — não prometer isso.

**Tasks**
1. Endpoint para o front registrar/remover `PushSubscription`.
2. Tela admin: compor notificação (título, texto, **URL da imagem**, URL de destino ao clicar).
3. Segmentação: escolher **lista de usuários** OU **broadcast** (todos).
4. Disparar e **logar entrega** (sucesso/falha por destinatário).
5. Limpeza de subscriptions expiradas (push retorna 410 Gone → remover).

**Entidades**
- `push_subscriptions` — `user_id`, `endpoint`, `p256dh`, `auth`, `created_at`.
- `notifications` — `title`, `body`, `image_url`, `click_url`, `audience` (`ALL`/`SELECTED`), `created_by`, `created_at`.
- `notification_targets` — `notification_id` + `user_id` (quando `SELECTED`).
- `notification_deliveries` — `notification_id`, `user_id`, `status`, `error`, `sent_at`.

**Endpoints**
- `POST /api/push/subscribe` · `DELETE /api/push/subscribe` (usuário)
- `POST /api/admin/notifications` (admin compõe e dispara) · `GET /api/admin/notifications` (histórico + entregas)

**Decidido**
- Biblioteca Java de Web Push: `nl.martijndwars:web-push` (confirmada).
- Chaves VAPID: geradas uma vez, guardadas em variável de ambiente (nunca no repo).
- A URL da imagem vem do outro site do dono? Precisa ser HTTPS e CORS-friendly.

**Casos de borda**
- Subscription expirada/revogada (410) → remover e não contar como falha real.
- Usuário negou permissão → não tem subscription → ignorar no envio.
- Broadcast com milhares de usuários → enviar em lotes (não travar a request; considerar fila/async).
- Imagem com URL inválida → push ainda é enviado, só sem imagem.

**Critério de aceite**
- Usuário com aba fechada recebe a notificação no SO, com imagem e som do sistema; admin escolhe destinatários ou broadcast; entregas ficam logadas.

---

## 3. Itens opcionais (fora do roadmap 0–5 — só se o dono priorizar)

Galeria de Prompts · Modelos Virais · Programa de Indicação · Creator Academy · Notificações de "vendas ao vivo" (prova social, diferente da Fase 5). São majoritariamente CRUD + conteúdo estático.

---

## 4. Lista consolidada de decisões (atualizado 2026-07-03)

### Decididas ✅
1. Estrutura real da tabela `users` (auth pronta) — já existe, banco desbloqueado.
3. Janelas de horário da vitrine: **visuais/manuais**, não funcionais.
4. **API de geração de imagem**: **Google Gemini (Nano Banana / Gemini 2.5 Flash Image)** — Fase 4 desbloqueada.
5. Custo em créditos por geração/formato: Estúdio 15cr, Avatar 20cr, Trend Boost 15cr, Editar Imagem 10cr, Nano Banana Pro 20cr, Influencer Studio 30cr.
6. Biblioteca Web Push: `nl.martijndwars:web-push`; chaves VAPID em variável de ambiente.
7. URL da imagem do produto nas notificações: reaproveita a `image_url` já existente do produto/avatar.

### Ainda pendentes ⛔ (adiadas pelo dono)
2. Plano trimestral / preços dos planos — adiado junto com o gateway de pagamento; dono já tem provedor em mente, só confirmar depois.

---

## 5. Riscos conhecidos

- **Web Push 4KB / som do SO / imagem por URL** — requisito do dono já ajustado a essas limitações. Não regredir.
- **Créditos transversais** — se forem modelados tarde, viram retrabalho em toda chamada de IA. Schema já na Fase 0.
- **Fase 4 volátil** — manter JSONB. Cravar colunas rígidas agora = retrabalho garantido.
- **Broadcast de push** — fazer assíncrono/em lote desde o início, senão a request estoura em volume.
- **Dependência de API de IA externa** — custo variável; sempre debitar crédito ANTES e estornar em falha.

---

## 6. Próxima entrega prevista

**O banco completo** (migrations Flyway, Fases 0–3 com schema rígido + Fases 4–5 com JSONB), assim que o dono enviar os campos da tabela `users`.
