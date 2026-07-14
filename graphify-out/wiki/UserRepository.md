# UserRepository

> God node · 42 connections · `backend/src/main/java/com/venyx/tiktokshop/repositories/UserRepository.java`

**Community:** [Repositório de Usuários](Reposit%C3%B3rio_de_Usu%C3%A1rios.md)

## Connections by Relation

### contains
- UserRepository.java `EXTRACTED`

### imports
- AuthorizationServerConfig.java `EXTRACTED`
- UserService.java `EXTRACTED`
- AuthService.java `EXTRACTED`
- RegistrationService.java `EXTRACTED`
- DataInitializer.java `EXTRACTED`
- CustomOAuth2UserService.java `EXTRACTED`
- MfaService.java `EXTRACTED`
- FederatedIdentitySuccessHandler.java `EXTRACTED`
- MfaAuthenticationSuccessHandler.java `EXTRACTED`
- AuthenticationEventsListener.java `EXTRACTED`
- UserInsertValidator.java `EXTRACTED`

### inherits
- JpaRepository `EXTRACTED`

### method
- .findByEmail() `EXTRACTED`
- .findByEmailWithRoles() `EXTRACTED`
- .searchUsers() `EXTRACTED`
- .findByCpfWithRoles() `EXTRACTED`
- .findByPhoneWithRoles() `EXTRACTED`
- .findByCpf() `EXTRACTED`
- .findByPhone() `EXTRACTED`

### references
- [AuthService](AuthService.md) `EXTRACTED`
- UserService `EXTRACTED`
- MfaService `EXTRACTED`
- RegistrationService `EXTRACTED`
- CustomOAuth2UserService `EXTRACTED`
- DataInitializer `EXTRACTED`
- FederatedIdentitySuccessHandler `EXTRACTED`
- MfaAuthenticationSuccessHandler `EXTRACTED`
- .tokenCustomizer() `EXTRACTED`
- .MfaService() `EXTRACTED`
- AuthenticationEventsListener `EXTRACTED`
- [User](User.md) `EXTRACTED`
- UserInsertValidator `EXTRACTED`
- .RegistrationService() `EXTRACTED`
- .DataInitializer() `EXTRACTED`
- .AuthService() `EXTRACTED`
- .UserService() `EXTRACTED`
- .MfaAuthenticationSuccessHandler() `EXTRACTED`
- .CustomOAuth2UserService() `EXTRACTED`
- .AuthenticationEventsListener() `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*