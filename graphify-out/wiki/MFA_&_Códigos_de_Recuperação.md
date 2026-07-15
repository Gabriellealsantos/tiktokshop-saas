# MFA & Códigos de Recuperação

> 46 nodes · cohesion 0.09

## Key Concepts

- **UserRecoveryCode** (19 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/UserRecoveryCode.java`
- **MfaService** (18 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/MfaService.java`
- **MfaService.java** (14 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/MfaService.java`
- **UserRecoveryCodeRepository** (9 connections) — `backend/src/main/java/com/venyx/tiktokshop/repositories/UserRecoveryCodeRepository.java`
- **.MfaService()** (9 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/MfaService.java`
- **.verifyMfa()** (8 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/MfaService.java`
- **Transactional** (7 connections)
- **.disableMfa()** (7 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/MfaService.java`
- **.generateAndSaveRecoveryCodes()** (7 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/MfaService.java`
- **.verifyLoginMfa()** (7 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/MfaService.java`
- **.getMfaEnabled()** (6 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/User.java`
- **.regenerateRecoveryCodes()** (6 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/MfaService.java`
- **.setupMfa()** (6 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/MfaService.java`
- **.validateRecoveryCode()** (6 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/MfaService.java`
- **MfaActivationDTO** (5 connections) — `backend/src/main/java/com/venyx/tiktokshop/dtos/MfaActivationDTO.java`
- **User** (4 connections)
- **UserRecoveryCodeRepository.java** (4 connections) — `backend/src/main/java/com/venyx/tiktokshop/repositories/UserRecoveryCodeRepository.java`
- **.deleteByUser()** (4 connections) — `backend/src/main/java/com/venyx/tiktokshop/repositories/UserRecoveryCodeRepository.java`
- **.findByUser()** (4 connections) — `backend/src/main/java/com/venyx/tiktokshop/repositories/UserRecoveryCodeRepository.java`
- **MfaSetupDTO** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/dtos/MfaSetupDTO.java`
- **.getMfaSecret()** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/User.java`
- **.setMfaEnabled()** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/User.java`
- **.setMfaSecret()** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/User.java`
- **CodeVerifier** (3 connections)
- **PasswordEncoder** (3 connections)
- *... and 21 more nodes in this community*

## Relationships

- [Login — Handlers de Sucesso/Falha](Login_%E2%80%94_Handlers_de_Sucesso-Falha.md) (7 shared connections)
- [Repositório de Usuários](Reposit%C3%B3rio_de_Usu%C3%A1rios.md) (4 shared connections)
- [Meus Produtos (UserProduct)](Meus_Produtos_%28UserProduct%29.md) (4 shared connections)
- [Grupo 68](Grupo_68.md) (2 shared connections)
- [Recuperação de Senha](Recupera%C3%A7%C3%A3o_de_Senha.md) (2 shared connections)
- [Grupo 50](Grupo_50.md) (1 shared connections)
- [Grupo 84](Grupo_84.md) (1 shared connections)

## Source Files

- `backend/src/main/java/com/venyx/tiktokshop/dtos/MfaActivationDTO.java`
- `backend/src/main/java/com/venyx/tiktokshop/dtos/MfaSetupDTO.java`
- `backend/src/main/java/com/venyx/tiktokshop/entities/User.java`
- `backend/src/main/java/com/venyx/tiktokshop/entities/UserRecoveryCode.java`
- `backend/src/main/java/com/venyx/tiktokshop/repositories/UserRecoveryCodeRepository.java`
- `backend/src/main/java/com/venyx/tiktokshop/services/MfaService.java`

## Audit Trail

- EXTRACTED: 172 (83%)
- INFERRED: 35 (17%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*