import type { AffiliateProduct } from "../../services/affiliateService";
import type { LinkPerformance } from "../../services/affiliateEarnings";
import { formatCurrency, type CurrencyCode } from "../../utils/currency";
import { AffiliateTable, affiliateCell } from "./AffiliateTable";

export function PersonalAffiliateRevenue({ performance, products, currency, companyNames = {} }: { performance: LinkPerformance[]; products: AffiliateProduct[]; currency: string; companyNames?: Record<string, string> }) {
  const total = performance.reduce((sum, row) => sum + row.commission, 0);
  return <section className="py-6" aria-labelledby="my-earnings-heading">
    <h2 id="my-earnings-heading" className="text-base font-semibold">Mes gains</h2>
    <p className="mb-6 mt-2 text-2xl font-bold tabular-nums">{formatCurrency(total, currency as CurrencyCode)}</p>
    <AffiliateTable columns={["Entreprise", "Taux conversion", "Clic", "Gains"]} empty={performance.length ? undefined : "Aucun revenu d’affiliation enregistré."}>
      {performance.map((row) => {
        const product = products.find((item) => item.id === row.link.productId);
        return <tr key={row.link.id}>
          <td className={affiliateCell}><span className="font-medium">{product ? companyNames[product.creatorId] || "Entreprise non renseignée" : "Entreprise non renseignée"}</span><span className="mt-1 block text-xs text-muted-foreground">{row.link.productName} · {row.link.commissionRate} %</span></td>
          <td className={affiliateCell}><span aria-label="Taux de conversion non disponible">—</span></td>
          <td className={affiliateCell}><span aria-label="Nombre de clics non disponible">—</span></td>
          <td className={`${affiliateCell} font-medium`}>{formatCurrency(row.commission, currency as CurrencyCode)}</td>
        </tr>;
      })}
    </AffiliateTable>
    <p className="mt-3 text-xs text-muted-foreground">Clics et taux de conversion non disponibles : le suivi des visites n’est pas encore connecté.</p>
  </section>;
}