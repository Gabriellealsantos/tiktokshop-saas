package com.venyx.tiktokshop.services;

import com.venyx.tiktokshop.dtos.NotificationPreferenceDTO;
import com.venyx.tiktokshop.dtos.NotificationSoundSettingsDTO;
import com.venyx.tiktokshop.entities.NotificationSoundSettings;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.repositories.NotificationSoundSettingsRepository;
import com.venyx.tiktokshop.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Config do som das notificações. Duas camadas independentes:
 * <ul>
 *   <li><b>Global (dono):</b> {@link NotificationSoundSettings} singleton — kill switch + preset por tipo.</li>
 *   <li><b>Por usuário:</b> flag {@code notificationSoundEnabled} em {@link User} — mute pessoal.</li>
 * </ul>
 */
@Service
public class NotificationSoundSettingsService {

    private final NotificationSoundSettingsRepository settingsRepository;
    private final UserRepository userRepository;

    public NotificationSoundSettingsService(NotificationSoundSettingsRepository settingsRepository,
                                            UserRepository userRepository) {
        this.settingsRepository = settingsRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public NotificationSoundSettingsDTO getSettings() {
        return new NotificationSoundSettingsDTO(currentSettings());
    }

    @Transactional
    public NotificationSoundSettingsDTO updateSettings(NotificationSoundSettingsDTO dto) {
        NotificationSoundSettings settings = currentSettings();
        if (dto.enabled() != null) {
            settings.setEnabled(dto.enabled());
        }
        if (dto.saleSoundKey() != null && !dto.saleSoundKey().isBlank()) {
            settings.setSaleSoundKey(dto.saleSoundKey().trim());
        }
        if (dto.announcementSoundKey() != null && !dto.announcementSoundKey().isBlank()) {
            settings.setAnnouncementSoundKey(dto.announcementSoundKey().trim());
        }
        if (dto.systemSoundKey() != null && !dto.systemSoundKey().isBlank()) {
            settings.setSystemSoundKey(dto.systemSoundKey().trim());
        }
        settings = settingsRepository.save(settings);
        return new NotificationSoundSettingsDTO(settings);
    }

    @Transactional(readOnly = true)
    public NotificationPreferenceDTO getPreference(User user) {
        boolean enabled = user.getNotificationSoundEnabled() == null || user.getNotificationSoundEnabled();
        return new NotificationPreferenceDTO(enabled);
    }

    @Transactional
    public NotificationPreferenceDTO updatePreference(User user, NotificationPreferenceDTO dto) {
        if (dto.soundEnabled() != null) {
            user.setNotificationSoundEnabled(dto.soundEnabled());
            userRepository.save(user);
        }
        return getPreference(user);
    }

    /** Singleton: cria a linha default na primeira leitura se ainda não existir. */
    private NotificationSoundSettings currentSettings() {
        return settingsRepository.findTopByOrderByIdAsc()
                .orElseGet(() -> settingsRepository.save(new NotificationSoundSettings()));
    }
}
