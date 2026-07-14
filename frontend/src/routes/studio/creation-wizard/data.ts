export const toSlug = (text: string) => {
  const map: Record<string, string> = {
    "De Frente": "de-frente",
    "Mais Próximo": "mais-proximo",
    "Corpo Completo": "corpo-completo",
    "Automático": "automatico",
    "Quarto": "quarto",
    "Estúdio": "estudio",
    "Ao ar livre": "ar-livre",
    "Academia": "academia",
    "Cozinha": "cozinha",
    "Escritório": "escritorio",
    "Banheiro": "banheiro",
    "Loja": "loja",
    "Natureza": "natureza",
    "Personalizado": "personalizado",
    "UGC Natural": "ugc-natural",
    "Hook TikTok": "hook-tiktok",
    "Mostrar o Produto": "mostrar-produto",
    "Review": "review",
    "Natural": "natural",
    "Mais Expressivo": "expressivo",
    "Mais Discreto": "discreto",
    "Traição": "traicao",
    "Drama Familiar": "drama-familiar",
    "Vida na Favela": "vida-na-favela",
    "Fofoca / Barraco": "fofoca",
    "Romance Proibido": "romance-proibido",
    "Vingança": "vinganca",
    "Superação": "superacao",
    "Mistério": "misterio"
  };
  return map[text] || text.toLowerCase().replace(/ /g, '-');
};

export const configs = {
  original: {
    title: "Original (UGC)",
    steps: ["Produto", "Câmera & Influenciador", "Áudio & Roteiro", "Criação Final"],
  },
  imersivo: {
    title: "Imersivo (POV)",
    steps: ["Produto", "Configuração POV", "Áudio & Roteiro", "Criação Final"],
  },
  cinematografico: {
    title: "Cinematográfico",
    steps: [
      "Produto",
      "Influenciador Digital",
      "Cenário & Interação",
      "Movimento",
      "Criação Final",
    ],
  },
};
