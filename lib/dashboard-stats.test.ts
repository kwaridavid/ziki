import { describe, expect, it } from "vitest";
import { buildDashboardStats } from "./dashboard-stats";
import { parseBugListFilters } from "./issue-list-filters";

const input = {
  points: 1200,
  reportedByMe: 7,
  assignedToMe: 4,
  weekPoints: 300,
  createdLast30: 2,
  highPriorityAssigned: 1,
  resolvedAssigned: 1,
};

const byLabel = (label: string) => {
  const stat = buildDashboardStats(input).find((item) => item.label === label);
  if (!stat) throw new Error(`no ${label} card`);
  return stat;
};

const whereOf = (href: string) =>
  parseBugListFilters({
    params: Object.fromEntries(new URLSearchParams(href.split("?")[1])),
    userId: "u1",
    canSeeDeleted: false,
  }).where;

describe("dashboard stat cards (#591)", () => {
  it("shows the counted value on each card", () => {
    expect(byLabel("Created by me").value).toBe("7");
    expect(byLabel("Assigned to me").value).toBe("4");
    expect(byLabel("Resolved issues").value).toBe("1");
  });

  it("opens the same workspace-wide set each total was counted from", () => {
    // The counts have no status or project predicate, so their links must not
    // add one — a bare ?mine= would land on the Inbox and hide resolved work.
    expect(byLabel("Created by me").href).toBe(
      "/issues?mine=created&status=all&project=all&duplicates=show",
    );
    expect(byLabel("Assigned to me").href).toBe(
      "/issues?mine=assigned&status=all&project=all&duplicates=show",
    );
    expect(whereOf(byLabel("Created by me").href)).toEqual({
      isDeleted: false,
      reporterId: "u1",
    });
    expect(whereOf(byLabel("Assigned to me").href)).toEqual({
      isDeleted: false,
      assigneeId: "u1",
    });
  });

  it("opens exactly the finished issues the resolved card counts", () => {
    expect(byLabel("Resolved issues").href).toBe(
      "/issues?mine=assigned&status=finished&project=all&duplicates=show",
    );
    expect(whereOf(byLabel("Resolved issues").href)).toEqual({
      isDeleted: false,
      assigneeId: "u1",
      status: { in: ["resolved", "closed"] },
    });
  });

  it("shows zero without dividing by zero", () => {
    const empty = buildDashboardStats({
      ...input,
      reportedByMe: 0,
      assignedToMe: 0,
      resolvedAssigned: 0,
    });
    expect(empty.map((stat) => stat.value)).toEqual(["1200", "0", "0", "0"]);
    expect(empty.find((stat) => stat.label === "Resolved issues")?.chip).toBe("0%");
  });
});
