# Tratamento de Erros (Handler)

> 49 nodes · cohesion 0.15

## Key Concepts

- **StandardError** (24 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/StandardError.java`
- **ControllerExceptionHandler** (14 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/ControllerExceptionHandler.java`
- **.handleHttpMessageNotReadable()** (14 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/ControllerExceptionHandler.java`
- **.validation()** (13 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/ControllerExceptionHandler.java`
- **HttpServletRequest** (13 connections)
- **ResponseEntity** (13 connections)
- **.setError()** (13 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/StandardError.java`
- **.setMessage()** (13 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/StandardError.java`
- **.setPath()** (13 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/StandardError.java`
- **.setStatus()** (13 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/StandardError.java`
- **.setTimestamp()** (13 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/StandardError.java`
- **ExceptionHandler** (13 connections)
- **.business()** (12 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/ControllerExceptionHandler.java`
- **.database()** (12 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/ControllerExceptionHandler.java`
- **.dataIntegrity()** (12 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/ControllerExceptionHandler.java`
- **.duplicated()** (12 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/ControllerExceptionHandler.java`
- **.email()** (12 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/ControllerExceptionHandler.java`
- **.entityNotFound()** (12 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/ControllerExceptionHandler.java`
- **.forbidden()** (12 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/ControllerExceptionHandler.java`
- **.insufficientCredits()** (12 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/ControllerExceptionHandler.java`
- **.getMessage()** (12 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/StandardError.java`
- **.handleLockFailure()** (11 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/ControllerExceptionHandler.java`
- **.illegalArgument()** (11 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/ControllerExceptionHandler.java`
- **ControllerExceptionHandler.java** (10 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/ControllerExceptionHandler.java`
- **FieldMessage** (9 connections) — `backend/src/main/java/com/venyx/tiktokshop/controllers/exceptions/FieldMessage.java`
- *... and 24 more nodes in this community*

## Relationships

- [Usuários — Service](Usu%C3%A1rios_%E2%80%94_Service.md) (3 shared connections)
- [Créditos — Carteira & Transações](Cr%C3%A9ditos_%E2%80%94_Carteira_%26_Transa%C3%A7%C3%B5es.md) (2 shared connections)
- [Registro & E-mail](Registro_%26_E-mail.md) (1 shared connections)
- [Academy — Aulas](Academy_%E2%80%94_Aulas.md) (1 shared connections)

## Source Files

- `backend/src/main/java/com/venyx/tiktokshop/controllers/exceptions/FieldMessage.java`
- `backend/src/main/java/com/venyx/tiktokshop/controllers/exceptions/ValidationError.java`
- `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/ControllerExceptionHandler.java`
- `backend/src/main/java/com/venyx/tiktokshop/controllers/handlers/StandardError.java`
- `backend/src/main/java/com/venyx/tiktokshop/services/exceptions/DuplicateResourceException.java`

## Audit Trail

- EXTRACTED: 215 (59%)
- INFERRED: 148 (41%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*