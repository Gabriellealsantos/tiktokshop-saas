/** Espelha NotificationType do back. */
export type BackendNotificationType = "SALE" | "ANNOUNCEMENT" | "SYSTEM";

/** Espelha NotificationDTO do back. id vem nulo no toast efêmero de venda. */
export type NotificationResponse = {
  id: number | null;
  type: BackendNotificationType;
  title: string;
  body: string | null;
  imageUrl: string | null;
  clickUrl: string | null;
  createdAt: string;
  read: boolean;
};

/** Config global do som escolhida pelo dono (preset por tipo). Espelha NotificationSoundSettingsDTO. */
export type NotificationSoundSettings = {
  id: number | null;
  enabled: boolean;
  saleSoundKey: string;
  announcementSoundKey: string;
  systemSoundKey: string;
  updatedAt: string | null;
};

/** Preferência de mute por usuário. Espelha NotificationPreferenceDTO. */
export type NotificationPreference = {
  soundEnabled: boolean;
};
