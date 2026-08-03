interface ScriptEditorProps {
  speechText: string;
  setSpeechText: (text: string) => void;
}

export function ScriptEditor({ speechText, setSpeechText }: ScriptEditorProps) {
  return (
    <div className="rounded-[28px] bg-[linear-gradient(180deg,hsl(255_100%_95%/0.02),hsl(258_90%_70%/0.008))] backdrop-blur-sm border border-white/10 ring-1 ring-inset ring-white/[0.06] shadow-[0_20px_50px_-24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.10)] p-6 sm:p-8 space-y-4">
      <label className="block text-sm font-semibold text-text-1">
        Roteiro do Vídeo
      </label>
      <textarea
        value={speechText}
        onChange={(e) => setSpeechText(e.target.value)}
        placeholder="Ex: Olá! Hoje vou te mostrar os benefícios deste incrível produto..."
        className="w-full h-40 rounded-xl bg-white/5 border border-white/10 p-4 text-sm text-text-1 placeholder:text-text-3 focus:outline-none focus:border-accent-500 transition-colors resize-none"
      />
      <div className="flex justify-between items-center text-xs text-text-3">
        <span>Caracteres sugeridos: 50 - 500</span>
        <span>{speechText.length} caracteres</span>
      </div>
    </div>
  );
}
