import type { OverviewStat } from "@/components/overview/stat-cards";
import { FINISHED_STATUS_FILTER } from "@/lib/issue-state";
import { mineIssuesHref } from "@/lib/issue-list-filters";
import { formatPoints, TARGET_POINTS } from "@/lib/points/rules";

/**
 * The four Overview summary cards. Each count is workspace-wide and has no
 * status filter, so every link opens the same set the card counted (#591) —
 * `mineIssuesHref` adds the explicit All / every-project / duplicates-included
 * view instead of leaving the Issues page to its Inbox default.
 */
export type DashboardStatsInput = {
  points: number;
  reportedByMe: number;
  assignedToMe: number;
  weekPoints: number;
  createdLast30: number;
  highPriorityAssigned: number;
  resolvedAssigned: number;
};

export function buildDashboardStats({
  points,
  reportedByMe,
  assignedToMe,
  weekPoints,
  createdLast30,
  highPriorityAssigned,
  resolvedAssigned,
}: DashboardStatsInput): OverviewStat[] {
  const toGo = Math.max(0, TARGET_POINTS - weekPoints);
  const resolvedPct =
    assignedToMe === 0
      ? 0
      : Math.min(100, Math.round((resolvedAssigned / assignedToMe) * 100));

  return [
    {
      label: "Points",
      value: formatPoints(points),
      href: "/workers",
      chip: weekPoints >= TARGET_POINTS ? "Goal met" : `${formatPoints(toGo)} to go`,
      chipTone: weekPoints >= TARGET_POINTS ? "ok" : "tint",
      note: "500 required this week",
    },
    {
      label: "Created by me",
      value: String(reportedByMe),
      href: mineIssuesHref("created"),
      chip: createdLast30 > 0 ? `+${createdLast30}` : "0",
      chipTone: createdLast30 > 0 ? "ok" : "chip",
      note: "in the last 30 days",
    },
    {
      label: "Assigned to me",
      value: String(assignedToMe),
      href: mineIssuesHref("assigned"),
      chip: String(highPriorityAssigned),
      chipTone: highPriorityAssigned > 0 ? "bad" : "chip",
      note: "high priority",
    },
    {
      label: "Resolved issues",
      value: String(resolvedAssigned),
      href: mineIssuesHref("assigned", FINISHED_STATUS_FILTER),
      chip: `${resolvedPct}%`,
      chipTone: "chip",
      note: "of issues assigned to me",
    },
  ];
}
