import { SectionTitle, ProductCard } from "@/components";
import { products } from "@/data/mock";

export function ProductStep({
  selected,
  setSelected,
}: {
  selected: number;
  setSelected: (value: number) => void;
}) {
  return (
    <div>
      <SectionTitle title="Escolha o produto" description="91 produtos validados disponíveis" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 8).map((p, i) => (
          <ProductCard
            key={p.id}
            product={p}
            selected={selected === i}
            onClick={() => setSelected(i)}
          />
        ))}
      </div>
    </div>
  );
}
