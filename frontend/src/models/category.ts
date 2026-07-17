/** Categoria de produtos minerados. `slug`/`sortOrder` são gerenciados pelo backend;
 *  `system` marca categorias padrão que não podem ser excluídas. */
export type Category = {
  id?: number;
  name: string;
  slug?: string;
  sortOrder?: number;
  system: boolean;
};
