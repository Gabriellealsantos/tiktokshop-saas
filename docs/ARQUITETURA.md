# ARQUITETURA — Plataforma SaaS TikTok Shop (Venyx)

> **Documento-base do projeto.** Define toda a API REST (endpoints, papéis, o que cada um faz), o modelo de acesso/créditos/pagamento e a arquitetura transversal — verificado contra o **frontend** (TanStack Start/React 19) para garantir que o backend entrega tudo que as telas precisam.
> Idioma de código/comentários/commits: **pt-BR**. Status: ✅ feito · 🟡 parcial · ⬜ a fazer.

## Context

Backend Spring Boot 4.1 / Java 21 / Postgres 18 / Flyway / S3-MinIO. Auth OAuth2 (Authorization Server + Resource Server) e todas as entidades das Fases 0–5 + opcionais **já existem**. Falta implementar **services + controllers**. O frontend já está em desenvolvimento (mock data) e é a referência do escopo contratado: **tudo que está no front, o back precisa entregar** (o back pode ter a mais).

**Decisões travadas:**
- **Login:** mantém **OAuth2 `authorization_code` + PKCE** (o SPA usa o `/login` do Authorization Server). Sem endpoint de senha direto.
- **Pagamentos (decidido 2026-07-07):** **não há gateway integrado nem webhook**. Cada plano/pacote tem um **`paymentUrl` (link externo)** cadastrado pelo admin, com o valor já correspondido no provedor que o dono tem contrato. O botão "Comprar" só **redireciona**. Liberação de crédito/plano é **manual** pelo admin (`POST /api/admin/users/{id}/credits` e atribuição de assinatura). O stub `PaymentGateway`/`FakePaymentGateway` fica obsoleto.
- **Geração de IA:** **assíncrona por `GenerationJob`** (debita crédito antes, estorna em falha, polling de status).
- **Storage:** **S3/MinIO**. **Métricas do dashboard:** manuais (sem API do TikTok).
- **Notificações (decidido 2026-07-07):** além do disparo imediato, o admin pode **agendar** notificações por timer (horário futuro).

---

## 1. Convenções

- Camadas `Controller → Service → Repository`. DTOs `record` + Bean Validation. Nunca expor entidade (sempre `Response`).
- Rotas: prefixo `/api`. Públicas `/api/auth/**`, `/api/public/**`. Admin `/api/admin/**`. Demais autenticadas.
- DTOs `XxxCreateDTO` / `XxxUpdateDTO` / `XxxResponse`. Paginação Spring `Pageable` (`?page=&size=&sort=`).
- Erros: `StandardError` JSON (já existe `ControllerExceptionHandler`). Validação → 422.
- `@PreAuthorize` por rota + **ownership/IDOR** em recursos por id. Idempotência em crédito/pagamento/comissão.

## 2. Modelo de acesso

- **Papéis:** `SUPER_ADMIN`, `ADMIN`, `CLIENT`, **`AFFILIATE`** ⬜ *(o front tem o papel "afiliado" — adicionar)*.
- **Status (`UserStatus`):** `PENDING_CONFIRMATION` → `ACTIVE` · `LOCKED` · `DISABLED`. (Front: pendente/aprovado/bloqueado.)
- **Fluxo:** autocadastro → `PENDING_CONFIRMATION` → **admin aprova** (`ACTIVE`) e **atribui plano** → acesso liberado. Front mostra "conta pendente de aprovação" após cadastro.
- **Gating (`AccessGuard`):** features exigem `ACTIVE` + assinatura ativa; funções de IA exigem ainda **crédito** + **tentativas mensais** disponíveis (front mostra "2/3 grátis este mês").

## 3. Arquitetura transversal

- **Storage (`StorageService`, S3/MinIO) ✅:** endpoint genérico `POST /api/admin/storage/upload?folder=` (multipart, ADMIN+SUPER_ADMIN) — AWS SDK v2 (`S3Client` com `endpointOverride`+`forcePathStyle(true)` pra MinIO local; em prod sem override, o SDK resolve o S3 real pela região). Upload proxeado pelo backend (sem presigned URL — mais simples pro caso de uso atual, que é seed manual via admin), retorna `{ url }`, que é colado manualmente no campo `imageUrl` de qualquer DTO que precise (avatar da galeria, produto, produto próprio). Reaproveitado por todos os módulos com imagem — não há upload embutido em cada CRUD. Vídeo do TokEditor ainda não usa esse endpoint (fluxo de export ainda não implementado).
- **Geração assíncrona (`generation_jobs`, V3):** `type` ∈ {`STUDIO_SESSION`, `AVATAR`, `TREND_BOOST`, `IMAGE_EDIT`, `TEXT_TO_IMAGE`, `VIDEO_EXPORT`}; `status` PENDING/RUNNING/COMPLETED/FAILED; `reference_id`, `credit_tx_id` (estorno), `result` JSONB (URLs + prompts), `error`. **`GenerationProvider`** (interface) abstrai a IA — provider **decidido: Google Gemini (Nano Banana / Gemini 2.5 Flash Image)**. Front faz polling.
- **Pagamentos (link externo, decidido 2026-07-07):** **sem provider/SDK/webhook.** Plano e pacote de crédito guardam um campo `paymentUrl`; o front redireciona o usuário para lá. A carteira é creditada / a assinatura é ativada **manualmente pelo admin** após o pagamento (não há confirmação automática). Consequência: a comissão de indicação (50/50) também depende de confirmação manual do admin.
- **Notificações:** **feed in-app** (`in_app_notifications`) + **web push** (VAPID, `nl.martijndwars:web-push`, envio em lote, limpeza de 410).
- **Jobs agendados:** expirar assinaturas; limpar push inválido; (tentativas mensais são derivadas).

---

## 4. Endpoints por módulo

> Acesso: **P** público · **U** usuário (ACTIVE+assinatura) · **A** admin · **self** dono.

### 4.0 Auth & Conta
| Método | Rota | Acesso | Descrição | Status |
|---|---|---|---|---|
| GET/POST | `/oauth2/authorize` · `/oauth2/token` · `/login` · `/logout` | P | OAuth2 authorization_code + PKCE + refresh | ✅ |
| POST | `/api/auth/register` | P | Autocadastro (nome/email/senha) → PENDING + e-mail | ✅ |
| GET | `/api/auth/confirm?token=` · POST `/api/auth/resend-confirmation` | P | Confirmação de e-mail | 🟡 |
| POST | `/auth/recover-token` · PUT `/auth/new-password` | P | Recuperação de senha por token | ✅ |
| PUT | `/api/users/me/password` | self | **Trocar senha autenticado** (senha atual + nova) — front Perfil | ⬜ |
| GET/PUT | `/api/users/me` | self | Ver/editar perfil (nome, telefone) | 🟡 |
| POST | `/mfa/setup` · `/mfa/activate` · `/mfa/verify` · `/mfa/disable` | self | MFA TOTP | 🟡 |

### 4.1 Admin — Usuários, Planos, Assinaturas
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/admin/users?status=&role=&plan=&search=&page=` | A | Lista com filtros (front: status/role/plano/busca) |
| PATCH | `/api/admin/users/{id}/approve` · `/block` · `/unblock` | A | Liberar / bloquear acesso |
| PATCH | `/api/admin/users/{id}/roles` | SUPER_ADMIN | Atribuir papéis (inclui **AFFILIATE**) |
| PATCH | `/api/admin/users/{id}/plan` | A | Trocar plano do usuário (dropdown do front) |
| GET | `/api/plans` | U | Planos disponíveis |
| GET/POST/PUT/DELETE | `/api/admin/plans` | A | CRUD de planos (inclui preço + **`paymentUrl`** de redirect). **`PlanType`: MONTHLY, QUARTERLY, SEMIANNUAL, ANNUAL, LIFETIME** ⬜ |
| POST | `/api/admin/users/{id}/subscription` | A | Atribuir/ativar assinatura (define `expiresAt`) |
| GET | `/api/users/me/subscription` | U | Assinatura atual (Perfil) |

### 4.2 Pagamentos & Créditos
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/credit-packages` | U | Pacotes à venda (Starter→Enterprise: créditos, preço, bônus%, **`paymentUrl`**) ✅/🟡 (falta expor `paymentUrl`) |
| — | *(sem checkout/webhook)* | — | **Decidido 2026-07-07:** o botão "Comprar" só redireciona para o `paymentUrl` do pacote/plano. Sem endpoint de checkout, sem webhook. Crédito entra por `POST /api/admin/users/{id}/credits` (manual). |
| GET | `/api/admin/credit-packages` · POST/PUT/DELETE | **SUPER_ADMIN** | CRUD dos pacotes ✅ — inclui `paymentUrl` (restrito a SUPER_ADMIN, por envolver preço/monetização) |
| GET | `/users/me/wallet` · `/wallet/transactions` | U | Saldo + extrato ✅ (implementado sem prefixo `/api`, seguindo a convenção real do `UserController`) |
| GET | `/users/me/usage` | U | Créditos debitados em gerações no mês corrente ✅ |
| POST | `/api/admin/users/{id}/credits` | A | Conceder/ajustar créditos (ADMIN_CREDIT) |

### 4.3 Dashboard
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/dashboard?period=` | U | Por papel: **admin** Faturamento (cards + **série diária** vendas/pedidos); **user** Tendências ⬜ |
| GET/POST/PUT/DELETE | `/api/admin/dashboard/metrics` | A | CRUD das métricas **manuais** por período (SuperAdmin cadastra faturamento/pedidos/comissão/ticket + série do gráfico). Entidade `DashboardMetric` ✅ já existe; falta migration + controller ⬜ |
| GET | `/api/dashboard/insights?kind=` | U | Cards/dicas ativos do dashboard ✅ (endpoint enxuto; o composto `/api/dashboard?period=` já pode usar a entidade `DashboardMetric` que **já existe** — falta só migration + controller) |
| GET/POST/PUT/DELETE | `/api/admin/dashboard/insights` | A | Conteúdo de "Tendências" exibido ao usuário ✅ |

### 4.4 Mineração de Produtos
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/products?category=` | U | Vitrine, filtro por categoria ✅ (busca/janela de horário/paginação ainda ⬜) |
| GET | `/api/products/{id}` | U | Detalhe com **KPIs** (preço, vendas, receita est., views, conversão, comissão, vendas/dia, Δ7d, histórico 7d, janela, label, rank) ✅ |
| GET | `/api/products/stats` | U | Agregados da vitrine (novos, receita detectada, próxima atualização) ⬜ |
| POST/DELETE | `/api/products/{id}/favorite` · GET `/api/users/me/favorites` | self | Favoritar ⬜ |
| GET/POST/PUT/DELETE | `/api/user-products` | self | "Meu produto" ✅ — implementado em `/api/user-products` (não `/api/users/me/products`, seguindo o padrão REST simples já usado por `GenerationJob`); ownership via `findByIdAndUser_Uuid` (mesma proteção IDOR); upload de imagem via endpoint genérico de Storage, não embutido no CRUD |
| GET/POST/PUT/DELETE | `/api/admin/products` | A | CRUD da vitrine ✅ (todos os campos do modal admin + `imagens[]`; restrito a ADMIN+SUPER_ADMIN — é catálogo de dado de terceiro, não preço da própria Venyx) |

### 4.5 Estúdio de Criação
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/studio/sessions` · PUT `/{id}` · GET · DELETE | self | Sessão (formato UGC/POV/Cinema) + autosave de config JSONB |
| POST | `/api/studio/sessions/{id}/generate` | U | Gera **imagens de referência + prompts** (job, debita crédito) |
| GET | `/api/generations/{jobId}` | self | Re-consulta do resultado ✅ (falta o `POST` de submissão, que depende da sessão do Estúdio). Ver também o canal WebSocket abaixo para receber o status sem polling. |

**Canal WebSocket (push de status) ✅**: `{host}/ws` (STOMP sobre SockJS). Após conectar, enviar frame STOMP `CONNECT` com header `Authorization: Bearer {accessToken}` — a autenticação acontece nesse frame (via `WebSocketAuthChannelInterceptor`), não no handshake HTTP, porque um client de browser não consegue customizar headers no handshake do WebSocket. Depois de conectado, `subscribe` em `/user/queue/generations` para receber um `GenerationJobDTO` toda vez que `GenerationJobService.submit()` finalizar um job (COMPLETED ou FAILED). Nota de arquitetura: hoje `submit()` roda 100% síncrono (a resposta do próprio `POST` de submissão já traz o job final), então o push do WebSocket dispara quase junto com a resposta HTTP — a infra foi montada agora para já estar pronta quando um provider de IA real e assíncrono (rodando em background) for plugado no lugar do `FakeGenerationProvider`. Broker STOMP em memória (`enableSimpleBroker`) — não escala para múltiplas instâncias sem trocar por Redis/RabbitMQ.

### 4.6 Avatares
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/avatars/gallery?gender=&type=` | U | **Galeria pré-pronta** (Mulheres/Homens/Modelos IA) ✅ |
| GET/POST/PUT/DELETE | `/api/admin/avatars/gallery` | A | CRUD da galeria pré-pronta ✅ |
| POST | `/api/avatars/generate` | U | 4 passos → job → **2 variações** |
| POST | `/api/avatars` · GET `?page=` · GET `/{id}` · PUT · DELETE | self | Salvar/listar "Meus Avatares" |

### 4.7 Trend Boost / Modelos Virais
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/trend-boost/templates` | U | Catálogo do **Trend Boost** (Novelinha/Objetos/Polêmicas) |
| POST | `/api/trend-boost/generate` | U | Wizard → **gera prompts** (job, debita crédito) ⬜ |
| GET/POST/PUT/DELETE | `/api/admin/viral-templates` | A | CRUD do catálogo |

> ⚠️ **Modelos Virais** virou tela própria no front (`/modelos`, `modelos-screen`/`model-assembly-screen`/`product-models-picker`), **separada** do Trend Boost. **Escopo REABERTO pelo dono (2026-07-07)**: se é só vitrine ou integra com o Estúdio **não está mais decidido**, e os templates ("Novela Viral"/"Objeto Falante"/3º + estilos POV/Imersivo/Cinematográfico) estão **congelados**. **Não construir o backend de Modelos Virais até o dono fechar o escopo.**

### 4.8 Ferramentas IA (créditos por uso)
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/tools/image-edit` | U | "Editar Imagem" (10cr) — upload + edição por IA → job ⬜ |
| POST | `/api/tools/text-to-image` | U | "Nano Banana Pro" (20cr) — imagem por prompt → job ⬜ |
| POST | `/api/tools/influencer-studio` | U | Atalho p/ geração de avatar (30cr) |
| GET | `/api/tools/store` | U | "Store" — catálogo de recursos `[A DEFINIR]` — adiado, dono vai revisar depois; fora do MVP por ora |

### 4.9 TokEditor (vídeo)
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/editor/exports` | U | Upload mp4 (≤24s) + enquadramento/texto → processa/exporta vertical → job ⬜ |
| GET | `/api/generations/{jobId}` | self | Polling do vídeo exportado |

### 4.10 Galeria de Prompts
`GET /api/prompts?category=&search=` (U) · CRUD `/api/admin/prompts` (A) — lista/copia prompts. (entidade ✅)

### 4.11 Creator Academy
Hierarquia **Módulo → Aula** (`academy_modules` 1—N `academy_lessons`, FK `module_id NOT NULL`, ambos com `order_index`). Vídeo de cada aula é um **link externo** (`video_url`, YouTube ou qualquer host gratuito) — o admin grava, sobe fora e cola a URL; **não passa pelo StorageService/S3**.

**Leitura (U — qualquer autenticado):**
- `GET /api/academy/modules` ✅ — módulos ordenados com as aulas aninhadas (hierarquia pronta pro front montar a tela).
- `GET /api/academy/lessons/{id}` ✅ — detalhe de uma aula (título, `videoUrl`, `duration`).

**CRUD administrativo (SUPER_ADMIN apenas — `hasRole('ROLE_SUPER_ADMIN')`, não ADMIN):** decisão explícita do dono — "essa parte de vídeo só vai ser pro super admin". Diverge do padrão ADMIN+SUPER_ADMIN de Product/GalleryAvatar/DashboardInsight.
- `GET /api/admin/academy/modules` ✅ (lista flat) · `POST` ✅ (201+Location) · `PUT /{id}` ✅ · `DELETE /{id}` ✅ (409 se o módulo tiver aulas — `module_id` é NOT NULL sem cascade).
- `GET /api/admin/academy/lessons?moduleId=` ✅ · `POST` ✅ (corpo com `moduleId`, 201+Location) · `PUT /{id}` ✅ · `DELETE /{id}` ✅.

**Progresso do aluno (⬜ a fazer):** `LessonProgress` / `POST /api/academy/lessons/{id}/complete` / `GET /api/users/me/academy/progress` (marcar aula concluída + progresso). Entidade e tabela `lesson_progress` já existem no schema; falta a API. O dono considera a **tela pronta** — falta só essa parte no backend. Front (`AcademyScreen`) segue **mock** até a ligação HTTP.

### 4.12 Notificações
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/users/me/notifications?type=&page=` | U | **Feed in-app** (venda/sistema/indicação/info) ⬜ |
| PATCH | `/api/users/me/notifications/{id}/read` · `/read-all` · DELETE `/{id}` | self | Marcar lida / dispensar ⬜ |
| GET | `/api/public/push/vapid-public-key` · POST/DELETE `/api/push/subscribe` | P/U | Web Push |
| POST | `/api/admin/notifications` · GET `/api/admin/notifications/{id}/deliveries` | A | Disparo (imediato **ou agendado**) + entregas |

> **Agendamento (decidido 2026-07-07):** o `POST /api/admin/notifications` aceita um horário futuro (`scheduledAt`); um job `@Scheduled` varre e dispara as pendentes na hora marcada. Vale para o feed in-app e para o Web Push.

### 4.13 Vendas ao Vivo (prova social)
`GET /api/public/live-sales` (P) · `PUT /api/admin/live-sales/config` · CRUD `/api/admin/live-sales/items` (A) — config + itens em rotação.

### 4.14 Indicação (Afiliados)
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/users/me/referral/code` · `/earnings` | U | Código/link + métricas (indicações, conversões, comissão) |
| GET/PUT | `/api/users/me/referral/page` | self | **Página de divulgação personalizada** (título/mensagem) ⬜ |
| (param) | `POST /api/auth/register` + `referralCode` | P | Vincula indicado (auto-indicação proibida) |
| GET | `/api/admin/referrals` · PATCH `/commissions/{id}/pay` | A | Painel + pagar comissão (50/50) |

---

## 5. Matriz de cobertura Front ↔ Back

| Tela do front | Endpoints | Cobertura |
|---|---|---|
| Login/Cadastro | OAuth2 + `/api/auth/register` | ✅ (front usa o `/login` do AS) |
| Launchpad `/` | `/api/products` (top), `/api/academy/modules` | ✅ |
| Dashboard | `/api/dashboard`, `/admin/dashboard/metrics`+`/insights`, `/public/live-sales` | 🟡 (insights ✅; série/métricas de faturamento ⬜ — entidade `DashboardMetric` já existe, falta migration+controller+filtros) |
| Produtos + modais | `/api/products*`, `/api/user-products`, `/admin/products`, favorites | 🟡 (listagem+detalhe+CRUD admin+CRUD "meu produto" ✅; busca/janela/paginação/stats/favorites ⬜) |
| Estúdio | `/api/studio/sessions*`, `/generations/{job}` | 🟡 |
| Avatares | `/api/avatars*`, `/avatars/gallery` | 🟡 (galeria ✅; wizard de geração ⬜) |
| Trend Boost | `/api/trend-boost/*` | ⬜ |
| Ferramentas IA | `/api/tools/*` | ⬜ |
| TokEditor | `/api/editor/exports` | ⬜ |
| Prompts | `/api/prompts` | 🟡 |
| Academy | `/api/academy/*`, `/admin/academy/**` | 🟡 (CRUD módulos+aulas SUPER_ADMIN ✅, leitura pública c/ hierarquia ✅; progresso/marcar-concluída ⬜ deferido; front mock) |
| Créditos | `/api/credit-packages*` (+ `paymentUrl`) | 🟡 (catálogo de pacotes ✅; falta expor `paymentUrl` e o redirect no "Comprar" — **sem checkout/webhook**, decidido 2026-07-07) |
| Indicação | `/api/users/me/referral/*`, `/admin/referrals` | 🟡 (página ⬜) |
| Config/Perfil | `/api/users/me`, `/me/password`, `/me/subscription`, `/wallet`, `/usage` | 🟡 (trocar senha ⬜) |
| Admin | `/api/admin/users*`, plans, metrics, referrals | 🟡 |
| Sino (in-app) | `/api/users/me/notifications*` | ⬜ |

## 6. Adições de schema (migrations)
- **V3:** role `AFFILIATE` (seed); expandir `PlanType` (QUARTERLY/SEMIANNUAL/ANNUAL); **expandir `products`** (price, images[], revenue_estimate, conversion_rate, commission_rate, sales_per_day, sales_delta_7d, trend_label, rank_in_category, sales_history_7d JSONB, mining_window, viral, last_updated_at); `generation_jobs`.
- **V4:** `credit_packages` (+ `payment_url`); coluna `payment_url` em `plans`; `dashboard_metrics`; `in_app_notifications` (+ `scheduled_at` para agendamento); `avatar_gallery`; `dashboard_insights`; campos de página em `referral_codes` (ou `referral_pages`); `video_exports` (ou via generation_jobs). **Sem tabelas de compra/webhook** (`credit_purchases`/`subscription_purchases` desnecessárias — pagamento é link externo).
- Libs no `pom`: `web-push`, SDK S3/MinIO. **Sem SDK de gateway de pagamento** (não há integração).

## 7. Ordem de implementação (dependência-first)
1. Transversais: `CreditService`, `AccessGuard`, `StorageService`, `GenerationJob`+`GenerationProvider` (mock). *(PaymentProvider não é mais necessário — pagamento é link externo.)*
2. **Fase 1** (Admin: usuários/planos/assinaturas + papel AFFILIATE) → destrava acesso.
3. **Créditos/Planos** (CRUD com `paymentUrl` + crédito manual do admin) → destrava monetização.
4. **Produtos** (expandido) → **Estúdio/Avatares/Trend Boost/Ferramentas** (geração) → **TokEditor**.
5. **Dashboard**, **Notificações** (in-app + push), **Academy/Prompts/Live Sales/Indicação**.
Cada módulo: entidade(✅) → migration → repository → service → controller → testes.

## 8. Decisões do dono (atualizado 2026-07-07)

### Decididas ✅
- **Provider de IA**: Google Gemini (Nano Banana / Gemini 2.5 Flash Image). **Custo em créditos por função/formato**: Estúdio 15cr, Avatar 20cr, Trend Boost 15cr, Editar Imagem 10cr, Nano Banana Pro 20cr, Influencer Studio 30cr.
- Valor do `SIGNUP_BONUS` = 60 créditos; teto de tentativas mensais = 400 gerações/mês (flat, não varia por plano).
- Hospedagem dos vídeos da Academy: **Panda Video**. Chaves VAPID: lib `nl.martijndwars:web-push` + env var. Processamento do TokEditor: **client-side (ffmpeg.wasm)** — ⚠️ aviso: risco de performance em mobile/Safari, plano B é migrar pra server-side se necessário.
- **Pagamento (2026-07-07): sem gateway — é só um `paymentUrl` de redirect** por plano/pacote, cadastrado pelo admin (valor já correspondido no provedor externo). Liberação de crédito/plano é manual pelo admin. O botão "Afiliar" dos produtos segue a mesma ideia (`affiliateUrl` → TikTok).
- **Notificações agendadas (2026-07-07):** admin pode agendar disparo por timer (`scheduledAt` + job `@Scheduled`).

### Ainda pendentes ⛔ (adiadas pelo dono)
- **Modelos Virais (2026-07-07 — REABERTO):** se é só vitrine ou integra com o Estúdio voltou a ficar indefinido; templates congelados. Não codar o backend até fechar.
- O que é a **"Store"** das Ferramentas — adiado, fora do MVP por ora.
- Fluxo de saque da indicação — **módulo de Indicação inteiro adiado**, dono quer revisar a lógica de negócio antes de destravar.

## 9. Fora de escopo (proposta §4.2)
Geração final de vídeo (Grok/VEO3), integração automática com API do TikTok Shop, infra/domínio recorrentes, qualquer recurso fora do Documento de Funcionalidades v2.1.
