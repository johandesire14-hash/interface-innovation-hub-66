import { collection, getDocs, query, where } from "./firebase";
import { db } from "./firebase";

export interface AffiliateInvitation {
  id: string;
  inviteeName: string;
  inviteeUsername?: string;
  inviteeUid?: string;
  inviteeEmail: string;
  productId: string;
  productName: string;
  status: "pending" | "registered" | "converted" | "cancelled";
  createdAt?: unknown;
  amount?: number;
  currency?: string;
  /** Code of the affiliate link that brought the sale, when recorded. */
  linkCode?: string;
  affiliateUid?: string;
}

export async function getAffiliateInvitationHistory(
  affiliateUid: string,
): Promise<AffiliateInvitation[]> {
  if (!affiliateUid || !db) return [];
  const snapshot = await getDocs(
    query(collection(db, "transactions"), where("creatorId", "==", affiliateUid)),
  );
  return snapshot.docs
    .map((document): AffiliateInvitation | null => {
      const raw = document.data() as Record<string, unknown>;
      const isAffiliateEvent =
        raw["type"] === "affiliate" ||
        typeof raw["referralCode"] === "string" ||
        typeof raw["referralProductId"] === "string";
      if (!isAffiliateEvent) return null;
      const status: AffiliateInvitation["status"] =
        raw["status"] === "failed"
          ? "cancelled"
          : raw["status"] === "pending"
            ? "pending"
            : "converted";
      const amount = Number(raw["amountNumber"] ?? raw["amount"]);
      return {
        id: document.id,
        inviteeName: String(raw["buyerUsername"] || raw["customerUsername"] || raw["inviteeUsername"] || raw["buyerName"] || raw["customerName"] || "Invité sans nom"),
        ...(typeof (raw["buyerUid"] || raw["buyerId"] || raw["customerUid"] || raw["customerId"] || raw["userId"]) === "string"
          ? { inviteeUid: String(raw["buyerUid"] || raw["buyerId"] || raw["customerUid"] || raw["customerId"] || raw["userId"]) }
          : {}),
        ...(typeof (raw["buyerUsername"] || raw["customerUsername"] || raw["inviteeUsername"]) === "string"
          ? { inviteeUsername: String(raw["buyerUsername"] || raw["customerUsername"] || raw["inviteeUsername"]) }
          : {}),
        inviteeEmail: String(raw["buyerEmail"] || raw["customerEmail"] || ""),
        productId: String(raw["productId"] || raw["referralProductId"] || ""),
        productName: String(raw["productName"] || "Produit affilié"),
        status,
        createdAt: raw["timestamp"] || raw["createdAt"],
        ...(Number.isFinite(amount) ? { amount } : {}),
        ...(typeof raw["currency"] === "string" ? { currency: raw["currency"] } : {}),
        ...(typeof raw["referralCode"] === "string" ? { linkCode: raw["referralCode"] } : {}),
        ...(typeof raw["affiliateUid"] === "string" ? { affiliateUid: raw["affiliateUid"] } : {}),
      } as AffiliateInvitation;
    })
    .filter((item): item is AffiliateInvitation => item !== null)
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

/** Sales on the creator's own products that came through an affiliate link. */
export async function getCreatorAffiliateSales(creatorUid: string): Promise<AffiliateInvitation[]> {
  if (!creatorUid || !db) return [];
  const snapshot = await getDocs(
    query(collection(db, "transactions"), where("sellerId", "==", creatorUid)),
  );
  return snapshot.docs.flatMap((document): AffiliateInvitation[] => {
    const raw = document.data() as Record<string, unknown>;
    if (typeof raw["referralCode"] !== "string") return [];
    const amount = Number(raw["amountNumber"] ?? raw["amount"]);
    return [
      {
        id: document.id,
        inviteeName: String(raw["buyerUsername"] || raw["customerUsername"] || raw["inviteeUsername"] || raw["buyerName"] || raw["customerName"] || "Client"),
        ...(typeof (raw["buyerUid"] || raw["buyerId"] || raw["customerUid"] || raw["customerId"] || raw["userId"]) === "string"
          ? { inviteeUid: String(raw["buyerUid"] || raw["buyerId"] || raw["customerUid"] || raw["customerId"] || raw["userId"]) }
          : {}),
        ...(typeof (raw["buyerUsername"] || raw["customerUsername"] || raw["inviteeUsername"]) === "string"
          ? { inviteeUsername: String(raw["buyerUsername"] || raw["customerUsername"] || raw["inviteeUsername"]) }
          : {}),
        inviteeEmail: String(raw["buyerEmail"] || raw["customerEmail"] || ""),
        productId: String(raw["productId"] || raw["referralProductId"] || ""),
        productName: String(raw["productName"] || "Produit"),
        status: raw["status"] === "failed" ? "cancelled" : raw["status"] === "pending" ? "pending" : "converted",
        createdAt: raw["timestamp"] || raw["createdAt"],
        linkCode: raw["referralCode"],
        ...(typeof raw["affiliateUid"] === "string" ? { affiliateUid: raw["affiliateUid"] } : {}),
        ...(Number.isFinite(amount) ? { amount } : {}),
      },
    ];
  });
}
