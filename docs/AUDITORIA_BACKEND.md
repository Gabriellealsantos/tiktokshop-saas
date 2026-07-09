# Auditoria de Backend — Venyx

> Varredura de segurança/consistência das rotas já prontas (2026-07-09).
> Feita junto com a entrega do **perfil self-service** (`PUT /users/me` + `PUT /users/me/password`).
> Escopo: apenas o que já existe. **Não** cobre créditos/quota (outro dev), Estúdio/geração de
> imagem, prompts de IA, nem planos (descontinuados).

## Resumo

O backend passou bem na varredura. As proteções centrais estão no lugar; havia **1 lacuna de
validação** (corrigida) e alguns pontos menores de higiene (listados, sem correção às cegas).

Legenda: 🟥 aplicado agora · 🟨 recomendado (não aplicado, muda comportamento/contrato) · 🟩 verificado OK

---

## Achados

### 🟥 A1 — Unicidade não validada nos updates de usuário (corrigido)
- **Onde:** `services/validation/UserUpdateValidator.java:14` era um no-op (`return true`), então
  `PUT /users/{id}` (admin) nunca checava colisão de `email`/`cpf`/`phone` — todas colunas `UNIQUE`
  no banco (`V1__init.sql`). Uma colisão só estourava lá no `INSERT/UPDATE` como
  `DataIntegrityViolationException` (409 genérico), sem indicar o campo.
- **Risco:** baixo/médio — UX ruim e resposta pouco informativa; não é brecha de segurança.
- **Correção aplicada:** helpers `ensureEmailAvailable/ensureCpfAvailable/ensurePhoneAvailable`
  em `UserService`, chamados tanto no `update` (admin) quanto no novo `updateMe` (self), sempre
  excluindo o próprio registro. Colisão agora retorna `BusinessException` (422) com mensagem de
  campo ("E-mail já cadastrado." etc.). O `UserUpdateValidator` segue como no-op (a validação de
  unicidade precisa do id-alvo, que o validator de bean não tem) — ver A4.

### 🟨 A2 — `UserUpdateDTO.birthDate` é campo morto
- **Onde:** `dtos/UserUpdateDTO.java` expõe `Instant birthDate`, mas `User` **não tem coluna**
  de nascimento e `UserService.copyDtoToEntity` não copia o campo. Ou seja, o valor é silenciosamente
  ignorado tanto no update do admin quanto (por isso) foi deixado de fora do `ProfileUpdateDTO`.
- **Risco:** baixo — confunde o front (parece que salva, mas não).
- **Recomendação (não aplicada):** decidir o produto — ou **remover** `birthDate` do DTO, ou
  **adicionar** coluna `birth_date` no `User` + migration + cópia. Não mexi para não alterar contrato
  sem sua decisão.

### 🟨 A3 — `PUT /users/me` não altera e-mail por decisão
- **Onde:** `ProfileUpdateDTO` retorna `email() == null` de propósito.
- **Motivo:** e-mail é o identificador de login; trocá-lo self-service sem re-confirmação é risco de
  sequestro de identidade. Admin ainda troca via `PUT /users/{id}`.
- **Recomendação (futuro):** se o produto quiser troca de e-mail pelo usuário, fazer um fluxo
  dedicado com re-confirmação (voltar status para `PENDING_CONFIRMATION` + e-mail de verificação).

### 🟨 A4 — `UserUpdateValidator` segue vazio
- **Onde:** `services/validation/UserUpdateValidator.java`.
- **Situação:** a unicidade migrou para o service (A1). O validator continua no-op. Opções: remover
  o par anotação/validator se não houver outra regra cross-field, ou mantê-lo como gancho documentado.
- **Não aplicado** — remoção é limpeza de contrato; deixo a seu critério.

---

## Verificado OK (sem ação)

- 🟩 **Todo `/api/admin/**` exige `ROLE_ADMIN`** via `@PreAuthorize`, e o method security está
  **ativo** (`@EnableMethodSecurity` em `ResourceServerConfig.java:34`) — as anotações realmente disparam.
- 🟩 **IDOR coberto** em `UserProductService.update/delete`: usam `findByIdAndUser_Uuid(id, user.uuid)`,
  então um usuário não edita/apaga produto de outro.
- 🟩 **Rotas self sem `@PreAuthorize`** (`/users/me/**`, `/api/user-products/**`, `CreditController`)
  estão cobertas pelo `anyRequest().authenticated()` da chain da API e resolvem o dono via
  `authService.authenticated()` — padrão correto.
- 🟩 **Filter chains corretas** (`ResourceServerConfig`): `permitAll` só no `/h2-console/**` (dev,
  condicional); a chain da API (`/api/**`, `/auth/**`, `/users/**`, `/mfa/**`, `/ws/**`) libera apenas
  registro/confirmação/ws e exige autenticação no resto (fora do profile `test`).
- 🟩 **Hardening HTTP:** stateless, CSRF desabilitado (correto p/ API JWT), CSP, HSTS,
  `frameOptions.deny`, `contentTypeOptions`, CORS com credenciais e origens por config.
- 🟩 **Perfil self-service (nova entrega):** DTOs enxutos (`ProfileUpdateDTO`/`ChangePasswordDTO`)
  não expõem `userStatus`/`roles`/`password` — sem escalonamento de privilégio; id sempre de
  `authenticated()` (sem IDOR); troca de senha exige a senha atual e rejeita repetição.

---

## Fora de escopo (donos/decisões externas)
- **Créditos/quota/regeneração:** outro dev. `CreditController.usage` ainda reflete o modelo antigo
  (uso mensal) — deve mudar com a entrega diária.
- **Estúdio/geração de imagem, prompts de IA:** não auditados.
- **Planos/assinaturas/compra de crédito:** descontinuados; entidades `Plan`/`UserSubscription`
  seguem no código sem controller (código morto — candidato a remoção futura).
