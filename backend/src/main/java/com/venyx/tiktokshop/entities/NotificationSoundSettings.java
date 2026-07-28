package com.venyx.tiktokshop.entities;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.Objects;

/**
 * Configuração global (singleton) do som das notificações in-app. O dono do SaaS escolhe,
 * por tipo de notificação, qual preset toca no cliente. O backend guarda apenas a <b>chave</b>
 * do preset (ex.: "cash", "ding"); os arquivos .mp3 vivem no bundle do frontend.
 */
@Entity
@Table(name = "notification_sound_settings")
public class NotificationSoundSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Liga/desliga globalmente o som (kill switch do dono). */
    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "sale_sound_key", nullable = false)
    private String saleSoundKey = "cash";

    @Column(name = "announcement_sound_key", nullable = false)
    private String announcementSoundKey = "ding";

    @Column(name = "system_sound_key", nullable = false)
    private String systemSoundKey = "chime";

    /** URL do som enviado pelo dono quando a respectiva *SoundKey vale "custom". */
    @Column(name = "sale_sound_url")
    private String saleSoundUrl;

    @Column(name = "announcement_sound_url")
    private String announcementSoundUrl;

    @Column(name = "system_sound_url")
    private String systemSoundUrl;

    @Column(columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Instant updatedAt;

    public NotificationSoundSettings() {
    }

    @PrePersist
    @PreUpdate
    public void touch() {
        this.updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getSaleSoundKey() {
        return saleSoundKey;
    }

    public void setSaleSoundKey(String saleSoundKey) {
        this.saleSoundKey = saleSoundKey;
    }

    public String getAnnouncementSoundKey() {
        return announcementSoundKey;
    }

    public void setAnnouncementSoundKey(String announcementSoundKey) {
        this.announcementSoundKey = announcementSoundKey;
    }

    public String getSystemSoundKey() {
        return systemSoundKey;
    }

    public void setSystemSoundKey(String systemSoundKey) {
        this.systemSoundKey = systemSoundKey;
    }

    public String getSaleSoundUrl() {
        return saleSoundUrl;
    }

    public void setSaleSoundUrl(String saleSoundUrl) {
        this.saleSoundUrl = saleSoundUrl;
    }

    public String getAnnouncementSoundUrl() {
        return announcementSoundUrl;
    }

    public void setAnnouncementSoundUrl(String announcementSoundUrl) {
        this.announcementSoundUrl = announcementSoundUrl;
    }

    public String getSystemSoundUrl() {
        return systemSoundUrl;
    }

    public void setSystemSoundUrl(String systemSoundUrl) {
        this.systemSoundUrl = systemSoundUrl;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        NotificationSoundSettings that = (NotificationSoundSettings) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
