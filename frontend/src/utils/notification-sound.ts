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

const soundUrl = (key: string) => {
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
        updatedAt: null,
      };
    } finally {
      loading = null;
    }
  })();
  return loading;
}

function keyForType(type: BackendNotificationType): string {
  if (!settings) return "ding";
  switch (type) {
    case "SALE":
      return settings.saleSoundKey;
    case "SYSTEM":
      return settings.systemSoundKey;
    case "ANNOUNCEMENT":
    default:
      return settings.announcementSoundKey;
  }
}

/** Toca o som de um arquivo específico (usado no preview do admin). */
export function playSoundKey(key: string): void {
  try {
    const audio = new Audio(soundUrl(key));
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
  playSoundKey(keyForType(type));
}

/** Atualiza o cache local quando o admin salva novos presets. */
export function setCachedSettings(next: NotificationSoundSettings): void {
  settings = next;
}

/** Atualiza o cache local quando o usuário liga/desliga o próprio som. */
export function setUserSoundEnabled(enabled: boolean): void {
  userMuted = !enabled;
}
