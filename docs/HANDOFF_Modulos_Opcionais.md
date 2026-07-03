# HANDOFF — Módulos Opcionais

> **Complemento** do `HANDOFF_SaaS_TikTok_Shop.md`. Mesmas decisões travadas, mesmas convenções (Controller→Service→Repository, DTO `Create`/`Response`, Native Query preferida, `/api/admin/**` com `hasRole('ADMIN')`, JSONB para config volátil, pt-BR). Estes módulos ficam **fora do roadmap 0–5** e só entram quando o dono priorizar. São majoritariamente CRUD + conteúdo gerenciado pelo admin.

**Ordem sugerida de prioridade interna** (do mais simples/independente ao mais arriscado):
Galeria de Prompts → Modelos Virais → Creator Academy → Vendas ao Vivo → Indicação.

---

## OPC-1 — Galeria de Prompts (PDF §7)

**Objetivo:** biblioteca de instruções prontas que o usuário copia com 1 clique para colar nas ferramentas de IA externas.

**Tasks**
1. CRUD de prompts pelo admin.
2. Categorização: `VIDEOS`, `IMAGENS`, `CENARIOS`, `MOVIMENTOS`.
3. Listagem por categoria + busca textual.
4. Botão "copiar" (lógica é 100% frontend; backend só serve o texto).

**Entidades**
- `prompts` — `title`, `content` (texto), `category` (enum), `created_by_admin`, `created_at`.

**Endpoints**
- `GET /api/prompts?category=` (usuário) · `GET /api/prompts/search?q=`
- Admin: `POST/PUT/DELETE /api/admin/prompts`

**Regra de negócio**
- Conteúdo é só leitura para o usuário; só admin edita.

**Casos de borda**
- Categoria sem prompts → retornar lista vazia, não erro.
- Prompt muito longo → limite de tamanho (`@Size`) **decidido: 2.000 caracteres**.

**Complexidade:** Baixa. **Critério de aceite:** usuário lista por categoria, busca e copia; admin gerencia.

---

## OPC-2 — Modelos Virais "Turbine seu Engajamento" (PDF §8)

**Objetivo:** coleção de formatos de conteúdo validados que costumam viralizar, servindo de inspiração. É uma vitrine de referência, não gera nada.

**Tasks**
1. CRUD de modelos pelo admin (título, descrição, imagem/thumbnail por URL, exemplo/link).
2. Listagem para o usuário.
3. **Decidido**: clicar num modelo leva para o Estúdio com uma sessão pré-preenchida (`template_id` inicial), não é só inspiração visual.

**Entidades**
- `viral_templates` — `title`, `description`, `thumbnail_url`, `reference_url`, `tags` (JSONB ou texto), `created_by_admin`.

**Endpoints**
- `GET /api/viral-templates` (usuário) · Admin: `POST/PUT/DELETE /api/admin/viral-templates`

**Casos de borda**
- Thumbnail por URL quebrada (validar formato, não baixar).

**Complexidade:** Baixa (se for só vitrine) / Média (se integrar com o Estúdio).
**Critério de aceite:** usuário navega na coleção; admin gerencia.

---

## OPC-3 — Creator Academy (PDF §11)

**Objetivo:** área de treinamento interno com módulos em vídeo; admin adiciona aulas **sem programar**.

**Tasks**
1. CRUD de módulos e aulas pelo admin (estrutura módulo → aulas).
2. Player de vídeo no front.
3. **Decidido**: vídeos hospedados no **Panda Video**.
4. Opcional: progresso de conclusão por usuário.

**Entidades**
- `academy_modules` — `title`, `description`, `order`, `created_at`.
- `academy_lessons` — `module_id` FK, `title`, `video_url` (ou `video_ref`), `order`, `duration`.
- (opcional) `lesson_progress` — `user_id`, `lesson_id`, `completed_at`.

**Endpoints**
- `GET /api/academy/modules` · `GET /api/academy/lessons/{id}` (usuário)
- Admin: `POST/PUT/DELETE /api/admin/academy/modules` e `.../lessons`

**Regra de negócio**
- Só usuário com acesso ativo (Fase 1) vê as aulas.

**Casos de borda**
- Vídeo removido na origem (URL morta).
- Reordenação de aulas/módulos (campo `order`).

**Complexidade:** Baixa–Média (depende da hospedagem de vídeo).
**Critério de aceite:** admin cria módulo/aula sem mexer em código; usuário assiste.

---

## OPC-4 — Notificações de Vendas ao Vivo (PDF §9) — RESTRITO A ADMIN

> **ATENÇÃO — não confundir com a Fase 5.** A Fase 5 é **web push real** (aba fechada). Este módulo é **pop-up de prova social DENTRO do site** enquanto o usuário navega, com produtos em **rotação configurada pelo admin**. É conteúdo **manual/fake de prova social**, não venda real (mesma filosofia das métricas manuais do dashboard).

**Objetivo:** exibir pop-ups "fulano comprou X" em rotação, para criar sensação de movimento na plataforma.

**Tasks**
1. Configuração de **ativação global** (liga/desliga os pop-ups para todos).
2. CRUD dos produtos em rotação, cada um com **comissão definida** pelo admin.
3. Ajuste do **intervalo de tempo** entre avisos.
4. Front consome a config e renderiza os pop-ups em loop (lógica de exibição é frontend).

**Entidades**
- `live_sales_config` — `enabled` (bool), `interval_seconds`, `updated_by_admin`.
- `live_sales_items` — `product_name`, `image_url`, `commission`, `active`, `order`.

**Endpoints**
- `GET /api/public/live-sales` (config + itens ativos, consumido pelo front)
- Admin: `PUT /api/admin/live-sales/config` · `POST/PUT/DELETE /api/admin/live-sales/items`

**Regra de negócio**
- Se `enabled = false`, o endpoint retorna lista vazia / flag desligada.
- Só admin configura.

**Casos de borda**
- Nenhum item ativo com `enabled = true` → front não mostra nada.
- Intervalo muito baixo (validar mínimo, ex.: ≥ 5s).

**Complexidade:** Baixa.
**Critério de aceite:** admin liga/desliga, cadastra itens e intervalo; pop-ups aparecem em rotação no front.

---

## OPC-5 — Programa de Indicação "Indique e Ganhe" (PDF §10) — MAIS ARRISCADO

> **Cuidado:** este é o único opcional com **lógica financeira real** (divisão de comissão + pagamento). Não tratar como CRUD simples. Erros aqui = problema de dinheiro.

**Objetivo:** usuários/afiliados revendem o acesso e ganham comissão.

**Tasks**
1. Geração de **código/link de indicação** por usuário.
2. Rastreamento: quando alguém se cadastra/paga via um link, vincular ao indicador.
3. **Divisão automática de comissão** (ex.: 50/50) ao confirmar pagamento.
4. Painel administrativo de afiliados (visão de quem indicou quem, valores).
5. `[A DEFINIR]` — **fluxo de pagamento/saque** da comissão (como o afiliado recebe? manual? gateway?). **Módulo inteiro adiado**: dono quer revisar a lógica de negócio da Indicação antes de destravar qualquer parte dela.
6. `[A DEFINIR]` — páginas de divulgação personalizadas (escopo do front). Também adiado junto com o módulo; recomendação: excluir do MVP mesmo quando o módulo for retomado, é o item de menor prioridade dentro dele.

**Entidades**
- `referral_codes` — `user_id`, `code` (único), `created_at`.
- `referrals` — `referrer_id`, `referred_user_id`, `status`, `created_at`.
- `referral_commissions` — `referral_id`, `amount`, `split_pct`, `status` (`PENDING`/`PAID`), `paid_at`.

**Endpoints**
- `GET /api/referral/my-code` · `GET /api/referral/my-earnings` (usuário)
- Admin: `GET /api/admin/referrals` · `PATCH /api/admin/referrals/commissions/{id}/pay`

**Regra de negócio**
- Comissão só é gerada quando o pagamento do indicado é **confirmado** (depende da Fase 1 — planos/assinatura).
- Auto-indicação proibida (não pode usar o próprio código).

**Casos de borda**
- Indicado cancela/estorna após comissão gerada → reverter comissão.
- Mesmo usuário indicado por dois códigos → definir regra (primeiro vence?) `[A DEFINIR]` — adiado junto com o resto do módulo (item 4 das decisões do dono).
- Concorrência no cálculo de comissão (idempotência por `referral_id`).

**Complexidade:** Média–Alta (lógica financeira + pagamento).
**Risco:** alto se o fluxo de saque não for definido antes. **Mitigação:** módulo inteiro adiado — dono vai revisar a lógica de negócio antes; não codar nenhuma parte financeira até lá.
**Critério de aceite:** usuário pega código, indicações são rastreadas, comissão é dividida ao confirmar pagamento, admin vê e marca como paga.

---

## Lista consolidada de decisões (atualizado 2026-07-03)

### Decididas ✅
1. Limite de tamanho de prompt (OPC-1) = **2.000 caracteres**.
2. Modelo Viral **integra com o Estúdio** (pré-preenche a sessão) (OPC-2).
3. **Hospedagem dos vídeos da Academy** (OPC-3) = **Panda Video** — entidade desbloqueada.

### Ainda pendentes ⛔
4. Intervalo mínimo dos pop-ups de Vendas ao Vivo (OPC-4) — ainda não perguntado ao dono.
5. **Fluxo de pagamento/saque da comissão de indicação** (OPC-5) — **módulo de Indicação inteiro adiado**, dono quer revisar a lógica de negócio antes de destravar.
6. Regra de conflito de indicação (dois códigos para o mesmo indicado) (OPC-5) — adiado junto com o item 5.

---

## Resumo de complexidade/risco

- **Baixo:** Galeria de Prompts, Vendas ao Vivo, Modelos Virais (decidido: integra com o Estúdio).
- **Médio:** Creator Academy (hospedagem decidida: Panda Video).
- **Alto:** Programa de Indicação (dinheiro — módulo inteiro adiado a pedido do dono, que quer revisar a lógica de negócio antes).
