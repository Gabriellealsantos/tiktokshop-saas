import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export interface GenerateAvatarPayload {
  prompt: string;
  style: string;
  cameraAngle: string;
  shotType: string;
  gender: string;
  ageRange: string;
}

interface GenerateAvatarResponse {
  imageUrl: string;
}

export function useGenerateAvatar<T = GenerateAvatarPayload>() {
  return useMutation({
    mutationFn: async (payload: T) => {
      // TODO: Substituir pelo fetch real do backend
      return new Promise<string>((resolve, reject) => {
        setTimeout(() => {
          // Simulando sucesso (retornando a URL da imagem)
          resolve("/placeholder-avatar-gerado.jpg");

          // Para testar erro, descomente abaixo:
          // reject(new Error("Falha ao se conectar com os servidores GPU."));
        }, 3000); // 3 segundos simulados
      });
    },
    onSuccess: () => {
      toast.success("Avatar gerado com sucesso!");
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao gerar avatar. Tente novamente.");
    }
  });
}
