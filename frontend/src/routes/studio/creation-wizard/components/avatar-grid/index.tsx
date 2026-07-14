import { SelectableCard } from "@/components";
import { avatars } from "@/services/data";

export function AvatarGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {avatars.slice(0, 6).map((avatar, i) => (
        <SelectableCard
          key={avatar.id}
          selected={i === 0}
          title={avatar.name}
          description={avatar.gender}
          media={
            <img
              src={avatar.image}
              alt={avatar.name}
              className="mb-4 aspect-[4/3] w-full rounded-[14px] object-cover"
            />
          }
        />
      ))}
    </div>
  );
}
