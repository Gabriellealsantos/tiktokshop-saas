# Conceitos & Decisões (docs)

> 36 nodes · cohesion 0.06

## Key Concepts

- **GenerationJob / GenerationJobService** (6 connections) — `docs/ARQUITETURA.md`
- **Pagamento por link externo (paymentUrl, redirect)** (6 connections) — `docs/REQUISITOS.md`
- **Auth OAuth2 + JWT + MFA (Authorization Server)** (4 connections) — `docs/ARQUITETURA.md`
- **Módulo Créditos & Pacotes** (3 connections) — `docs/ARQUITETURA.md`
- **Módulo Estúdio de Criação (UGC/POV/Cinematográfico)** (3 connections) — `docs/ARQUITETURA.md`
- **GenerationProvider (interface de IA)** (3 connections) — `docs/PLANO_EXECUCAO.md`
- **Módulo Planos & Assinaturas** (3 connections) — `docs/ARQUITETURA.md`
- **Módulo Produtos / Mineração** (3 connections) — `docs/ARQUITETURA.md`
- **RNF — Requisitos Não Funcionais** (3 connections) — `docs/REQUISITOS.md`
- **Modelo de acesso (papéis SUPER_ADMIN/ADMIN/CLIENT/AFFILIATE + UserStatus)** (2 connections) — `docs/ARQUITETURA.md`
- **AccessGuard (Gating de acesso pago)** (2 connections) — `docs/ARQUITETURA.md`
- **Módulo Admin de Usuários** (2 connections) — `docs/ARQUITETURA.md`
- **Módulo Avatares IA** (2 connections) — `docs/ARQUITETURA.md`
- **CreditService (débito atômico + estorno idempotente)** (2 connections) — `docs/ARQUITETURA.md`
- **Módulo Dashboard (métricas manuais)** (2 connections) — `docs/ARQUITETURA.md`
- **Módulo Ferramentas IA (Editar Imagem / Text-to-Image / Influencer Studio)** (2 connections) — `docs/REQUISITOS.md`
- **Módulo Trend Boost / Modelos Virais (escopo bloqueado)** (2 connections) — `docs/REQUISITOS.md`
- **Proposta Comercial Venyx (Documento de Funcionalidades v2.1)** (2 connections) — `docs/Proposta_Comercial_Venyx_-_Plataforma_SaaS_TikTok_Shop.pdf`
- **RF-IND — Programa de Indicação** (2 connections) — `docs/REQUISITOS.md`
- **Front-end 100% mock (MockSessionProvider / mock/data.ts)** (2 connections) — `frontend/.lovable/plan.md`
- **PostgreSQL 18 + pgAdmin (docker-compose)** (1 connections) — `backend/docker-compose.postgres.yml`
- **Login page (Thymeleaf / OAuth2 AS)** (1 connections) — `backend/src/main/resources/templates/login.html`
- **Módulo Programa de Indicação (parcialmente adiado)** (1 connections) — `docs/REQUISITOS.md`
- **PaymentGateway (stub — a remover)** (1 connections) — `docs/PLANO_EXECUCAO.md`
- **Google Gemini (Nano Banana / Gemini 2.5 Flash Image)** (1 connections) — `docs/REQUISITOS.md`
- *... and 11 more nodes in this community*

## Relationships

- No strong cross-community connections detected

## Source Files

- `backend/docker-compose.postgres.yml`
- `backend/src/main/resources/templates/login.html`
- `docs/ARQUITETURA.md`
- `docs/PLANO_EXECUCAO.md`
- `docs/Proposta_Comercial_Venyx_-_Plataforma_SaaS_TikTok_Shop.pdf`
- `docs/REQUISITOS.md`
- `frontend/.lovable/plan.md`
- `frontend/src/routes/README.md`

## Audit Trail

- EXTRACTED: 54 (75%)
- INFERRED: 18 (25%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*