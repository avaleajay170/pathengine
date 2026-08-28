import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MilestoneTracker } from "@/components/MilestoneTracker";
import { makeMilestone, makeNode } from "@/test/factories";

const milestones = [
  makeMilestone("Foundations", [
    makeNode({ id: "a", status: "completed" }),
    makeNode({ id: "b", status: "completed" }),
  ]),
  makeMilestone("Core Skills", [
    makeNode({ id: "c", status: "in-progress" }),
    makeNode({ id: "d", status: "locked" }),
  ]),
  makeMilestone("Capstone", [makeNode({ id: "e", status: "locked" })]),
];

describe("MilestoneTracker", () => {
  it("lists the stages in study order", () => {
    render(<MilestoneTracker milestones={milestones} />);

    const items = screen.getAllByRole("listitem");

    expect(items).toHaveLength(3);
    expect(items[0]?.textContent).toContain("Foundations");
    expect(items[1]?.textContent).toContain("Core Skills");
    expect(items[2]?.textContent).toContain("Capstone");
  });

  it("uses an ordered list, because the stages are a sequence rather than a set", () => {
    render(<MilestoneTracker milestones={milestones} />);

    expect(screen.getByRole("list").tagName).toBe("OL");
  });

  it("counts completed steps per stage rather than across the path", () => {
    render(<MilestoneTracker milestones={milestones} />);

    expect(screen.getByText("2/2 steps · Foundations summary")).toBeTruthy();
    expect(screen.getByText("0/2 steps · Core Skills summary")).toBeTruthy();
    expect(screen.getByText("0/1 steps · Capstone summary")).toBeTruthy();
  });

  it("renders an empty stage without claiming it is finished", () => {
    render(<MilestoneTracker milestones={[makeMilestone("Empty", [])]} />);

    expect(screen.getByText("0/0 steps · Empty summary")).toBeTruthy();
  });

  it("renders nothing but the list when there are no stages", () => {
    render(<MilestoneTracker milestones={[]} />);

    expect(screen.queryAllByRole("listitem")).toEqual([]);
  });
});
