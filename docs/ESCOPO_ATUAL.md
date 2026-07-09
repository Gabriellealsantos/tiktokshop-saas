# ESCOPO ATUAL — Venyx (SaaS TikTok Shop)

> **Fonte única de verdade pós-áudios (2026-07-07).** Substitui os antigos `ARQUITETURA.md`,
> `PLANO_EXECUCAO.md`, `REQUISITOS.md` e `TELAS_PENDENTES.md` (removidos — foram escritos antes das mudanças
> que o cliente pediu por áudio; ficam no histórico do git se precisar). Guardar este arquivo e reenviá-lo ao
> retomar o projeto em nova conversa. O projeto também tem um grafo `graphify-out/` para consulta rápida.
>
> **Stack:** Java 21 · Spring Boot 4.x · Postgres 18 · Flyway · S3/MinIO · OAuth2 (AS + RS) · React 19/TS.
> **Estado do backend:** login/segurança/MFA 100% prontos; as entidades, repositories, DTOs e enums do que
> ficou existem; alguns services/controllers já existem (ver §5). Falta a maioria dos Controller→Service e a
> integração do front (hoje 100% mock).
> **Idioma:** pt-BR em código/comentários/commits.

---

## 1. O que é o produto (1 parágrafo)

SaaS **por assinatura** para creators de TikTok Shop. O **ADM** (dono + sócios) cura conteúdo manualmente
(produtos "minerados", prompts, métricas do dashboard, avatares de galeria, notificações). O **usuário** paga
a **assinatura de um plano** para entrar e usa ferramentas de **IA que geram imagens e prompts** — **não gera
vídeo** (o vídeo final é feito fora, no **Flow**). Cada geração consome **crédito**, e os créditos
**regeneram automaticamente** conforme o plano (não se compra crédito avulso). Não há integração real com a
API do TikTok: métricas e vitrine são **manuais/curadas**.

---

## 2. Mudanças do cliente (áudios 2026-07-07) — o que muda vs. os docs antigos

| # | Áudio | Decisão | Efeito no backend |
|---|-------|---------|-------------------|
| 1 | Papéis | 3 papéis: **ADM** (dono+sócios), **AFILIADO** (também vende), **USUÁRIO**. Faturamento visível a ADM+AFILIADO; usuário não. Liberar acesso: ADM+AFILIADO. **Só ADM** marca afiliado e gerencia produtos/imagens. | Criar `ROLE_AFFILIATE`. Ajustar `@PreAuthorize` de dashboard, aprovação e roles/produtos. |
| 2 | Indicação | "Indique e Ganhe" aparece p/ todos, **sem link p/ copiar**. Link de checkout é enviado manual no x1. | **Sem backend de referral** por ora. Só a tela. |
| 3 | Vídeo | SaaS só gera **imagem**. Vídeo é externo no **Flow** (não Grok/VEO3). | Remover `VIDEO_EXPORT`; trocar refs "Grok/VEO3" → "Flow". ✅ feito |
| 4 | Remoções | **Tirar TokEditor** e **tirar Academy/videoaulas**. | ✅ classes/tabelas removidas (ver §5). |
| 5 | Créditos | **Modelo mudou.** Acaba a **compra de crédito** e a carteira comprável. Agora crédito **regenera automaticamente** (quota por plano), possivelmente em **dois tipos: imagem e prompt**. | ✅ `CreditPackage` + `services/payment/` removidos. ⚠️ carteira/débito **precisam virar quota auto-regenerável** — ver §7-A. |

---

## 3. Papéis (modelo final)

| Nome de negócio | Papel técnico | Vê faturamento | Aprova/bloqueia | Marca afiliado | Gerencia catálogo/imagens |
|---|---|---|---|---|---|
| ADM (dono+sócios) | `ROLE_ADMIN` | ✅ | ✅ | ✅ | ✅ |
| Afiliado | `ROLE_AFFILIATE` | ✅ | ✅ | ❌ | ❌ |
| Usuário | `ROLE_CLIENT` | ❌ | ❌ | ❌ | ❌ |

> **SUPER_ADMIN foi removido** (decisão 2026-07-07): todos os ADMs (dono + sócios) ficam no mesmo nível
> `ROLE_ADMIN`. Só resta a proteção de "não excluir a si mesmo". "Trocar nome de ADM p/ afiliado" foi
> interpretado como *adicionar* o papel afiliado, não renomear ADMIN.
> **Guards atuais:** conteúdo/CRUD usa `hasRole(ADMIN)` (já exclui Afiliado). Os poderes novos do Afiliado
> (ver faturamento, liberar acesso) entram quando os endpoints de admin/dashboard forem construídos —
> usar `hasAnyRole(ADMIN, AFFILIATE)` neles.

---

## 4. Módulos — o que CONSTRUIR, o que foi REMOVIDO, o que está BLOQUEADO

### 4.1 CONSTRUIR (Controller→Service faltando)

- **Créditos (quota auto-regenerável)** — ⚠️ **modelo novo**: não há compra nem carteira comprável. O crédito
  **regenera automaticamente** conforme o plano, possivelmente separado em **dois tipos: imagem e prompt**
  (o de prompt é "talvez" — confirmar). Endpoints: `GET /api/users/me/wallet` (saldo/quota) · `/usage`
  (consumo). Débito na geração continua atômico + estorno idempotente em falha. Detalhes de mecânica em §7-A.
- **Planos & Assinaturas** — `GET /api/plans`; CRUD `/api/admin/plans` (**+ campo `paymentUrl` — falta na
  entidade `Plan`**); `POST /api/admin/users/{id}/subscription`; `GET /api/users/me/subscription`. 1 ativa por
  usuário; expiração por job diário; `LIFETIME` sem `expiresAt`. O plano define a **quota de créditos** que
  regenera. Compra = **link externo** (`paymentUrl`), sem gateway/webhook.
- **Admin de Usuários** — lista c/ filtros (status/role/plan/search/page); `approve`/`block`/`unblock`
  (ADM+AFILIADO); `PATCH /roles` (**só ADM**); `PATCH /plan`. Não bloquear SUPER_ADMIN nem a si mesmo.
- **Perfil** — `GET/PUT /api/users/me`; `PUT /api/users/me/password`. Preferências (tema/notif.) → **falta
  coluna** em `tb_user`.
- **Prompts** — `GET /api/prompts?category=&search=`; CRUD `/api/admin/prompts`. Limite 2.000 chars.
- **Vendas ao Vivo** — `GET /api/public/live-sales`; `PUT /api/admin/live-sales/config`; CRUD items. Intervalo ≥ 5s.
- **Dashboard** — `GET /api/dashboard?period=` (por papel: **ADM+AFILIADO** veem faturamento, usuário não);
  CRUD `/api/admin/dashboard/metrics`; insights (controller já existe). Métricas 100% manuais.
- **Produtos** — vitrine `GET /api/products` (+ busca/janela/paginação); detalhe c/ KPIs; `/stats`; favoritar +
  `/me/favorites`; CRUD admin (só ADM); "meu produto" (`user_products`). Campo `affiliateLink` já existe (botão
  "Afiliar"→TikTok).
- **Estúdio + Avatares + Trend Boost + Ferramentas** — sobre o job framework (`GenerationJob` +
  `GenerationProvider`). **Só imagem/prompt** (sem vídeo). Custos: Estúdio 15 · Avatar 20 · Trend Boost 15 ·
  Editar Imagem 10 · Nano Banana Pro 20 · Influencer Studio 30. Provider real: **Google Gemini (Nano Banana /
  Gemini 2.5 Flash Image)**. Falha→estorno automático.
- **Notificações** — feed in-app + Web Push (VAPID, lib `nl.martijndwars:web-push`) + **agendamento**
  (`scheduledAt` + `@Scheduled` — **falta coluna** em `notifications`).

### 4.2 REMOVIDO (classes e tabelas deletadas — não recriar)

- **Academy** (áudio 4): entidades `AcademyModule`/`AcademyLesson`/`LessonProgress`, DTOs, repositories,
  services e controllers `Academy*`; tabelas `academy_modules`/`academy_lessons`/`lesson_progress` (V2).
  Panda Video sai.
- **Compra de crédito** (áudio 5): `CreditPackage` + `CreditPackageController`/`Service`/`Repository`/`DTO`;
  enum `PACKAGE_PURCHASE`; tabela `credit_packages` + seed (V3). Pasta inteira `services/payment/`
  (`PaymentGateway`, `FakePaymentGateway`, `CheckoutRequest`, `CheckoutSession`).
- **TokEditor** (áudio 4): valor `VIDEO_EXPORT` do enum `GenerationJobType`.
- **Front:** rotas `editor.tsx`, `academy.tsx`, `creditos.tsx` + telas `EditorScreen`/`AcademyScreen` +
  `academyModules` mock + links no menu/dock/launchpad/perfil.

### 4.3 BLOQUEADO (esperar decisão do dono)

- **Modelos Virais**: `ViralTemplate` + telas do front congeladas. Escopo (vitrine vs. integra com Estúdio) reaberto.
- **"Store"** das Ferramentas: indefinido, fora do MVP.
- **Saque da Indicação**: módulo adiado (e áudio 2 esvaziou o resto — só a tela por ora).

---

## 5. Já existe no código (não recriar)

**Controllers:** Auth, Credit, DashboardInsight, GalleryAvatar, Generation, Login, Product, Registration,
Storage, User, UserProduct. *(Academy* e CreditPackage removidos.)*
**Services:** Auth, **Credit** (débito atômico + estorno idempotente — a adaptar p/ quota auto-regen),
DashboardInsight, Email, GalleryAvatar, **GenerationJob**, Jwt, Mfa, Product, Registration, **Storage**,
UserProduct, User. *(Academy* e CreditPackage removidos.)*
**Providers/stubs:** `FakeGenerationProvider` (trocar por Gemini). *(`services/payment/*` removido.)*
**Migrations:** V1 `init`, V2 `domain_entities`, V3 `base_transversal` (V2/V3 editados: sem academy/credit_packages).

---

## 6. Ordem de implementação (dependência-first)

1. Ajuste de **papéis** (`ROLE_AFFILIATE` + seed + `@PreAuthorize`) — destrava o resto.
2. **Créditos como quota auto-regenerável** (definir mecânica — §7-A — e adaptar `CreditService`/`CreditWallet`).
3. **Planos & Assinaturas** (+ `paymentUrl`; o plano define a quota).
4. **Admin de Usuários** (aprovação/bloqueio/roles/plan).
5. **Perfil** (+ preferências).
6. **CRUDs simples:** Prompts, Vendas ao Vivo.
7. **Dashboard** (métricas + insights + filtros + endpoint agregado por papel).
8. **Produtos** (vitrine, KPIs, favoritos, meus produtos).
9. **Estúdio + Avatares + Trend Boost + Ferramentas** (job framework + Gemini, só imagem/prompt).
10. **Notificações** (in-app + push + agendamento).

Cada módulo: migration (se precisar de coluna nova) → repository (query nativa + índice) → service → controller → testes.

---

## 7. Pendências abertas — CONFIRMAR com os sócios

**A. Créditos (crítico — novo modelo).** Decidido: **sem compra**, crédito **regenera automaticamente** e
possivelmente em **dois tipos (imagem e prompt)**. Falta definir a **mecânica exata**: (1) período de
regeneração (mensal? diário? ao renovar o plano?); (2) quantidade por plano e por tipo; (3) se **prompt
realmente consome crédito** ou é livre (o "talvez" do áudio); (4) se a quota é **cheia a cada ciclo** (reset)
ou **acumula**. Impacto técnico: `CreditWallet` deixa de ser "saldo comprável" e vira **quota por tipo**
(prováveis colunas `image_credits`/`prompt_credits` + `credits_reset_at`), e `CreditService` ganha a lógica de
regeneração. **Não implementar antes de fechar esses 4 pontos.**

**B. Papéis.** Ver §3 (mapeamento técnico + o que "renomear ADM" significou). Confirmar se Afiliado realmente
pode **liberar/bloquear** acesso (o áudio diz que sim).

**C. Indicação.** Interpretado como **só tela, sem backend**. Confirmar.

---

## 8. Ajustes de schema previstos (migrations novas — V4+)

- `ROLE_AFFILIATE` (seed) — já ajustado no seed base.
- `plans.payment_url` (coluna).
- **Créditos (quota):** colunas de quota por tipo em `credit_wallets` (ex.: `image_credits`, `prompt_credits`,
  `credits_reset_at`) — depende de §7-A.
- `notifications.scheduled_at` (coluna) + índice p/ o job de disparo.
- `tb_user`: colunas/JSONB de preferências (tema/notificações).
- (Divergência a checar: DTOs `UserInsert/Update` têm `birthDate`, entidade `User` não tem.)

---

## 9. Fora de escopo (mantido)

Geração final de vídeo (é no Flow), API automática do TikTok Shop, infra/domínio recorrentes, TokEditor,
Academy, compra de crédito avulso.

---

## 10. Frentes concluídas (2026-07-08) — só backend, front pendente

Fechadas 5 pontas soltas identificadas olhando as telas (front continua mock). 1 commit por frente.

- **Períodos do dashboard.** `GET /api/dashboard` agora aceita `?period=` em `today | week | 7d | 15d | month
  | 30d | custom` (+ `from`/`to` ISO para custom). Rolling = "agora − N dias"; calendário (`week`/`month`) =
  início da semana/mês corrente em UTC; `custom` = intervalo `[from, to]` inclusivo. Período desconhecido ou
  `custom` sem datas → **400**. Sem `period` → default `7d`.
- **Cards de mineração.** `GET /api/products/mining-status` (qualquer autenticado) → `MiningStatusDTO`:
  `newProductsCount` (criados desde o último boundary de 6h), `detectedRevenue` (`SUM(estimatedRevenue)` do
  catálogo = **oportunidade de mercado, ≠ faturamento**), `secondsUntilNextRefresh` (countdown determinístico
  ancorado no epoch — estável em reloads/reinícios) e `online`. Substitui os cards hardcoded do front.
- **`mining_window` virou enum** `MiningWindow` (`W_00_06 | W_06_12 | W_12_18 | W_18_24`, faixas de 6h). Coluna
  segue `VARCHAR` (`@Enumerated STRING`, sem DDL de tipo); `@PrePersist` deriva da hora de `created_at` quando
  nula; filtro `?window=` parseia p/ enum (inválido → 400). **V6** faz backfill dos valores de texto antigos.
- **Notificações in-app (sino).** Runtime completo: envio manual do admin, caixa/leitura do usuário, campanhas
  recorrentes (scheduler) e prova social de venda. Modelo eficiente: `audience=ALL` **não faz fan-out** (uma
  linha; não-lido = ausência em `notification_reads`); `SELECTED` usa `notification_targets`. `type=SALE` é
  **efêmera** (broadcast STOMP `/topic/notifications`, não persiste nem entra na caixa). Rotas: usuário logado
  (`GET /api/notifications`, `/unread-count`, `POST /{id}/read`, `/read-all`) + admin (`POST/GET
  /api/admin/notifications`, CRUD `/api/admin/notifications/schedules`). **V7**: coluna `type` +
  `notification_reads` + `notification_schedules`.
  - **Divergência vs. §4.1/§8:** implementado via `notification_schedules` (campanhas recorrentes por
    `intervalSeconds`, `lastFiredAt` persistido) em vez da coluna `scheduled_at` prevista — modelo mais rico.
    **Web Push VAPID fica para fase 2** (entidades `notification_deliveries`/`push_subscriptions` intocadas,
    já preparadas); canal atual é sino in-app + STOMP.
- **"Tendências" = Dashboard Insights (já pronto, zero código novo).** O toggle "Tendências" do front consome
  os insights existentes: `GET /api/dashboard/insights` (leitura) + CRUD admin em `/api/admin/dashboard/insights`.
  `kind` ∈ `CARD` (cards de insight) | `MOMENT_READ` ("leitura do momento"). **Não confundir** com o endpoint
  composto `/api/dashboard?period=` (métricas). Backend pronto — **falta só o front consumir**. Opcional (não
  incluso): campo `icon` em `DashboardInsight` para ícone por card.

> **Migrations:** `V6__backfill_mining_window.sql`, `V7__notifications_runtime.sql`. Numeradas na **ordem de
> execução** (mining_window antes de notificações) para evitar migration out-of-order do Flyway.
