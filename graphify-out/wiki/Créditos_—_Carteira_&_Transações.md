# Créditos — Carteira & Transações

> 48 nodes · cohesion 0.08

## Key Concepts

- **CreditTransaction** (34 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/CreditTransaction.java`
- **BusinessException** (29 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/exceptions/BusinessException.java`
- **CreditService** (17 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/CreditService.java`
- **CreditTransactionReason** (13 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/enums/CreditTransactionReason.java`
- **CreditService.java** (13 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/CreditService.java`
- **.debit()** (10 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/CreditService.java`
- **CreditTransactionRepository** (9 connections) — `backend/src/main/java/com/venyx/tiktokshop/repositories/CreditTransactionRepository.java`
- **.refund()** (9 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/CreditService.java`
- **.credit()** (8 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/CreditService.java`
- **CreditTransactionDTO** (7 connections) — `backend/src/main/java/com/venyx/tiktokshop/dtos/CreditTransactionDTO.java`
- **.findWalletOrThrow()** (7 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/CreditService.java`
- **Transactional** (7 connections)
- **.transactions()** (6 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/CreditController.java`
- **.getStatement()** (6 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/CreditService.java`
- **CreditTransactionRepository.java** (5 connections) — `backend/src/main/java/com/venyx/tiktokshop/repositories/CreditTransactionRepository.java`
- **.getWallet()** (5 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/CreditService.java`
- **.monthlyGenerationUsage()** (5 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/CreditService.java`
- **InsufficientCreditsException** (5 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/exceptions/InsufficientCreditsException.java`
- **.findFirstByReasonAndReferenceId()** (4 connections) — `backend/src/main/java/com/venyx/tiktokshop/repositories/CreditTransactionRepository.java`
- **CreditTransactionDTO.java** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/dtos/CreditTransactionDTO.java`
- **.CreditTransactionDTO()** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/dtos/CreditTransactionDTO.java`
- **CreditTransaction.java** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/CreditTransaction.java`
- **.CreditTransaction()** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/CreditTransaction.java`
- **.getReason()** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/CreditTransaction.java`
- **.findByWallet_IdOrderByCreatedAtDesc()** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/repositories/CreditTransactionRepository.java`
- *... and 23 more nodes in this community*

## Relationships

- [Grupo 78](Grupo_78.md) (10 shared connections)
- [Geração de Conteúdo (Jobs)](Gera%C3%A7%C3%A3o_de_Conte%C3%BAdo_%28Jobs%29.md) (9 shared connections)
- [Grupo 40](Grupo_40.md) (8 shared connections)
- [Academy — Aulas](Academy_%E2%80%94_Aulas.md) (7 shared connections)
- [Seed & DataInitializer](Seed_%26_DataInitializer.md) (6 shared connections)
- [Usuários — Service](Usu%C3%A1rios_%E2%80%94_Service.md) (4 shared connections)
- [Meus Produtos (UserProduct)](Meus_Produtos_%28UserProduct%29.md) (3 shared connections)
- [Grupo 68](Grupo_68.md) (2 shared connections)
- [Tratamento de Erros (Handler)](Tratamento_de_Erros_%28Handler%29.md) (2 shared connections)
- [Academy — Módulos](Academy_%E2%80%94_M%C3%B3dulos.md) (2 shared connections)
- [Pacotes de Crédito](Pacotes_de_Cr%C3%A9dito.md) (2 shared connections)
- [Dashboard — Insights](Dashboard_%E2%80%94_Insights.md) (2 shared connections)

## Source Files

- `backend/src/main/java/com/venyx/tiktokshop/controllers/CreditController.java`
- `backend/src/main/java/com/venyx/tiktokshop/dtos/CreditTransactionDTO.java`
- `backend/src/main/java/com/venyx/tiktokshop/entities/CreditTransaction.java`
- `backend/src/main/java/com/venyx/tiktokshop/entities/GenerationJob.java`
- `backend/src/main/java/com/venyx/tiktokshop/entities/enums/CreditTransactionReason.java`
- `backend/src/main/java/com/venyx/tiktokshop/repositories/CreditTransactionRepository.java`
- `backend/src/main/java/com/venyx/tiktokshop/services/CreditService.java`
- `backend/src/main/java/com/venyx/tiktokshop/services/exceptions/BusinessException.java`
- `backend/src/main/java/com/venyx/tiktokshop/services/exceptions/InsufficientCreditsException.java`

## Audit Trail

- EXTRACTED: 233 (92%)
- INFERRED: 19 (8%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*