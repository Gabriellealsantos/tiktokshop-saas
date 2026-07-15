# DTOs de Usuário & Validação

> 38 nodes · cohesion 0.09

## Key Concepts

- **UserUpdateDTO** (12 connections) — `backend/src/main/java/com/venyx/tiktokshop/dtos/UserUpdateDTO.java`
- **UserData** (11 connections) — `backend/src/main/java/com/venyx/tiktokshop/interfaces/UserData.java`
- **Password** (10 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/validation/Password.java`
- **.name()** (9 connections) — `backend/src/main/java/com/venyx/tiktokshop/interfaces/UserData.java`
- **UserUpdateValid** (8 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/validation/UserUpdateValid.java`
- **UserStatus** (6 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/enums/UserStatus.java`
- **PasswordValidator** (6 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/validation/PasswordValidator.java`
- **UserUpdateValidator** (6 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/validation/UserUpdateValidator.java`
- **ConstraintValidator** (6 connections)
- **UserInsertDTO.java** (5 connections) — `backend/src/main/java/com/venyx/tiktokshop/dtos/UserInsertDTO.java`
- **UserUpdateDTO.java** (5 connections) — `backend/src/main/java/com/venyx/tiktokshop/dtos/UserUpdateDTO.java`
- **.generate()** (5 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/generation/FakeGenerationProvider.java`
- **UserStatus.java** (4 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/enums/UserStatus.java`
- **Password.java** (4 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/validation/Password.java`
- **.isValid()** (4 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/validation/PasswordValidator.java`
- **UserUpdateValid.java** (4 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/validation/UserUpdateValid.java`
- **UserUpdateValidator.java** (4 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/validation/UserUpdateValidator.java`
- **.isValid()** (4 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/validation/UserUpdateValidator.java`
- **UserDTO.java** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/dtos/UserDTO.java`
- **PasswordValidator.java** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/validation/PasswordValidator.java`
- **ConstraintValidatorContext** (3 connections)
- **.initialize()** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/validation/PasswordValidator.java`
- **.setMessage()** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/validation/PasswordValidator.java`
- **.initialize()** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/validation/UserUpdateValidator.java`
- **.phoneNumber()** (2 connections) — `backend/src/main/java/com/venyx/tiktokshop/interfaces/UserData.java`
- *... and 13 more nodes in this community*

## Relationships

- [Usuários — Service](Usu%C3%A1rios_%E2%80%94_Service.md) (11 shared connections)
- [Repositório de Usuários](Reposit%C3%B3rio_de_Usu%C3%A1rios.md) (5 shared connections)
- [Geração de Conteúdo (Jobs)](Gera%C3%A7%C3%A3o_de_Conte%C3%BAdo_%28Jobs%29.md) (3 shared connections)
- [Grupo 56](Grupo_56.md) (2 shared connections)
- [Registro & E-mail](Registro_%26_E-mail.md) (2 shared connections)
- [Login — Handlers de Sucesso/Falha](Login_%E2%80%94_Handlers_de_Sucesso-Falha.md) (1 shared connections)
- [Seed & DataInitializer](Seed_%26_DataInitializer.md) (1 shared connections)
- [Roles & OAuth2 User](Roles_%26_OAuth2_User.md) (1 shared connections)
- [Grupo 50](Grupo_50.md) (1 shared connections)
- [Pacotes de Crédito](Pacotes_de_Cr%C3%A9dito.md) (1 shared connections)
- [Créditos — Carteira & Transações](Cr%C3%A9ditos_%E2%80%94_Carteira_%26_Transa%C3%A7%C3%B5es.md) (1 shared connections)
- [Avatares — Galeria](Avatares_%E2%80%94_Galeria.md) (1 shared connections)

## Source Files

- `backend/src/main/java/com/venyx/tiktokshop/dtos/UserDTO.java`
- `backend/src/main/java/com/venyx/tiktokshop/dtos/UserInsertDTO.java`
- `backend/src/main/java/com/venyx/tiktokshop/dtos/UserUpdateDTO.java`
- `backend/src/main/java/com/venyx/tiktokshop/entities/enums/UserStatus.java`
- `backend/src/main/java/com/venyx/tiktokshop/interfaces/UserData.java`
- `backend/src/main/java/com/venyx/tiktokshop/services/generation/FakeGenerationProvider.java`
- `backend/src/main/java/com/venyx/tiktokshop/services/validation/Password.java`
- `backend/src/main/java/com/venyx/tiktokshop/services/validation/PasswordValidator.java`
- `backend/src/main/java/com/venyx/tiktokshop/services/validation/UserUpdateValid.java`
- `backend/src/main/java/com/venyx/tiktokshop/services/validation/UserUpdateValidator.java`

## Audit Trail

- EXTRACTED: 145 (94%)
- INFERRED: 10 (6%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*