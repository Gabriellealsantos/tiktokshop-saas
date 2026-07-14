# OAuth2 — Token & AuthCode

> 39 nodes · cohesion 0.08

## Key Concepts

- **AuthCode** (22 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/AuthCode.java`
- **JwtTokenService** (14 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/JwtTokenService.java`
- **OAuth2LoginSuccessHandler.java** (10 connections) — `backend/src/main/java/com/venyx/tiktokshop/config/security/oauth2/handler/OAuth2LoginSuccessHandler.java`
- **OAuth2LoginSuccessHandler** (8 connections) — `backend/src/main/java/com/venyx/tiktokshop/config/security/oauth2/handler/OAuth2LoginSuccessHandler.java`
- **.onAuthenticationSuccess()** (7 connections) — `backend/src/main/java/com/venyx/tiktokshop/config/security/oauth2/handler/OAuth2LoginSuccessHandler.java`
- **AuthCodeRepository** (7 connections) — `backend/src/main/java/com/venyx/tiktokshop/repositories/AuthCodeRepository.java`
- **.MfaAuthenticationSuccessHandler()** (4 connections) — `backend/src/main/java/com/venyx/tiktokshop/config/security/handler/MfaAuthenticationSuccessHandler.java`
- **.OAuth2LoginSuccessHandler()** (4 connections) — `backend/src/main/java/com/venyx/tiktokshop/config/security/oauth2/handler/OAuth2LoginSuccessHandler.java`
- **User** (4 connections)
- **JwtTokenService.java** (4 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/JwtTokenService.java`
- **AuthCodeRepository.java** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/repositories/AuthCodeRepository.java`
- **.JwtTokenService()** (3 connections) — `backend/src/main/java/com/venyx/tiktokshop/services/JwtTokenService.java`
- **AuthenticationSuccessHandler** (2 connections)
- **Authentication** (2 connections)
- **Component** (2 connections)
- **HttpServletRequest** (2 connections)
- **HttpServletResponse** (2 connections)
- **.AuthCode()** (2 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/AuthCode.java`
- **.equals()** (2 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/AuthCode.java`
- **.getUser()** (2 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/AuthCode.java`
- **.hashCode()** (2 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/AuthCode.java`
- **.setUser()** (2 connections) — `backend/src/main/java/com/venyx/tiktokshop/entities/AuthCode.java`
- **Override** (2 connections)
- **.findByCode()** (2 connections) — `backend/src/main/java/com/venyx/tiktokshop/repositories/AuthCodeRepository.java`
- **JwtDecoder** (2 connections)
- *... and 14 more nodes in this community*

## Relationships

- [Usuários — Service](Usu%C3%A1rios_%E2%80%94_Service.md) (5 shared connections)
- [Grupo 50](Grupo_50.md) (3 shared connections)
- [Login — Handlers de Sucesso/Falha](Login_%E2%80%94_Handlers_de_Sucesso-Falha.md) (3 shared connections)
- [Grupo 68](Grupo_68.md) (2 shared connections)
- [Repositório de Usuários](Reposit%C3%B3rio_de_Usu%C3%A1rios.md) (1 shared connections)
- [Grupo 84](Grupo_84.md) (1 shared connections)
- [Roles & OAuth2 User](Roles_%26_OAuth2_User.md) (1 shared connections)

## Source Files

- `backend/src/main/java/com/venyx/tiktokshop/config/security/handler/MfaAuthenticationSuccessHandler.java`
- `backend/src/main/java/com/venyx/tiktokshop/config/security/oauth2/handler/OAuth2LoginSuccessHandler.java`
- `backend/src/main/java/com/venyx/tiktokshop/entities/AuthCode.java`
- `backend/src/main/java/com/venyx/tiktokshop/repositories/AuthCodeRepository.java`
- `backend/src/main/java/com/venyx/tiktokshop/services/JwtTokenService.java`

## Audit Trail

- EXTRACTED: 130 (98%)
- INFERRED: 2 (2%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*