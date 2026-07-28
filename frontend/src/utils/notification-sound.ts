import type { BackendNotificationType, NotificationSoundSettings } from "@/models/notification";
import {
  getSoundPreference,
  getSoundSettings,
} from "@/services/notificationService";

// ─────────────────────────────────────────────────────────────────────────────
// Som das notificações in-app.
// Duas camadas: config global do dono (kill switch + preset por tipo) e a
// preferência de mute do usuário. Ambas são cacheadas em memória e alimentadas
// por um único ponto — o store de notificações — quando uma notificação chega.
// Os arquivos ficam em public/sounds/{key}.wav (servidos na raiz).
// ─────────────────────────────────────────────────────────────────────────────

export const SOUND_KEYS = ["ding", "cash", "pop", "chime"] as const;
export type SoundKey = (typeof SOUND_KEYS)[number];

export const SOUND_LABELS: Record<SoundKey, string> = {
  ding: "Ding",
  cash: "Cha-ching",
  pop: "Pop",
  chime: "Chime",
};

export const CUSTOM_SOUND_KEY = "custom";
export const CUSTOM_SOUND_LABEL = "Personalizado";

/** Resolve a URL do som: "custom" toca o áudio enviado, senão cai no preset fixo. */
const soundUrl = (key: string, customUrl?: string | null) => {
  if (key === CUSTOM_SOUND_KEY) {
    return customUrl ?? "";
  }
  const safe = (SOUND_KEYS as readonly string[]).includes(key) ? key : "ding";
  return `/sounds/${safe}.wav`;
};

// Cache das configs (evita bater no backend a cada notificação).
let settings: NotificationSoundSettings | null = null;
let userMuted = false;
let loading: Promise<void> | null = null;

/** Carrega (uma vez) a config global + preferência do usuário. Idempotente. */
export async function initNotificationSound(): Promise<void> {
  if (settings) return;
  if (loading) return loading;
  loading = (async () => {
    try {
      const [s, p] = await Promise.all([getSoundSettings(), getSoundPreference()]);
      settings = s.data as NotificationSoundSettings;
      userMuted = !(p.data?.soundEnabled ?? true);
    } catch {
      // Falha silenciosa: som é secundário, a notificação visual continua funcionando.
      settings = {
        id: null,
        enabled: true,
        saleSoundKey: "cash",
        announcementSoundKey: "ding",
        systemSoundKey: "chime",
        saleSoundUrl: null,
        announcementSoundUrl: null,
        systemSoundUrl: null,
        updatedAt: null,
      };
    } finally {
      loading = null;
    }
  })();
  return loading;
}

function soundForType(type: BackendNotificationType): { key: string; url: string | null } {
  if (!settings) return { key: "ding", url: null };
  switch (type) {
    case "SALE":
      return { key: settings.saleSoundKey, url: settings.saleSoundUrl };
    case "SYSTEM":
      return { key: settings.systemSoundKey, url: settings.systemSoundUrl };
    case "ANNOUNCEMENT":
    default:
      return { key: settings.announcementSoundKey, url: settings.announcementSoundUrl };
  }
}

/** Toca o som de um arquivo específico (usado no preview do admin). */
export function playSoundKey(key: string, customUrl?: string | null): void {
  try {
    const url = soundUrl(key, customUrl);
    if (!url) return;
    const audio = new Audio(url);
    audio.volume = 0.6;
    void audio.play().catch(() => {});
  } catch {
    // ignore
  }
}

/**
 * Toca o som correspondente ao tipo da notificação, respeitando o kill switch
 * global do dono e o mute do usuário. Chamado quando uma notificação nova chega.
 */
export function playForType(type: BackendNotificationType): void {
  if (!settings || !settings.enabled || userMuted) return;
  const { key, url } = soundForType(type);
  playSoundKey(key, url);
}

/** Atualiza o cache local quando o admin salva novos presets. */
export function setCachedSettings(next: NotificationSoundSettings): void {
  settings = next;
}

/** Atualiza o cache local quando o usuário liga/desliga o próprio som. */
export function setUserSoundEnabled(enabled: boolean): void {
  userMuted = !enabled;
}
