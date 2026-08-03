import { Volume2 } from "lucide-react";
import { VOZES } from "../../data";

interface VoiceSelectorProps {
  voiceId: string;
  setVoiceId: (id: string) => void;
}

export function VoiceSelector({ voiceId, setVoiceId }: VoiceSelectorProps) {
  return (
    <div className="rounded-[28px] bg-[linear-gradient(180deg,hsl(255_100%_95%/0.02),hsl(258_90%_70%/0.008))] backdrop-blur-sm border border-white/10 ring-1 ring-inset ring-white/[0.06] shadow-[0_20px_50px_-24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.10)] p-6 sm:p-8 space-y-4">
      <label className="block text-sm font-semibold text-text-1">
        Selecione a Voz do Narrador
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        {VOZES.map((voice) => (
          <button
            key={voice.id}
            onClick={() => setVoiceId(voice.id)}
            className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
              voiceId === voice.id
                ? "bg-accent-500/10 border-accent-500/40 text-text-1 shadow-glow"
                : "bg-white/5 border-white/10 hover:bg-white/10 text-text-2"
            }`}
          >
            <div className={`p-2 rounded-lg ${voiceId === voice.id ? "bg-accent-500/20" : "bg-white/5"}`}>
              <Volume2 className="size-5 text-accent-400" />
            </div>
            <div>
              <div className="text-sm font-medium">{voice.name}</div>
              <div className="text-xs text-text-3 mt-0.5">{voice.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
