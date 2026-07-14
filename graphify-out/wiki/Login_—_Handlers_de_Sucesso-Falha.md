# Login — Handlers de Sucesso/Falha

> 42 nodes · cohesion 0.07

## Key Concepts

- **User** (61 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/User.java`
- **.getEmail()** (13 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/User.java`
- **.onAuthenticationSuccess()** (12 connections) — `backend/src/main/java/com/venyx/tiktokshop/config/security/handler/FederatedIdentitySuccessHandler.java`
- **Override** (9 connections)
- **.handleSuccessfulLogin()** (8 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/AuthService.java`
- **.handleFailedLoginAttempt()** (7 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/AuthService.java`
- **.saveNewPassword()** (7 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/AuthService.java`
- **Transactional** (7 connections)
- **.getPassword()** (5 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/User.java`
- **User** (4 connections)
- **.generatePreAuthToken()** (4 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/JwtTokenService.java`
- **.generateToken()** (4 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/JwtTokenService.java`
- **.equals()** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/User.java`
- **.getFailedLoginAttempts()** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/User.java`
- **.hasRole()** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/User.java`
- **.isAccountNonLocked()** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/User.java`
- **.setFailedLoginAttempts()** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/User.java`
- **.setLockoutEndTime()** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/User.java`
- **Authentication** (2 connections)
- **HttpServletRequest** (2 connections)
- **HttpServletResponse** (2 connections)
- **.getLockoutEndTime()** (2 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/User.java`
- **.hashCode()** (2 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/User.java`
- **.isAccountNonExpired()** (2 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/User.java`
- **.isCredentialsNonExpired()** (2 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/User.java`
- *... and 17 more nodes in this community*

## Relationships

- [Usuários — Service](Usu%C3%A1rios_%E2%80%94_Service.md) (19 shared connections)
- [Grupo 50](Grupo_50.md) (8 shared connections)
- [Roles & OAuth2 User](Roles_%26_OAuth2_User.md) (8 shared connections)
- [Recuperação de Senha](Recupera%C3%A7%C3%A3o_de_Senha.md) (8 shared connections)
- [MFA & Códigos de Recuperação](MFA_%26_C%C3%B3digos_de_Recupera%C3%A7%C3%A3o.md) (7 shared connections)
- [Repositório de Usuários](Reposit%C3%B3rio_de_Usu%C3%A1rios.md) (6 shared connections)
- [Grupo 40](Grupo_40.md) (3 shared connections)
- [OAuth2 — Token & AuthCode](OAuth2_%E2%80%94_Token_%26_AuthCode.md) (3 shared connections)
- [Meus Produtos (UserProduct)](Meus_Produtos_%28UserProduct%29.md) (3 shared connections)
- [Grupo 77](Grupo_77.md) (2 shared connections)
- [DTOs de Usuário & Validação](DTOs_de_Usu%C3%A1rio_%26_Valida%C3%A7%C3%A3o.md) (1 shared connections)
- [Grupo 84](Grupo_84.md) (1 shared connections)

## Source Files

- `backend/src/main/java/com/venyx/tiktokshop/config/security/handler/FederatedIdentitySuccessHandler.java`
- `backend/src/main/java/com/venyx/tiktokshop/entities/User.java`
- `backend/src/main/java/com/venyx/tiktokshop/services/AuthService.java`
- `backend/src/main/java/com/venyx/tiktokshop/services/JwtTokenService.java`

## Audit Trail

- EXTRACTED: 147 (76%)
- INFERRED: 47 (24%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*