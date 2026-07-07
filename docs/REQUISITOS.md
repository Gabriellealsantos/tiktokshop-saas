# REQUISITOS — Plataforma SaaS TikTok Shop (Venyx)

> **Propósito deste documento:** lista única de tudo que o sistema deve fazer e **por que** cada requisito existe,
> para validação com o dono. Fontes: Proposta Comercial, `docs/ARQUITETURA.md`, `docs/PLANO_EXECUCAO.md`,
> `docs/TELAS_PENDENTES.md` e o frontend implementado (22 rotas). Os módulos antes chamados "opcionais" são **obrigatórios**.
>
> **Status:** ✅ pronto na base · 🔨 a implementar · ⛔ bloqueado por decisão do dono (`[A DEFINIR]`)

---

## 1. Papéis do sistema

| Papel | Descrição |
|---|---|
| **SUPER_ADMIN** | Controle total; único que concede privilégios de admin. |
| **ADMIN** (dono/operação) | Gerencia usuários, conteúdo (produtos, prompts, academy, insights), métricas, notificações e financeiro. |
| **CLIENT** (usuário/creator) | Consome a plataforma: minera produtos, cria conteúdo com IA, estuda, indica. |

**Porquê:** o modelo de negócio é conteúdo/curadoria manual do dono + consumo pelos assinantes; quase todo módulo tem o par "admin gerencia / usuário consome".

---

## 2. RF-AUT — Autenticação & Acesso

| ID | Requisito | Porquê | Status |
|---|---|---|---|
| RF-AUT-01 | Autocadastro com nome, e-mail e senha; conta nasce **PENDENTE** | O acesso é vendido; ninguém entra sem aprovação/pagamento. Front `/cadastro` já mostra a tela "aguardando aprovação" | ✅ |
| RF-AUT-02 | Confirmação de e-mail por token | Garantir e-mail válido antes de aprovar (canal de contato e de push) | ✅ |
| RF-AUT-03 | Login OAuth2 + JWT com refresh token (PKCE) | Segurança padrão de mercado; front SPA precisa de sessão stateless renovável | ✅ |
| RF-AUT-04 | Recuperação de senha por e-mail + troca de senha autenticado | Autosserviço básico; tela de senha existe em `/perfil` | ✅ / 🔨 (trocar senha logado) |
| RF-AUT-05 | MFA (TOTP) opcional com códigos de recuperação | Proteção extra para contas admin (acesso financeiro e de disparo em massa) | ✅ |
| RF-AUT-06 | Bloqueio por tentativas de login falhas | Mitigar força bruta | ✅ |

## 3. RF-ADM — Administração de Usuários (Fase 1)

| ID | Requisito | Porquê | Status |
|---|---|---|---|
| RF-ADM-01 | Listar usuários com filtros (status, papel, plano, busca) e paginação | O dono aprova gente todo dia; a tela `/admin` já tem esses filtros | 🔨 |
| RF-ADM-02 | Aprovar / bloquear / desbloquear usuário | Monetização é liberação manual do acesso (PENDING → ACTIVE) | 🔨 |
| RF-ADM-03 | Alterar papel e plano de um usuário | Operação do dia a dia do dono (upgrade, cortesia, afiliado) | 🔨 |
| RF-ADM-04 | Proibições: não bloquear/excluir SUPER_ADMIN nem a si mesmo; só SUPER_ADMIN concede admin | Evitar lockout da própria operação e escalada de privilégio | ✅ (padrão existente) |
| RF-ADM-05 | Conceder créditos manualmente a um usuário | Cortesia/suporte/correção sem mexer no banco | 🔨 |

## 4. RF-PLA — Planos & Assinaturas

| ID | Requisito | Porquê | Status |
|---|---|---|---|
| RF-PLA-01 | Planos: mensal, trimestral, semestral, anual e vitalício, com preço e **link de pagamento** editáveis pelo admin | O front (`/perfil`, `/admin`) usa os 6 estados (incl. "sem plano"); o admin cadastra cada plano com preço + `paymentUrl` | ✅ (schema) / 🔨 (CRUD) |
| RF-PLA-02 | Uma assinatura ativa por usuário; nova assinatura encerra a anterior | Evitar cobrança/acesso duplicado e simplificar o gating | 🔨 |
| RF-PLA-03 | Expiração automática de assinatura vencida (exceto vitalício) | Sem isso o acesso "mensal" vira eterno | 🔨 |
| RF-PLA-04 | Gating: usuário sem assinatura ativa não usa as features (só telas de conta/compra) | É o produto: acesso pago. Front já tem `AccessGuard` | 🔨 |
| RF-PLA-05 | Compra de plano via **link externo de pagamento** (redirect) | **Decidido (2026-07-07):** não há gateway integrado nem webhook — o admin cola a `paymentUrl` (provedor externo com contrato) no cadastro do plano; o botão "Comprar/Mudar de plano" só **redireciona**. Confirmação do pagamento e liberação do plano são **manuais** pelo admin (RF-ADM-03) | 🔨 |

## 5. RF-CRE — Créditos (Fase 0 — transversal)

| ID | Requisito | Porquê | Status |
|---|---|---|---|
| RF-CRE-01 | Carteira por usuário com saldo inteiro e extrato completo | Toda função de IA custa crédito; usuário precisa ver o que consumiu (`/perfil`, `/configuracoes`) | ✅ |
| RF-CRE-02 | **Débito atômico e seguro contra concorrência** (`UPDATE ... WHERE balance >= ?`) | Duas gerações simultâneas não podem furar o saldo — é dinheiro | ✅ |
| RF-CRE-03 | Débito **antes** da geração; **estorno automático e idempotente** em falha | API de IA externa é instável e paga; usuário não pode pagar por falha, nem ser estornado 2× | ✅ |
| RF-CRE-04 | Saldo insuficiente responde **HTTP 402** com mensagem clara | Front converte em modal "comprar créditos" — fluxo de venda | ✅ |
| RF-CRE-05 | Pacotes de crédito (6 tiers com bônus % e badge) gerenciados pelo admin, cada um com **link de pagamento** | Tela `/creditos` já vende os 6 pacotes; o admin cadastra créditos/preço/bônus/badge + `paymentUrl`; preços mudam sem deploy | ✅ (schema+seed) / 🔨 (CRUD) |
| RF-CRE-06 | Bônus de cadastro (`SIGNUP_BONUS`) | Deixar o usuário experimentar a IA antes de comprar; **decidido: 60 créditos** (dá pra 2-3 gerações) | 🔨 |
| RF-CRE-07 | Teto mensal de tentativas de IA por plano | Proteger custo variável da API externa; **decidido: 400 gerações/mês por usuário**, teto flat de segurança técnica (não varia por plano), ajustável via config | 🔨 |
| RF-CRE-08 | Compra de pacote via **link externo de pagamento** (redirect) | **Decidido (2026-07-07):** sem gateway/webhook — o botão "Comprar" redireciona para a `paymentUrl` do pacote (valor já correspondido no provedor externo). Créditos entram na carteira via **crédito manual do admin** (RF-ADM-05) após o pagamento | 🔨 |

## 6. RF-DSH — Dashboard (Fase 2)

| ID | Requisito | Porquê | Status |
|---|---|---|---|
| RF-DSH-01 | Métricas **manuais** editadas pelo admin (faturamento, pedidos, comissão, ticket médio) por período | Decisão de produto: não há integração real com TikTok Shop; o dono controla a narrativa | 🔨 |
| RF-DSH-02 | Série diária para gráfico de 7 dias + filtros (hoje, semana, 7d, 15d, mês, 30d) | O gráfico e os filtros já existem no front | 🔨 |
| RF-DSH-03 | Visão por papel: admin vê Faturamento; usuário vê Tendências | O front renderiza dashboards diferentes por papel | 🔨 |
| RF-DSH-04 | "Tendências" (cards) e "Leitura do momento" (texto) editáveis pelo admin | Conteúdo editorial que muda toda semana, sem deploy | ✅ (schema) / 🔨 (CRUD) |

## 7. RF-PRO — Mineração de Produtos (Fase 3)

| ID | Requisito | Porquê | Status |
|---|---|---|---|
| RF-PRO-01 | Vitrine de produtos curada pelo admin, com categorias, busca e paginação | "Mineração" é curadoria manual do dono (mesma filosofia do dashboard); front `/produtos` tem 8 categorias + busca | 🔨 |
| RF-PRO-02 | Detalhe com KPIs: preço, vendas, receita est., views, conversão, comissão, vendas/dia, Δ7d, histórico 7d, janela, label, rank | O modal de detalhe do front exibe todos esses campos — schema V3 já os tem | ✅ (schema) / 🔨 (API) |
| RF-PRO-03 | Agregados da vitrine (novos produtos, receita detectada, próxima atualização) | Header de stats da tela `/produtos` | 🔨 |
| RF-PRO-04 | Favoritar/desfavoritar produto (idempotente) e listar favoritos | Fluxo do creator: separa produtos para criar conteúdo depois | 🔨 |
| RF-PRO-05 | "Meu produto": usuário cadastra produto próprio com imagem (≤5MB) | Nem todo produto vem da vitrine; modal já existe no front | 🔨 |
| RF-PRO-06 | URLs de imagem validadas por formato (nunca baixadas); produto removido do admin não quebra sessão de estúdio | Casos de borda de produto: link morto e curadoria dinâmica não podem quebrar o usuário | 🔨 |

## 8. RF-EST — Estúdio de Criação (Fase 4)

| ID | Requisito | Porquê | Status |
|---|---|---|---|
| RF-EST-01 | 3 fluxos guiados: **UGC** (4 passos), **POV** (4), **Cinematográfico** (5) | Núcleo do produto — o front tem os 3 wizards completos | 🔨 |
| RF-EST-02 | Config volátil da sessão em **JSONB** com autosave (status DRAFT retomável) | Os passos/opções mudam com frequência (regra de projeto: "cravar colunas = retrabalho garantido"); usuário que sai no meio não perde nada | ✅ (schema) / 🔨 (API) |
| RF-EST-03 | Geração produz **prompts + imagens de referência** para finalizar em Grok/VEO3 (não gera vídeo final) | Escopo da proposta §4.2: geração final de vídeo é externa; **provider decidido: Google Gemini (Nano Banana / Gemini 2.5 Flash Image)** — já era o nome usado no front | ✅ (job framework) / 🔨 (integração provider) |
| RF-EST-04 | Geração = job assíncrono com polling e débito de crédito | UX do front (loading + resultado) e proteção de custo (RF-CRE-03) | ✅ |
| RF-EST-05 | Custo em créditos por função/formato configurável | **Decidido: 15cr por geração/sessão do Estúdio** | 🔨 |

## 9. RF-AVA — Avatares IA

| ID | Requisito | Porquê | Status |
|---|---|---|---|
| RF-AVA-01 | Galeria pré-pronta (Mulheres/Homens/Modelos IA) gerenciada pelo admin | Usuário iniciante escolhe pronto em vez de criar do zero | ✅ (schema) / 🔨 (API) |
| RF-AVA-02 | Criador de avatar em 4 passos (básico → pele/cabelo → estilo/cenário → finalizar) gerando **2 variações** | Wizard completo já no front `/avatares`; **custo decidido: 20cr** | 🔨 (sobre o job framework ✅) |
| RF-AVA-03 | "Meus Avatares": salvar, favoritar, reutilizar no estúdio, histórico | Consistência de personagem entre vídeos é o valor do avatar | 🔨 |
| RF-AVA-04 | Geração de avatar consome crédito e respeita o teto mensal | Mesma proteção de custo de toda IA | ✅ (mecanismo) |

## 10. RF-TRB — Trend Boost (Modelos Virais)

| ID | Requisito | Porquê | Status |
|---|---|---|---|
| RF-TRB-01 | 3 templates guiados: Novelinha Viral (3 passos), Objetos Falantes (5), Polêmicas/Curiosidades (5) | Formatos validados que viralizam; wizards completos no front `/trend-boost` | 🔨 |
| RF-TRB-02 | Geração via job com crédito (idem estúdio) | Consistência de arquitetura e custo; **custo decidido: 15cr por geração** | ✅ (framework) / 🔨 |
| RF-TRB-03 | Vitrine de modelos virais gerenciada pelo admin (CRUD) | Conteúdo de inspiração atualizado sem deploy. ⚠️ **Escopo REABERTO (2026-07-07):** o dono voltou atrás — se "Modelos Virais" é só vitrine ou integra com o Estúdio **não está mais decidido**. Além disso, os templates "Novela Viral"/"Objeto Falante"/3º + estilos POV/Imersivo/Cinematográfico estão **congelados** pelos donos. **Não codar o backend de Modelos Virais até o dono fechar o escopo.** No front já existem telas novas (`modelos-screen`, `model-assembly-screen`, `product-models-picker`) separadas do Trend Boost | ⛔ |

## 11. RF-FER — Ferramentas IA

| ID | Requisito | Porquê | Status |
|---|---|---|---|
| RF-FER-01 | Editar Imagem (10cr), Nano Banana Pro/text-to-image (20cr), Influencer Studio (30cr) — todos via job | Cards e preços já exibidos em `/ferramentas`; **provider decidido: Google Gemini** (mesmo de RF-EST-03) | 🔨 (sobre framework ✅) |
| RF-FER-02 | "Store" de recursos | **`[A DEFINIR]` o que é a Store** — dono vai revisar depois; **fora do MVP por ora, não codar** | ⛔ (adiado) |

## 12. RF-TOK — TokEditor

| ID | Requisito | Porquê | Status |
|---|---|---|---|
| RF-TOK-01 | Upload de mp4 (≤24s), enquadramento (9:16, 1:1, 4:5), texto sobreposto, exportação | Fluxo de 5 passos já no front `/editor`; deixa o vídeo pronto pro TikTok. **Decidido: client-side (ffmpeg.wasm no browser)** — vídeo curto (≤24s), zero custo de infra/fila de job. **⚠️ Aviso:** client-side depende de performance do browser/dispositivo do usuário — pode degradar em mobile mais fraco ou Safari; se isso virar problema real de qualidade/estabilidade, migrar para processamento server-side (ffmpeg no backend, com custo de compute e fila) é o plano B, não uma reescrita do zero (isolar bem a lógica de export) | 🔨 |

## 13. RF-PRM — Galeria de Prompts

| ID | Requisito | Porquê | Status |
|---|---|---|---|
| RF-PRM-01 | Biblioteca de prompts por categoria (Vídeos, Imagens, Cenários) com busca e cópia em 1 clique | Acelera o uso das IAs externas; tela `/prompts` pronta | 🔨 |
| RF-PRM-02 | Somente admin cria/edita; usuário só lê | Curadoria de qualidade é do dono | 🔨 |
| RF-PRM-03 | Categoria vazia → lista vazia (não erro); limite de tamanho de prompt | Bordas de produto; **decidido: limite de 2.000 caracteres** | 🔨 |

## 14. RF-ACA — Creator Academy

| ID | Requisito | Porquê | Status |
|---|---|---|---|
| RF-ACA-01 | Módulos → aulas em vídeo, ordenáveis, criados pelo admin **sem programar** | Treinamento é parte da oferta; front tem 6 módulos × 3 aulas com player | 🔨 |
| RF-ACA-02 | Progresso por usuário (aula concluída, aula atual) | O front marca aulas concluídas; retenção do assinante | 🔨 |
| RF-ACA-03 | Só usuário com acesso ativo assiste | Conteúdo premium é motivo de assinatura | 🔨 |
| RF-ACA-04 | Hospedagem dos vídeos | **Decidido: Panda Video** (feito pro mercado BR de cursos, protege contra download/compartilhamento fácil, mais barato que Vimeo; evita YouTube não listado por não ser realmente privado) | 🔨 |

## 15. RF-NOT — Notificações

| ID | Requisito | Porquê | Status |
|---|---|---|---|
| RF-NOT-01 | Feed in-app (sino): tipos venda/sistema/indicação/info, marcar lida, ler todas, dispensar | Painel do sino completo no front | 🔨 |
| RF-NOT-02 | **Web Push real** (aba fechada): admin dispara aviso de "produto em alta" com **imagem + som do sistema** | **Foco declarado do dono** (Fase 5); é o gatilho que traz o usuário de volta | 🔨 |
| RF-NOT-03 | Audiência ALL ou SELECTED + histórico de entregas com status/erro | O dono precisa saber quem recebeu; reenvio informado | 🔨 |
| RF-NOT-06 | **Agendamento de notificações** (timer): admin programa certas notificações para disparar em horário futuro | **Decidido (2026-07-07):** além do disparo imediato, o SuperAdmin agenda notificações para horário marcado (scheduler `@Scheduled`/fila). Aplica-se ao feed in-app e ao Web Push | 🔨 |
| RF-NOT-04 | Payload ≤ 4KB → imagem vai por **URL**; envio assíncrono em lote; 410 Gone remove subscription; sem permissão → ignora | Limites técnicos do Web Push; broadcast síncrono estoura a request em volume | 🔨 |
| RF-NOT-05 | Chaves VAPID e URL de imagem (HTTPS + CORS) | **Decidido:** lib `nl.martijndwars:web-push`; chaves VAPID geradas uma vez e guardadas em env var (nunca no repo, RNF-14); imagem reaproveita a `image_url` já existente do produto/avatar — sem campo novo | 🔨 |

## 16. RF-LIV — Vendas ao Vivo (prova social)

| ID | Requisito | Porquê | Status |
|---|---|---|---|
| RF-LIV-01 | Pop-ups "fulano comprou X" em rotação **dentro do site**, com produtos e comissões cadastrados pelo admin | Sensação de movimento na plataforma (prova social manual — mesma filosofia das métricas). **Não confundir com Web Push** | 🔨 |
| RF-LIV-02 | Liga/desliga global + intervalo configurável (mínimo ≥ 5s) | Controle do dono; intervalo baixo degrada UX | 🔨 |
| RF-LIV-03 | Desligado ou sem itens ativos → front não mostra nada (sem erro) | Borda de produto | 🔨 |

## 17. RF-IND — Programa de Indicação ("Indique e Ganhe")

| ID | Requisito | Porquê | Status |
|---|---|---|---|
| RF-IND-01 | Código/link único por usuário + página de divulgação personalizada (título/mensagem) | Tela `/indicacao` completa no front; canal de aquisição barato | ✅ (schema) / 🔨 (API) |
| RF-IND-02 | Rastrear cadastro/pagamento via link e vincular ao indicador | Sem rastreio não há comissão | 🔨 |
| RF-IND-03 | Comissão **50/50** gerada só quando o pagamento do indicado é **confirmado**; idempotente por indicação | É dinheiro real — o módulo mais arriscado; comissão dupla ou sem pagamento é prejuízo | 🔨 |
| RF-IND-04 | Auto-indicação proibida; estorno do indicado reverte a comissão | Antifraude básico | 🔨 |
| RF-IND-05 | Painel admin (quem indicou quem, valores) + marcar comissão como paga | O dono paga manualmente até existir fluxo de saque | 🔨 |
| RF-IND-06 | Fluxo de saque do afiliado; conflito de dois códigos | **`[A DEFINIR]` — adiado a pedido do dono, que quer revisar a lógica de negócio do módulo inteiro antes de destravar.** Bloqueia só o pagamento automático, não o rastreamento (RF-IND-01/02/03 seguem normalmente) | ⛔ (adiado) |

## 18. RF-PER — Perfil & Configurações

| ID | Requisito | Porquê | Status |
|---|---|---|---|
| RF-PER-01 | Ver/editar nome; e-mail somente leitura; badges de status/papel/plano | Tela `/perfil` pronta | 🔨 |
| RF-PER-02 | Ver plano, renovação, saldo de créditos e atalhos de compra | Autosserviço reduz suporte | 🔨 |
| RF-PER-03 | Preferências (tema escuro, notificações) persistidas | Toggle existe no front, hoje não persiste | 🔨 |
| RF-PER-04 | Logout e troca de senha | Básico de conta | ✅ / 🔨 |

---

## 19. RNF — Requisitos Não Funcionais

| ID | Requisito | Porquê | Status |
|---|---|---|---|
| RNF-01 | Stack: Java 21 + Spring Boot 4.x + PostgreSQL 18 + Flyway; React 19 + TS; monolito modular em monorepo | Decisão de arquitetura travada; time de 1 dev — monolito reduz custo operacional | ✅ |
| RNF-02 | JWT RS256 + refresh; CORS restrito; headers de segurança (HSTS, CSP, X-Frame-Options) | Hardening já implementado — não regredir | ✅ |
| RNF-03 | `@PreAuthorize` em tudo; **ownership em todo GET/PUT/DELETE por id (anti-IDOR, responde 404)** | Multi-tenant por usuário: um cliente jamais vê recurso de outro | ✅ (padrão) |
| RNF-04 | Erros padronizados via handler global (`StandardError`): 402 créditos, 404, 403, 409, 422 validação | Front trata erro de um jeito só; 402 vira funil de venda de créditos | ✅ |
| RNF-05 | Bean Validation em todos os DTOs de entrada | Nunca confiar no front | ✅ (padrão) / 🔨 (novos DTOs) |
| RNF-06 | Native Query preferida; JPQL só em queries triviais | Decisão de projeto: previsibilidade de SQL e performance | ✅ |
| RNF-07 | Config volátil (estúdio, avatar, jobs) em **JSONB** | Fase 4 muda toda semana; schema rígido = retrabalho garantido | ✅ |
| RNF-08 | Operações financeiras (créditos, comissões) atômicas e **idempotentes** | Concorrência não pode criar/queimar dinheiro | ✅ (créditos) / 🔨 (comissões) |
| RNF-09 | Broadcast de push assíncrono/em lote | Milhares de usuários numa request síncrona = timeout | 🔨 |
| RNF-10 | Rate limit nas funções de IA (teto mensal por plano) | Custo variável da API externa é o maior risco financeiro; **valor decidido: 400/mês** (RF-CRE-07) | ✅ (medição) / 🔨 (aplicar valor) |
| RNF-11 | Soft delete de usuários com anonimização de e-mail/CPF/telefone | Histórico preservado + LGPD | ✅ |
| RNF-12 | Migrations Flyway versionadas; app valida schema no boot | Banco reproduzível em qualquer ambiente | ✅ (V1–V3) |
| RNF-13 | Código, comentários e commits em **pt-BR** | Decisão de projeto (time e dono brasileiros) | ✅ |
| RNF-14 | Segredos via env vars (JWT keys, client secret, MFA salt, VAPID) — nunca no repo | Validador de segurança já alerta no boot | ✅ |
| RNF-15 | Integrações externas atrás de interfaces (`GenerationProvider`) | Provider de IA **decidido (Google Gemini)**. Pagamento **não é integração** — é só um `paymentUrl` de redirect por plano/pacote (decisão 2026-07-07), então não precisa de gateway/SDK; o stub `PaymentGateway` pode ser removido | ✅ |

---

## 20. Fora de escopo (Proposta §4.2 — não é requisito)

- Geração **final** de vídeo (feita em Grok/VEO3 pelo usuário).
- Integração automática com a API do TikTok Shop (métricas e "mineração" são manuais/curadas).
- Infraestrutura/domínio recorrentes.
- Qualquer recurso fora do Documento de Funcionalidades v2.1.

## 21. Pendências — status atualizado (dono decidiu em 2026-07-03)

### Decididas ✅

| # | Pendência | Decisão | Destrava |
|---|---|---|---|
| 1 | Provider de IA + custo em créditos por função/formato | **Google Gemini (Nano Banana / Gemini 2.5 Flash Image)**. Custos: Editar Imagem 10cr, Nano Banana Pro (text-to-image) 20cr, Influencer Studio 30cr, Avatar 20cr, Estúdio 15cr, Trend Boost 15cr | RF-EST-03/05, RF-AVA, RF-FER-01 |
| 3 | TokEditor: processamento server-side ou client-side | **Client-side (ffmpeg.wasm)**. ⚠️ Aviso: reavaliar para server-side se performance mobile/Safari for insuficiente | RF-TOK-01 |
| 4 | Hospedagem dos vídeos da Academy | **Panda Video** | RF-ACA-04 |
| 5 | Chaves VAPID + URL de imagem do push (HTTPS/CORS) | Lib `nl.martijndwars:web-push`; chaves em env var; imagem reaproveita `image_url` do produto/avatar | RF-NOT-05 |
| 6 | Valores: `SIGNUP_BONUS`, teto mensal, limite de prompt | `SIGNUP_BONUS` = 60 créditos; teto mensal = 400 gerações/mês (flat); limite de prompt = 2.000 caracteres | RF-CRE-06/07, RF-PRM-03 |
| 2 | Gateway de pagamento + preços | **Decidido (2026-07-07):** **não há gateway integrado** — é só um **link externo de pagamento** (`paymentUrl`) por plano/pacote, cadastrado pelo admin, com o valor já correspondido no provedor. Botão só redireciona; liberação de crédito/plano é **manual** pelo admin | RF-PLA-05, RF-CRE-08, RF-PLA-01 |
| 10 | Agendamento de notificações | **Decidido (2026-07-07):** notificações podem ser **agendadas por timer** (horário futuro), além do disparo imediato | RF-NOT-06 |

### Ainda pendentes ⛔ (adiadas pelo dono)

| # | Pendência | Nota |
|---|---|---|
| 9 | Modelos Virais: só vitrine ou integra com o Estúdio | **REABERTO (2026-07-07)** — o dono voltou atrás na decisão anterior; escopo indefinido + templates congelados. Não codar o backend até fechar (RF-TRB-03) |
| 7 | Fluxo de saque da comissão + regra de conflito de indicação | **Adiado** — dono quer revisar a lógica de negócio do módulo de Indicação inteiro antes de destravar (RF-IND-06) |
| 8 | O que é a "Store" das Ferramentas | **Adiado** — fora do MVP por ora, revisar depois (RF-FER-02) |
