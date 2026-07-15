# Recuperação de Senha

> 43 nodes · cohesion 0.08

## Key Concepts

- **AuthService** (36 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/AuthService.java`
- **PasswordRecover** (20 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/PasswordRecover.java`
- **AuthService.java** (16 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/AuthService.java`
- **.createRecoverToken()** (8 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/AuthService.java`
- **AuthController** (7 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/AuthController.java`
- **PasswordRecoverRepository** (7 connections) — `backend/src/main/java/com/venyx/tiktokshop/repositories/PasswordRecoverRepository.java`
- **AuthController.java** (5 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/AuthController.java`
- **EmailDTO** (5 connections) — `backend/src/main/java/com/venyx/tiktokshop/dtos/EmailDTO.java`
- **NewPasswordDTO** (5 connections) — `backend/src/main/java/com/venyx/tiktokshop/dtos/NewPasswordDTO.java`
- **.AuthService()** (5 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/AuthService.java`
- **.createRecoverToken()** (4 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/AuthController.java`
- **.saveNewPassword()** (4 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/AuthController.java`
- **PasswordRecoverRepository.java** (4 connections) — `backend/src/main/java/com/venyx/tiktokshop/repositories/PasswordRecoverRepository.java`
- **.searchValidTokens()** (4 connections) — `backend/src/main/java/com/venyx/tiktokshop/repositories/PasswordRecoverRepository.java`
- **ResponseEntity** (3 connections)
- **User** (3 connections)
- **PasswordEncoder** (3 connections)
- **.AuthController()** (2 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/AuthController.java`
- **NewPasswordDTO.java** (2 connections) — `backend/src/main/java/com/venyx/tiktokshop/dtos/NewPasswordDTO.java`
- **Override** (2 connections)
- **.equals()** (2 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/PasswordRecover.java`
- **.getUser()** (2 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/PasswordRecover.java`
- **.hashCode()** (2 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/PasswordRecover.java`
- **.setExpiration()** (2 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/PasswordRecover.java`
- **.setToken()** (2 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/PasswordRecover.java`
- *... and 18 more nodes in this community*

## Relationships

- [Login — Handlers de Sucesso/Falha](Login_%E2%80%94_Handlers_de_Sucesso-Falha.md) (8 shared connections)
- [Repositório de Usuários](Reposit%C3%B3rio_de_Usu%C3%A1rios.md) (6 shared connections)
- [Meus Produtos (UserProduct)](Meus_Produtos_%28UserProduct%29.md) (4 shared connections)
- [Usuários — Service](Usu%C3%A1rios_%E2%80%94_Service.md) (3 shared connections)
- [Grupo 77](Grupo_77.md) (3 shared connections)
- [Grupo 78](Grupo_78.md) (3 shared connections)
- [Geração de Conteúdo (Jobs)](Gera%C3%A7%C3%A3o_de_Conte%C3%BAdo_%28Jobs%29.md) (3 shared connections)
- [Registro & E-mail](Registro_%26_E-mail.md) (3 shared connections)
- [Grupo 68](Grupo_68.md) (2 shared connections)
- [Roles & OAuth2 User](Roles_%26_OAuth2_User.md) (2 shared connections)
- [MFA & Códigos de Recuperação](MFA_%26_C%C3%B3digos_de_Recupera%C3%A7%C3%A3o.md) (2 shared connections)
- [DTOs de Usuário & Validação](DTOs_de_Usu%C3%A1rio_%26_Valida%C3%A7%C3%A3o.md) (1 shared connections)

## Source Files

- `backend/src/main/java/com/venyx/tiktokshop/controllers/AuthController.java`
- `backend/src/main/java/com/venyx/tiktokshop/dtos/EmailDTO.java`
- `backend/src/main/java/com/venyx/tiktokshop/dtos/NewPasswordDTO.java`
- `backend/src/main/java/com/venyx/tiktokshop/entities/PasswordRecover.java`
- `backend/src/main/java/com/venyx/tiktokshop/repositories/PasswordRecoverRepository.java`
- `backend/src/main/java/com/venyx/tiktokshop/services/AuthService.java`

## Audit Trail

- EXTRACTED: 172 (96%)
- INFERRED: 7 (4%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*