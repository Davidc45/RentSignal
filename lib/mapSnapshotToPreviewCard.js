function badgeClassFromLabel(label) {
  const s = (label || "").toLowerCase();
  if (s.includes("not recommended") || s.includes("not affordable")) return "bad";
  if (s.includes("stretch")) return "stretch";
  if (s.includes("affordable")) return "good";
  return "stretch";
}

function trendClassFromLabel(label) {
  const s = (label || "").toLowerCase();
  if (s.includes("rise") || s.includes("up")) return "up";
  if (s.includes("fall") || s.includes("down")) return "down";
  return "flat";
}

function formatUsd(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return `$${Math.round(Number(n)).toLocaleString("en-US")}`;
}

/**
 * Maps an API marketSnapshot into props for the landing preview card layout.
 */
export function snapshotToPreviewCard(snapshot, { highlight = false } = {}) {
  const ratioPct =
    snapshot.affordabilityRatio != null
      ? Math.round(Number(snapshot.affordabilityRatio) * 100)
      : null;
  const ruleParts = [];
  if (ratioPct != null) ruleParts.push(`${ratioPct}% of income`);
  if (snapshot.affordableMonthlyRent != null) {
    ruleParts.push(`affordable up to ${formatUsd(snapshot.affordableMonthlyRent)}/mo`);
  }

  const tc = trendClassFromLabel(snapshot.trendLabel);
  const rawTrend = snapshot.trendLabel || "—";
  let trend = rawTrend;
  if (tc === "up") trend = `↑ ${rawTrend}`;
  else if (tc === "down") trend = `↓ ${rawTrend}`;
  else if (tc === "flat") trend = `→ ${rawTrend}`;

  return {
    city: snapshot.city || snapshot.citySlug || "—",
    badge: snapshot.affordabilityLabel || "—",
    badgeClass: badgeClassFromLabel(snapshot.affordabilityLabel),
    rent: formatUsd(snapshot.medianRent),
    trend,
    trendClass: tc,
    rule: ruleParts.join(" · ") || "—",
    highlight,
  };
}
