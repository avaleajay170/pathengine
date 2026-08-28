import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FilterChip } from "@/components/FilterChip";

describe("FilterChip", () => {
  it("exposes itself as a button so assistive tech does not read it as text", () => {
    render(<FilterChip label="Data Science" selected={false} onSelect={vi.fn()} />);

    const chip = screen.getByRole("button", { name: "Data Science" });

    expect(chip.getAttribute("aria-pressed")).toBe("false");
    expect(chip.getAttribute("tabindex")).toBe("0");
  });

  it("announces the selected state, which colour alone cannot", () => {
    render(<FilterChip label="Design" selected onSelect={vi.fn()} />);

    const chip = screen.getByRole("button", { name: "Design" });

    expect(chip.getAttribute("aria-pressed")).toBe("true");
  });

  it("selects on click", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<FilterChip label="Business" selected={false} onSelect={onSelect} />);

    await user.click(screen.getByRole("button", { name: "Business" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it.each(["{Enter}", " "])("selects on %s, like a real button", async (key) => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<FilterChip label="AI / ML" selected={false} onSelect={onSelect} />);

    screen.getByRole("button", { name: "AI / ML" }).focus();
    await user.keyboard(key);

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("ignores other keys", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<FilterChip label="Design" selected={false} onSelect={onSelect} />);

    screen.getByRole("button", { name: "Design" }).focus();
    await user.keyboard("x");

    expect(onSelect).not.toHaveBeenCalled();
  });
});
