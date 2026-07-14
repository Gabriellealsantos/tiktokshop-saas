import { Link } from "react-router-dom";
import { ChevronLeft, Download, Image as ImageIcon } from "lucide-react";

interface CharacterSidebarProps {
  character: any;
  templateId: string;
  isStep3: boolean;
}

export function CharacterSidebar({ character, templateId, isStep3 }: CharacterSidebarProps) {
  return (
    <div className="lg:sticky lg:top-24 flex flex-col gap-4">
      <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden bg-surface-2 border border-white/10 shadow-lg">
        {/* Fallback Icon */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 bg-surface-2">
          <ImageIcon className="size-8 opacity-50" />
        </div>
        <img
          src={character.image}
          alt={character.name}
          className="absolute inset-0 w-full h-full object-cover z-10"
          onError={(e) => { e.currentTarget.style.opacity = "0"; }}
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent pointer-events-none z-20" />
        <div className="absolute bottom-0 inset-x-0 p-4 z-30">
          <h3 className="font-bold text-white text-lg">{character.name}</h3>
        </div>
      </div>

      {!isStep3 && (
        <Link
          to={`/trend-boost/${templateId}`}
          className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-text-2 hover:text-white transition-colors"
        >
          <ChevronLeft className="size-4" />
          Trocar personagem
        </Link>
      )}

      {isStep3 && (
        <a
          href={character.image}
          download
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 bg-surface-2 hover:bg-surface-3 transition-colors text-sm font-semibold text-white"
        >
          <Download className="size-4 text-text-2" />
          Baixar imagem
        </a>
      )}
    </div>
  );
}
