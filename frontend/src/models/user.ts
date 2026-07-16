// ── Modelo de exibição usado pelas telas (rótulos PT-BR) ──────────────────────
export type UserStatus = "aprovado" | "pendente" | "bloqueado";
export type UserRole = "admin" | "afiliado" | "user";
export type UserPlan = "sem_plano" | "mensal" | "trimestral" | "semestral" | "anual" | "vitalicio";

export type User = {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  role: UserRole;
  plan: UserPlan;
  createdAt: string;
  planExpiresAt?: string;
};

// ── Contratos do back (DTOs) ──────────────────────────────────────────────────
export type BackendUserStatus = "ACTIVE" | "PENDING_CONFIRMATION" | "LOCKED" | "DISABLED";

export type RoleResponse = { id: number; authority: string };

export type UserResponse = {
  id: string;
  name: string;
  phoneNumber?: string;
  cpf?: string;
  email: string;
  userStatus: BackendUserStatus;
  createdAt: string;
  roles: RoleResponse[];
  planType?: string;
};

// ── Mapeamentos back → front ──────────────────────────────────────────────────
export function mapStatus(status: BackendUserStatus): UserStatus {
  switch (status) {
    case "ACTIVE":
      return "aprovado";
    case "PENDING_CONFIRMATION":
      return "pendente";
    default:
      return "bloqueado"; // LOCKED | DISABLED
  }
}

export function mapRole(roles: RoleResponse[]): UserRole {
  const authorities = roles.map((r) => r.authority);
  if (authorities.includes("ROLE_ADMIN")) return "admin";
  if (authorities.includes("ROLE_AFFILIATE")) return "afiliado";
  return "user";
}

const PLAN_MAP: Record<string, UserPlan> = {
  MONTHLY: "mensal",
  QUARTERLY: "trimestral",
  SEMIANNUAL: "semestral",
  ANNUAL: "anual",
  LIFETIME: "vitalicio",
};

/**
 * Converte o UserDTO do back no modelo de exibição.
 */
export function mapUserResponse(dto: UserResponse): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    status: mapStatus(dto.userStatus),
    role: mapRole(dto.roles),
    plan: dto.planType ? PLAN_MAP[dto.planType] ?? "sem_plano" : "sem_plano",
    createdAt: dto.createdAt ?? new Date().toISOString(),
  };
}

// ── Types genéricos de request/response (vindos de userService / authService) ─
// Página do Spring Data (Page<T>) devolvida pela listagem admin.
export type SpringPage<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};

export type ProfileUpdateRequest = {
  name: string;
  phoneNumber?: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type UserRequest = {
  name: string;
  email: string;
  phoneNumber?: string;
  cpf?: string;
  password?: string;
  roles?: { id: number }[];
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  cpf?: string;
};
