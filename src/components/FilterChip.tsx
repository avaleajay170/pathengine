import { Badge } from "@/components/ui/badge";

/**
 * A selectable filter pill.
 *
 * `Badge` renders a span, so the button role, the tab stop and the key handling live here once
 * instead of at every call site. `aria-pressed` is what tells a screen reader which filters are
 * currently on — without it the selected chip is only distinguishable by colour.
 */
export function FilterChip({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Badge
      variant={selected ? "default" : "outline"}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      className="cursor-pointer px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      {label}
    </Badge>
  );
}
