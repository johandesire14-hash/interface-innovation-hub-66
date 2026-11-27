import type { AffiliateLink } from "../../services/affiliateService";
import type { AffiliateInvitation } from "../../services/affiliateHistoryService";

/** A sale without a code needs both product and affiliate IDs to be attributable. */
export function matchesAffiliateSale(sale: AffiliateInvitation, link: AffiliateLink) {
  return (!sale.affiliateUid || sale.affiliateUid === link.affiliateUid) &&
    (sale.linkCode ? sale.linkCode === link.code :
      sale.productId === link.productId && sale.affiliateUid === link.affiliateUid);
}

export function scopedAffiliateData(links: AffiliateLink[], sales: AffiliateInvitation[], productIds: readonly string[]) {
  const ids = new Set(productIds);
  const scopedLinks = links.filter((link) => ids.has(link.productId));
  return { links: scopedLinks, sales: sales.filter((sale) => scopedLinks.some((link) => matchesAffiliateSale(sale, link))) };
}

export function referralAmounts(sale: AffiliateInvitation, link: AffiliateLink) {
  if (sale.status !== "converted" || sale.amount === undefined) return null;
  const commission = Math.round(sale.amount * link.commissionRate) / 100;
  return { price: sale.amount, commission, creatorGain: Math.round((sale.amount - commission) * 100) / 100 };
}

export function referralDate(value: unknown): Date | null {
  if (!value) return null;
  const date = typeof value === "object" && "toDate" in value
    ? (value as { toDate: () => Date }).toDate() : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function referralDateLabel(value: unknown) {
  const date = referralDate(value);
  return date ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(date) : "Date non renseignée";
}