# O QUE FALTA — mapa de telas (pendências, CRUDs e decisões)

> Doc **vivo**, construído tela a tela junto com o dono. Complementa `PLANO_EXECUCAO.md` (ordem de execução)
> e `ARQUITETURA.md` (mapa de endpoints).
>
> **Estado do backend:** todas as **entidades + repositories** já existem para todos os módulos.
> O que falta na maioria dos casos é a camada **Controller → Service** (o CRUD em si) e depois a **integração do front**
> (hoje 100% mock).
>
> **Legenda de status:**
> ✅ pronto · 🟡 parcial (falta CRUD/endpoint) · 🔴 não iniciado · ⛔ bloqueado por decisão do dono

---

## 🔑 Reframe do dono (2026-07-07) — pagamento é só um LINK

O "gateway de pagamento" **não é uma integração real**. O provedor externo tem os checkouts prontos; o dono só cola
**a URL de pagamento** no cadastro de cada plano/pacote (a URL já corresponde ao valor certo). O botão "Comprar" apenas
**redireciona** para essa URL. Consequência:

- **Planos** e **Pacotes de crédito** deixam de estar bloqueados — precisam de um campo `paymentUrl` no CRUD.
- Não há webhook nem confirmação automática de pagamento → **liberação de crédito/plano continua manual** (admin credita).
- Mesma lógica no botão **"Afiliar"** dos produtos: é um `affiliateUrl` cadastrado que redireciona pro TikTok.

---

## Telas revisadas com o dono

### 1. `/dashboard` — Painel Principal 🟡

**Como funciona:** as métricas (faturamento, pedidos, comissão, ticket, gráfico de evolução) **viriam da API do TikTok**,
mas **não temos acesso** a ela. Então o **SuperAdmin cadastra tudo manualmente** e vai atualizando os números à mão
(ex.: entra no TikTok, vê os valores reais e vai aumentando). É intencionalmente manual.

**Falta fazer:**
- [ ] **CRUD de Métricas do Dashboard** (SuperAdmin) — popular faturamento, pedidos, comissão, ticket médio e a série do
      gráfico "Evolução de Vendas". Entidade `DashboardMetric` (+ enum `DashboardPeriodType`) já existe; falta Controller/Service.
- [ ] **Filtros de período** funcionando: Hoje / Esta semana / 7 dias / 15 dias / Este mês / 30 dias / Personalizado.
- [ ] **Endpoint público/agregado** `GET /api/dashboard?period=` que devolve os cards + série do gráfico já filtrados.
- [ ] Cards de "insights" já têm CRUD (`DashboardInsightController`) — só ligar no front.
- [ ] Painel "Vendas ao Vivo" (lateral) — CRUD de `LiveSalesConfig`/`LiveSalesItem` (hoje simulado no front).

**Notificações (sino) — CRUD ainda não existe:**
- [ ] CRUD de **Notificações** para o SuperAdmin **disparar para todos** ou **selecionar audiência/tipo**
      (venda / sistema / indicação / info).
- [ ] **Agendamento por timer**: certas notificações devem disparar em horário programado (scheduler), não só na hora.
- [ ] Feed in-app por usuário (ler / marcar como lida / apagar). Entidades `Notification`, `NotificationTarget`,
      `NotificationDelivery` já existem; falta Controller/Service + o disparo agendado.

**Quem cadastra:** SuperAdmin.

---

### 2. `/admin` — Painel Admin 🟡

Já tem a lista de usuários (aprovar/liberar/bloquear, filtros por role/plano, busca) desenhada no front. No backend
falta expor os fluxos (hoje o `UserController` só tem CRUD genérico).

**Falta fazer:**
- [ ] **Aprovação/bloqueio de usuários**: `approve`, `block`, `unblock`, trocar role, trocar plano + filtros
      (`status`, `role`, `plan`, `search`, paginação).
- [ ] **CRUD de Planos** (aba de planos) com **link de pagamento** (`paymentUrl`) — o admin cadastra o plano e cola a URL.
- [ ] **Conceder créditos ao usuário** direto pelo painel (o admin define a quantidade de créditos a creditar).
- [ ] Aba "Métricas" (liga no CRUD do dashboard acima) e "Cupom Indicação" (módulo de indicação).

**Quem cadastra:** SuperAdmin.

---

### 3. `/creditos` — Recarregue seus créditos 🟡

Grade de pacotes (Starter/Essencial/Pro/Premium/Business/Enterprise) com créditos, preço e bônus.

**Falta fazer:**
- [ ] **CRUD de Pacotes de Crédito** (SuperAdmin): quantidade de créditos, preço, % de bônus, badge
      ("Mais popular", "Melhor custo-benefício"), ordenação e **link de pagamento** (`paymentUrl`).
- [ ] Botão "Comprar" apenas **redireciona** para a `paymentUrl` cadastrada (sem gateway real).
- [ ] Listagem pública dos pacotes ativos já tem `GET /api/credit-packages`; falta o campo `paymentUrl` no fluxo.

**Reframe:** o link de pagamento já vem pré-configurado com o valor correto — só cadastrar e redirecionar.

---

### 4. `/prompts` — Galeria de Prompts 🟡

Cards de prompts por categoria (Todos / Vídeos / Imagens / Cenários) com botão "Copiar Prompt".

**Falta fazer:**
- [ ] **CRUD de Prompts** (SuperAdmin): título, categoria, conteúdo (limite **2.000 caracteres**), thumbnail.
- [ ] Listagem pública `GET /api/prompts?category=&search=`. Entidade `Prompt` (+ enum `PromptCategory`) já existe;
      falta Controller/Service.

**Quem cadastra:** SuperAdmin.

---

### 5. TokEditor — editor de vídeo vertical 🔴

Wizard de 5 passos (Upload → Enquadramento → Texto → Processar → Download), máx. 24s no total, .mp4.

**Falta fazer:**
- [ ] Implementação **simples, não complexa** (decisão do dono). Processamento **client-side (ffmpeg.wasm)** conforme
      `PLANO_EXECUCAO.md §12`. Escopo enxuto — cortar/enquadrar/adicionar texto e exportar.

**Obs.:** definir com o dono o corte exato de features "simples" antes de codar (evitar virar projeto grande).

---

### 6. `/produtos` — Vitrine de produtos 🟡

Grade de produtos com categoria, vendas, preço, favoritar (coração). Filtros por categoria + Favoritos + Top Produtos.

**Falta fazer:**
- [ ] **Favoritar/desfavoritar** + "meus favoritos". Entidade `Favorite` já existe (constraint de idempotência);
      falta o endpoint.
- [ ] Botão **"Afiliar"**: campo `affiliateUrl` no CRUD do produto → **redireciona pro TikTok** (o usuário se afilia
      com a própria conta lá). *(confirmar em qual ponto da tela esse botão aparece.)*
- [ ] Confirmar se todos os campos/KPIs necessários já estão no cadastro do produto (o dono achou que **está quase pronta**).

**A confirmar com o dono:** falta algum dado no card/detalhe do produto? (dono acha que já tem tudo).

---

### 7. `/academy` — Creator Academy ✅ (quase)

Player + módulos/aulas com marcação de concluída. Front parece pronto.

**Falta fazer (backend):**
- [ ] **Progresso do aluno**: marcar aula como concluída + buscar progresso do usuário. Entidade `LessonProgress` já existe;
      falta o endpoint (`POST /api/academy/lessons/{id}/complete`, `GET /api/users/me/academy/progress`).
- [ ] CRUD de módulos/aulas já parcialmente pronto (`AcademyLessonController`); vídeos hospedados no **Panda Video**.

**Status do dono:** considera a tela **pronta** — só falta a parte de progresso no backend.

---

### 8. Modelos Virais — ⛔ não decidido

Tela "Modelos" (Novelinha Viral / UGC Natural / Review Dinâmico / Estilo Vlog) + telas novas de montagem
(`model-assembly-screen`, `modelos-screen`, `product-models-picker`) que chegaram no último commit do front.

**Status:** **decisão do dono ainda pendente** — não codar o backend antes de fechar o escopo.
> ⚠️ Lembrete: os templates "Novela Viral", "Objeto Falante" (+ 3º) e os estilos POV/Imersivo/Cinematográfico
> foram **congelados** pelos donos — não construir ainda.

---

## Ainda não revisado nesta rodada (a mandar print)

- `/estudio/*` — Estúdio de criação (núcleo do produto, job de geração)
- `/avatares` + `/criar-avatar` — galeria e geração de avatares
- `/trend-boost/*` — Trend Boost
- `/ferramentas` — Editar Imagem / Text-to-Image / Influencer Studio
- `/indicacao` — programa de indicação (parte do pagamento adiada pelo dono)
- `/perfil` + `/configuracoes` — perfil e preferências
- `/creditos` (fluxo de wallet/extrato do usuário)

---

## Resumo executivo do que falta (visão macro)

| Tela | Status | O que falta |
|---|---|---|
| Dashboard | 🟡 | CRUD de métricas (manual) + filtros + endpoint agregado + **Notificações (CRUD + agendamento)** |
| Admin | 🟡 | Aprovar/bloquear/roles/plano + CRUD de Planos (com link) + conceder créditos |
| Créditos | 🟡 | CRUD de Pacotes (com link de pagamento) + redirect no "Comprar" |
| Prompts | 🟡 | CRUD de Prompts (SuperAdmin) + listagem pública |
| TokEditor | 🔴 | Editor simples client-side (ffmpeg.wasm) |
| Produtos | 🟡 | Favoritos + link de afiliação + confirmar campos |
| Academy | ✅🟡 | Só falta progresso do aluno no backend |
| Modelos Virais | ⛔ | Escopo não decidido — não codar |

_Última atualização: 2026-07-07 — primeira rodada de prints (8 telas)._
