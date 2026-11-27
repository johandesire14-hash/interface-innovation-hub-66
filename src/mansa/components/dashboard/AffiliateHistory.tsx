import type { AffiliateInvitation } from "../../services/affiliateHistoryService";
import type { AffiliateLink } from "../../services/affiliateService";
import { formatCurrency, type CurrencyCode } from "../../utils/currency";
import { AffiliateTable, affiliateCell } from "./AffiliateTable";
import { UserProfileLink } from "../common/UserProfileLink";
import { matchesAffiliateSale, referralAmounts, referralDateLabel } from "./affiliatePresentation";

export function AffiliateHistory({ sales, links, currency }: { sales: AffiliateInvitation[]; links: AffiliateLink[]; currency: string }) {
  return <AffiliateTable columns={["Utilisateur parrainé", "Offre / prix", "Commission", "Date / statut"]} empty={sales.length ? undefined : "Aucun parrainage enregistré."}>
    {sales.map((sale) => {
      const link = links.find((item) => matchesAffiliateSale(sale, item));
      const amounts = link ? referralAmounts(sale, link) : null;
      const money = (amount: number) => formatCurrency(amount, (sale.currency || currency) as CurrencyCode);
      const status = { converted: "Achat confirmé", pending: "En attente", registered: "Inscription", cancelled: "Annulé" }[sale.status];
      return <tr key={sale.id}>
        <td className={affiliateCell}>
          <UserProfileLink userId={sale.inviteeUid} className="font-medium">
            {sale.inviteeUsername || sale.inviteeName}
          </UserProfileLink>
        </td>
        <td className={affiliateCell}>{sale.productName}<span className="mt-1 block text-muted-foreground">{sale.amount === undefined ? "Prix non renseigné" : money(sale.amount)}</span></td>
        <td className={affiliateCell}>{amounts ? money(amounts.commission) : "—"}</td>
        <td className={affiliateCell}>{referralDateLabel(sale.createdAt)}<span className="mt-1 block text-xs text-muted-foreground">{status}</span></td>
      </tr>;
    })}
  </AffiliateTable>;
}
