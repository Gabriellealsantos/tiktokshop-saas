import { useState } from "react";
import { SectionTitle } from "@/components";
import { OptionImageCard } from "../option-image-card";

export function Options({ title, items }: { title: string; items: string[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <div>
      <SectionTitle title={title} />
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" role="radiogroup">
        {items.map((item, i) => (
          <OptionImageCard
            key={item}
            title={item}
            selected={i === selectedIndex}
            onClick={() => setSelectedIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
