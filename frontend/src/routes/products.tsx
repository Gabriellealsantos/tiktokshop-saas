import { createFileRoute } from "@tanstack/react-router";
import { ProductsScreen } from "@/features/products";
import * as z from "zod";

const productSearchSchema = z.object({});

export const Route = createFileRoute("/products")({
  validateSearch: productSearchSchema,
  component: ProductsScreen,
  head: () => ({
    meta: [
      { title: "Produtos Virais" },
      { name: "description", content: "Mineração de produtos para TikTok Shop." },
    ],
  }),
});
