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
