import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toggle, Page, PageHeader, SectionTitle } from "@/components";
import { AppShell } from "@/layouts/app-shell";
import { getSoundPreference, updateSoundPreference } from "@/services/notificationService";
import { setUserSoundEnabled } from "@/utils/notification-sound";

export default function SettingsScreen() {
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    getSoundPreference()
      .then((res) => setSoundEnabled(res.data?.soundEnabled ?? true))
      .catch(() => {});
  }, []);

  const handleSoundToggle = async (next: boolean) => {
    setSoundEnabled(next); // otimista
    setUserSoundEnabled(next); // reflete no player sem esperar o backend
    try {
      await updateSoundPreference(next);
    } catch {
      setSoundEnabled(!next);
      setUserSoundEnabled(!next);
      toast.error("Não foi possível salvar a preferência de som.");
    }
  };

  return (
    <AppShell>
      <Page>
        <PageHeader
          eyebrow="Conta"
          title="Configurações da Conta"
          description="Controle seu perfil e preferências locais."
        />
        <div className="grid gap-5">
          <div className="panel p-6">
            <SectionTitle title="Preferências" />
            <div className="space-y-5">
              <div className="flex justify-between">
                <span className="text-sm">Som das notificações</span>
                <Toggle checked={soundEnabled} onChange={handleSoundToggle} />
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Tema escuro</span>
                <Toggle checked onChange={() => {}} />
              </div>
            </div>
          </div>
        </div>
      </Page>
    </AppShell>
  );
}
