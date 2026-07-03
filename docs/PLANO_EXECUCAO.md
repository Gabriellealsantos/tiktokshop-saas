# PLANO DE EXECUÇÃO — do backend base até o front conectado

> Complementa o `docs/ARQUITETURA.md` (mapa de endpoints) e os HANDOFFs.
> **Estado atual (base pronta):** segurança OAuth2/JWT/MFA, entidades + repositories de todos os módulos,
> migrations V1–V3, exception handler global, `CreditService` (débito atômico + estorno idempotente),
> `GenerationJobService` + `GenerationProvider` (stub) e `PaymentGateway` (stub), com testes unitários.
> Os módulos "opcionais" dos HANDOFFs são **obrigatórios**.
>
> **Convenções (valem para tudo abaixo):** Controller → Service → Repository; DTOs `Create`/`Update`/`Response`
> (records, padrão `UserDTO`); Native Query preferida; rotas `/api/**` autenticadas, `/api/admin/**` com
> `hasRole('ADMIN')`, `/api/public/**` públicas; `@PreAuthorize` + ownership (IDOR → 404) em todo GET/PUT/DELETE
> por id; erros pelo `ControllerExceptionHandler` (402 créditos, 404, 409, 422); pt-BR em código/commits.

---

## Ordem de execução (dependência-first)

| # | Módulo | Estimativa | Depende de |
|---|--------|-----------|------------|
| 1 | Créditos & Pacotes (user + admin) | 1 dia | base (pronta) |
| 2 | Planos & Assinaturas | 1 dia | — |
| 3 | Admin de Usuários (aprovação/bloqueio) | 1 dia | — |
| 4 | Perfil (`/users/me`, trocar senha) | 0,5 dia | — |
| 5 | CRUDs simples: Prompts, Modelos Virais, Vendas ao Vivo | 1 dia | — |
| 6 | Dashboard (métricas + insights) | 1 dia | — |
| 7 | Academy (módulos/aulas/progresso) | 1 dia | — |
| 8 | Produtos (vitrine, KPIs, favoritos, meus produtos) | 2 dias | — |
| 9 | Estúdio + Avatares + Trend Boost + Ferramentas | 2 dias | jobs (pronto) |
| 10 | Notificações (in-app + Web Push) | 1,5 dia | — |
| 11 | Indicação (código, ganhos, painel admin) | 1 dia | assinaturas |
| 12 | Integração do front (troca dos mocks) | 3–4 dias | módulos acima |
| — | Checkout real + webhook | bloqueado | gateway `[A DEFINIR]` (adiado — dono já tem provedor em mente) |
| — | Provider de IA real | **desbloqueado** | **Google Gemini (Nano Banana / Gemini 2.5 Flash Image)** — decidido |
| — | TokEditor (processamento de vídeo) | **desbloqueado** | **client-side (ffmpeg.wasm)** — decidido, ver §12 |

Total estimado do que não está bloqueado: **~13–14 dias úteis** (Provider de IA e TokEditor saem da lista de bloqueio agora que foram decididos — só falta o gateway de pagamento).

---

## 1. Créditos & Pacotes

**Endpoints**
| Método | Rota | Acesso |
|---|---|---|
| GET | `/api/users/me/wallet` | self — saldo (`CreditWalletDTO`) |
| GET | `/api/users/me/wallet/transactions` | self — extrato paginado |
| GET | `/api/users/me/usage` | self — consumo de geração no mês (`monthlyGenerationUsage`) |
| GET | `/api/credit-packages` | U — pacotes ativos ordenados |
| POST | `/api/credit-packages/{id}/checkout` | U — cria sessão via `PaymentGateway` (stub) |
| GET/POST/PUT/DELETE | `/api/admin/credit-packages` | A — CRUD |
| POST | `/api/admin/users/{id}/credits` | A — conceder/ajustar créditos (`CreditService.credit`, reason `ADMIN_CREDIT`) |

**Regras/borda:** débito sempre via `CreditService` (nunca manipular saldo direto); `SIGNUP_BONUS` no registro
**= 60 créditos** (decidido); pacote inativo não aparece nem aceita checkout; extrato ordenado desc.
**Reuso:** `CreditService`, `CreditPackageRepository.findByActiveTrueOrderByOrderIndexAsc()`, DTOs já criados.

## 2. Planos & Assinaturas

**Endpoints:** `GET /api/plans` (U) · `GET/POST/PUT/DELETE /api/admin/plans` (A) ·
`POST /api/admin/users/{id}/subscription` (A — atribui plano; `LIFETIME` sem `expiresAt`) ·
`GET /api/users/me/subscription` (self) · `POST /api/plans/{id}/checkout` (U — stub).

**Regras/borda:** uma assinatura ATIVA por usuário (nova → encerra anterior); expiração = job diário
(`@Scheduled`) marcando `EXPIRED`; usuário sem assinatura ativa = gating no front (`AccessGuard`);
preços `[A DEFINIR]` — adiado junto com o gateway de pagamento (§12.2); CRUD admin resolve assim que os
valores vierem.

## 3. Admin de Usuários

**Endpoints:** `GET /api/admin/users?status=&role=&plan=&search=&page=` ·
`PATCH /api/admin/users/{id}/approve|block|unblock` · `PATCH /api/admin/users/{id}/roles` ·
`PATCH /api/admin/users/{id}/plan`.

**Regras/borda:** aprovar = `PENDING → ACTIVE` (front `/cadastro` mostra tela "aguardando aprovação");
não bloquear SUPER_ADMIN nem a si mesmo (padrão já existente em `UserService.delete`); filtros via Native Query
com paginação. **Reuso:** `UserRepository.searchUsers`, validações de role do `UserService`.

## 4. Perfil

**Endpoints:** `GET/PUT /api/users/me` (nome, preferências) · `PUT /api/users/me/password`
(senha atual + nova, validador `Password` existente). Preferências (tema/notificações) → colunas simples em `tb_user`
(migration V4 curta) ou JSONB `preferences`.

## 5. CRUDs simples (lote)

- **Prompts:** `GET /api/prompts?category=&search=` (U) · `POST/PUT/DELETE /api/admin/prompts` (A).
  Borda: categoria vazia → lista vazia; `@Size` no conteúdo — **limite = 2.000 caracteres** (decidido).
- **Modelos Virais:** `GET /api/viral-templates` (U) · CRUD admin. Borda: URL de thumbnail validada por formato.
  **Decidido: integra com o Estúdio** — clicar num modelo cria uma sessão do Estúdio pré-preenchida
  (`template_id` inicial), não é só vitrine.
- **Vendas ao Vivo:** `GET /api/public/live-sales` (config + itens ativos) · `PUT /api/admin/live-sales/config` ·
  CRUD `/api/admin/live-sales/items`. Borda: `enabled=false` → flag desligada + lista vazia; intervalo mínimo ≥ 5s.

## 6. Dashboard

**Endpoints:** `GET /api/dashboard?period=` (U — por papel: admin vê faturamento, user vê tendências) ·
`GET/PUT/DELETE /api/admin/dashboard/metrics` (CRUD por `period_type`+`period_ref`) ·
`GET/POST/PUT/DELETE /api/admin/dashboard/insights` (cards + "leitura do momento", entidade pronta).

**Regras:** métricas 100% manuais (admin edita); série diária p/ gráfico de 7d = registros `DAILY` consecutivos;
filtros do front: Hoje/Semana/7d/15d/Mês/30d.

## 7. Academy

**Endpoints:** `GET /api/academy/modules` (módulos + aulas ordenadas) · `GET /api/academy/lessons/{id}` ·
`POST /api/academy/lessons/{id}/complete` · `GET /api/users/me/academy/progress` · CRUD admin de módulos e aulas.

**Regras/borda:** só usuário com acesso ativo; reordenação via `order_index`; `video_url` morta é responsabilidade
do admin; **hospedagem dos vídeos decidida: Panda Video** — CRUD pode seguir normalmente.

## 8. Produtos

**Endpoints:** `GET /api/products?category=&search=&window=&page=` · `GET /api/products/{id}` (KPIs completos —
campos novos da V3) · `GET /api/products/stats` (agregados: novos, receita detectada, próxima atualização) ·
`POST/DELETE /api/products/{id}/favorite` + `GET /api/users/me/favorites` ·
`GET/POST/PUT/DELETE /api/users/me/products` (meu produto, upload de imagem — multipart 5MB já configurado) ·
CRUD `/api/admin/products`.

**Regras/borda:** favorito duplicado → idempotente (constraint `uq_favorite` já existe); produto removido pelo
admin que está no estúdio de um usuário → sessão continua com snapshot (JSONB da sessão); URL de imagem validada
por formato, nunca baixada. Vitrine "mineração" = conteúdo gerenciado pelo admin (mesma filosofia manual do dashboard).

## 9. Estúdio + Avatares + Trend Boost + Ferramentas (sobre o job framework)

**Endpoints:**
- `POST /api/studio/sessions` · `PUT /api/studio/sessions/{id}` (autosave JSONB, status DRAFT) ·
  `POST /api/studio/sessions/{id}/generate` → `GenerationJobService.submit(STUDIO_SESSION, custo)` ·
  `GET /api/generations/{jobId}` (polling — `findByIdForUser`, único endpoint p/ todos os tipos).
- `GET /api/avatars/gallery?gender=&type=` (galeria pré-pronta — `GalleryAvatarRepository.findGallery`) +
  CRUD admin da galeria · `POST /api/avatars/generate` (job AVATAR, 2 variações) ·
  `GET/POST/PUT/DELETE /api/users/me/avatars` (meus avatares).
- `GET /api/trend-boost/templates` · `POST /api/trend-boost/generate` (job TREND_BOOST).
- `POST /api/tools/image-edit` (10cr) · `POST /api/tools/text-to-image` (20cr) ·
  `POST /api/tools/influencer-studio` (30cr) · `GET /api/tools/store` (`[A DEFINIR]` o que é a Store — **adiado**,
  fora do MVP por ora).

**Regras/borda:** custo em créditos por função/formato **decidido** — Estúdio 15cr, Avatar 20cr, Trend Boost 15cr
(Editar Imagem/Nano Banana Pro/Influencer Studio já vinham do front: 10cr/20cr/30cr); colocar essa tabela em
properties/config; provider = **Google Gemini (Nano Banana / Gemini 2.5 Flash Image)**; falha do provider →
estorno automático (já implementado); usuário sai no meio → sessão DRAFT retomável;
teto mensal de tentativas **= 400 gerações/mês por usuário** (flat, não varia por plano — usar `monthlyGenerationUsage`).

## 10. Notificações

- **Feed in-app:** `GET /api/users/me/notifications?type=&page=` · `PATCH .../{id}/read` · `PATCH .../read-all` ·
  `DELETE .../{id}`. Tipos: venda/sistema/indicação/info (sino do front).
- **Web Push (Fase 5 — foco do dono):** `GET /api/public/push/vapid-public-key` · `POST/DELETE /api/push/subscribe` ·
  `POST /api/admin/notifications` (disparo: título, corpo, imagem, audiência ALL/SELECTED) ·
  `GET /api/admin/notifications` + `/{id}/deliveries`.

**Técnica:** lib `nl.martijndwars:web-push` (confirmada); payload ≤ 4KB → **imagem vai por URL**, reaproveitando a
`image_url` já existente do produto/avatar (HTTPS + CORS — decidido); envio assíncrono em lote (`@Async`/fila
interna); 410 Gone → remover subscription; usuário sem permissão → ignorar; chaves VAPID geradas uma vez e
guardadas em env var, nunca no repo (decidido, RNF-14).

## 11. Indicação

**Endpoints:** `GET /api/users/me/referral/code` (gera se não existir) · `GET /api/users/me/referral/earnings` ·
`GET/PUT /api/users/me/referral/page` (campos `pageTitle`/`pageMessage` da V3) ·
`GET /api/admin/referrals` · `PATCH /api/admin/referrals/commissions/{id}/pay`.

**Regras/borda (dinheiro — cuidado):** comissão 50/50 só quando pagamento do indicado for **confirmado** (depende
do webhook do gateway → até lá, confirmação manual do admin); auto-indicação proibida; idempotência por
`referral_id`; estorno do indicado → reverter comissão; dois códigos p/ mesmo indicado `[A DEFINIR]`;
**fluxo de saque `[A DEFINIR]` — módulo inteiro adiado, dono quer revisar a lógica de negócio antes**.

## 12. Status das decisões do dono (atualizado 2026-07-03)

### Desbloqueadas ✅ — pode codar

1. **Provider de IA**: **Google Gemini (Nano Banana / Gemini 2.5 Flash Image)**. Custos: Estúdio 15cr, Avatar 20cr,
   Trend Boost 15cr, Editar Imagem 10cr, Nano Banana Pro 20cr, Influencer Studio 30cr → trocar `FakeGenerationProvider`.
3. **TokEditor**: **client-side (ffmpeg.wasm)**. ⚠️ Se performance mobile/Safari for insuficiente, plano B é migrar
   pra server-side (ffmpeg no backend) — isolar bem a lógica de export pra não virar reescrita.
4. **Hospedagem dos vídeos da Academy**: **Panda Video**.
5. **Chaves VAPID + URL de imagem do push**: lib `nl.martijndwars:web-push`; chaves em env var; imagem reaproveita
   `image_url` do produto/avatar (HTTPS+CORS).
6. **Valores**: `SIGNUP_BONUS` = 60 créditos; teto mensal = 400 gerações/mês (flat); limite de prompt = 2.000 caracteres.
9. **Modelo Viral**: integra com o Estúdio (pré-preenche a sessão).

### Ainda bloqueadas ⛔ — não codar antes de resposta do dono

2. **Gateway de pagamento** (+ auto-compra vs liberação manual) + **preços de planos/pacotes** → trocar
   `FakePaymentGateway` + webhook assinado. **Adiado por último** — dono já tem um provedor em mente, só confirmar.
7. **Programa de Indicação**: saque da comissão + regra de conflito de indicação. **Módulo inteiro adiado** —
   dono vai revisar a lógica de negócio antes de destravar (rastreamento/comissão calculada pode seguir, só o
   pagamento automático fica bloqueado).
8. **"Store" das Ferramentas** (o que é). **Adiado, fora do MVP por ora.**

---

## 13. Integração com o front (troca dos mocks)

O front é 100% mock (`src/mock/data.ts`, `MockSessionProvider`). Trocar **módulo a módulo**, nesta ordem:

1. **Auth real:** login OAuth2 PKCE contra o Authorization Server (redirect `http://localhost:5173/authorized` já
   configurado), registro via `POST /api/auth/register`, tela "pendente de aprovação" ligada ao status real.
   Substituir `MockSessionProvider` por sessão real (token + refresh + claims de role).
2. **Camada de API:** criar client (fetch/axios) com interceptor de token e tratamento do `StandardError`
   (402 → modal "comprar créditos"; 403/404/422 → toasts).
3. **Por tela** (mapa mock → endpoint):
   | Tela | Endpoints |
   |---|---|
   | `/` + `/dashboard` | `GET /api/dashboard`, `GET /api/public/live-sales` |
   | `/produtos` | `GET /api/products*`, favoritos, `/users/me/products` |
   | `/estudio/*` | `POST /api/studio/sessions*`, `GET /api/generations/{id}` (polling) |
   | `/avatares` | `/api/avatars/gallery`, `/api/avatars/generate`, `/users/me/avatars` |
   | `/trend-boost/*` | `/api/trend-boost/*` |
   | `/ferramentas` | `/api/tools/*`, `GET /api/users/me/wallet` |
   | `/prompts` | `GET /api/prompts` |
   | `/academy` | `/api/academy/*`, progresso |
   | `/creditos` | `GET /api/credit-packages`, checkout (stub) |
   | `/indicacao` | `/api/users/me/referral/*` |
   | `/perfil` | `/users/me`, `/me/password`, `/me/subscription`, `/me/wallet` |
   | `/admin` | `/api/admin/users*`, metrics, insights, referrals |
   | Sino | `/api/users/me/notifications*` + Service Worker do push |
4. **Remover o toggle de papel (Admin/User)** de teste do header; papel vem do token.
5. **Validação final:** percorrer a matriz de cobertura do `ARQUITETURA.md` §5 tela a tela — nenhuma tela pode
   permanecer lendo mock.

## 14. Verificação por módulo (padrão)

1. Testes de service das regras de negócio (padrão Mockito dos testes de `CreditService`/`GenerationJobService`).
2. Smoke HTTP: login → token → happy path → ownership de outro usuário (espera 404) → sem role admin em
   `/api/admin/**` (espera 403).
3. Flyway limpo em banco novo (`docker compose down -v && up`) e em banco existente.
4. Critérios de aceite dos HANDOFFs por fase (ex.: Fase 4 — usuário percorre os 3 fluxos e recebe prompts + imagem
   com débito de crédito).
