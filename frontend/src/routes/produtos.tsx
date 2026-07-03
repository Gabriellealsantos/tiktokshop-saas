import { createFileRoute } from "@tanstack/react-router";
import { ProductsScreen } from "@/features/products/products-screen";
import * as z from "zod";

const productSearchSchema = z.object({
  novoProduto: z.union([z.string(), z.number()]).optional(),
});

export const Route = createFileRoute("/produtos")({
  validateSearch: productSearchSchema,
  component: ProductsScreen,
  head: () => ({
    meta: [
      { title: "Produtos Virais" },
      { name: "description", content: "Mineração de produtos para TikTok Shop." },
    ],
  }),
});
