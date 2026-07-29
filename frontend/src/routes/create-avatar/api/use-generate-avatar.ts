import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { generateAvatar } from "@/services/avatarService";
import type { AvatarConfigDTO, ImageGenerationDTO } from "@/models/avatar";
import { extractError } from "@/utils/api-error";

type GenerateInput = {
  config: AvatarConfigDTO;
  clothingImageUrl?: string | null;
  clothingPart?: string | null;
};

export function useGenerateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ config, clothingImageUrl, clothingPart }: GenerateInput) => {
      const response = await generateAvatar(config, null, clothingImageUrl, clothingPart);
      const job = response.data as ImageGenerationDTO;

      if (job.status === "FAILED") {
        throw new Error(job.error ?? "A geração falhou. Tente novamente.");
      }
      return job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avatar-usage"] });
      toast.success("Avatar gerado com sucesso!");
    },
    onError: (err) => toast.error(extractError(err, "Erro ao gerar avatar. Tente novamente.")),
  });
}