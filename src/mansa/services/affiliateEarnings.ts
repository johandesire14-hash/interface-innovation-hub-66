import type { AffiliateLink } from "./affiliateService";
import type { AffiliateInvitation } from "./affiliateHistoryService";

/** Shared between both Affiliates pages: links and the confirmed sales attached to them. */
export interface LinkPerformance {
  link: AffiliateLink;
  sales: number;
  revenue: number;
  commission: number;
}

export function computeLinkPerformance(
  links: AffiliateLink[],
  sales: AffiliateInvitation[],
): LinkPerformance[] {
  return links.map((link) => {
    const matched = sales.filter(
      (sale) =>
        sale.status === "converted" &&
        (sale.linkCode ? sale.linkCode === link.code : sale.productId === link.productId) &&
        (!sale.affiliateUid || sale.affiliateUid === link.affiliateUid),
    );
    const revenue = matched.reduce((sum, sale) => sum + (sale.amount ?? 0), 0);
    return {
      link,
      sales: matched.length,
      revenue,
      commission: Math.round(((revenue * link.commissionRate) / 100) * 100) / 100,
    };
  });
}

export interface AffiliateSummary {
  affiliateUid: string;
  affiliateName: string;
  links: number;
  sales: number;
  revenue: number;
  commission: number;
}

/** Creator side: one row per affiliate, only for links on this creator's products. */
export function summarizeByAffiliate(
  performance: LinkPerformance[],
  creatorProductIds: Set<string>,
  names: Record<string, string> = {},
): AffiliateSummary[] {
  const map = new Map<string, AffiliateSummary>();
  for (const row of performance) {
    if (!creatorProductIds.has(row.link.productId)) continue;
    const id = row.link.affiliateUid;
    const current = map.get(id) ?? {
      affiliateUid: id,
      affiliateName: names[id] || "Affilié",
      links: 0,
      sales: 0,
      revenue: 0,
      commission: 0,
    };
    current.links += 1;
    current.sales += row.sales;
    current.revenue += row.revenue;
    current.commission += row.commission;
    map.set(id, current);
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue);
}
