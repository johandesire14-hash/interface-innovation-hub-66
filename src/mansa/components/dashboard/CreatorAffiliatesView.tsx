import React, { useCallback, useEffect, useMemo, useState } from "react";
import { History, Trophy } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../../context/AuthContext";
import { getAffiliateLinksForCreator, type AffiliateLink } from "../../services/affiliateService";
import { getCreatorAffiliateSales, type AffiliateInvitation } from "../../services/affiliateHistoryService";
import { computeLinkPerformance, summarizeByAffiliate } from "../../services/affiliateEarnings";
import { CurrencyCode, formatCurrency } from "../../utils/currency";
import { getUserFacingErrorMessage } from "../../utils/userFacingError";
import { AffiliateTable, affiliateCell, affiliateTab } from "./AffiliateTable";
import { AffiliateHistory } from "./AffiliateHistory";
import { CreatorAffiliateManagement, type AffiliateManagedOffer } from "./CreatorAffiliateManagement";
import { matchesAffiliateSale, referralAmounts, referralDate, scopedAffiliateData } from "./affiliatePresentation";
import { fetchPublicCreatorProfileIdentity } from "../../services/supabaseProfileService";
import { UserProfileLink } from "../common/UserProfileLink";

interface Props {
  currency?: CurrencyCode | string;
  companyName?: string;
  offers?: readonly AffiliateManagedOffer[];
  onUpdateRate?: (id: string, rate: number) => Promise<void>;
  demo?: { links: AffiliateLink[]; sales: AffiliateInvitation[]; names?: Record<string, string> };
}
const noOffers: readonly AffiliateManagedOffer[] = [];

export const CreatorAffiliatesView: React.FC<Props> = ({ currency = "XOF", companyName, offers = noOffers, onUpdateRate, demo }) => {
  const { user } = useAuth();
  const creatorUid = demo ? "demo-creator" : user?.uid || "";
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [sales, setSales] = useState<AffiliateInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAffiliate, setSelectedAffiliate] = useState<string | null>(null);
  const [profileNames, setProfileNames] = useState<Record<string, string>>({});
  const [months, setMonths] = useState(6);
  const money = (value: number) => formatCurrency(value, currency as CurrencyCode);
  const load = useCallback(async () => {
    setError("");
    if (demo) { setLinks(demo.links); setSales(demo.sales); setLoading(false); return; }
    if (!creatorUid) { setLinks([]); setSales([]); setLoading(false); return; }
    setLoading(true);
    try {
      const [l, s] = await Promise.all([getAffiliateLinksForCreator(creatorUid), getCreatorAffiliateSales(creatorUid)]);
      setLinks(l); setSales(s);
    } catch (e) { setError(getUserFacingErrorMessage(e, "Impossible de charger vos affiliés. Réessayez.")); }
    finally { setLoading(false); }
  }, [creatorUid, demo]);
  useEffect(() => { void load(); }, [load]);
  const scoped = useMemo(() => scopedAffiliateData(links, sales, offers.map((offer) => offer.id)), [links, sales, offers]);
  const performance = useMemo(() => computeLinkPerformance(scoped.links, scoped.sales), [scoped]);
  const affiliateUids = useMemo(() => [...new Set(scoped.links.map((link) => link.affiliateUid))], [scoped.links]);
  const affiliateUidsKey = affiliateUids.join("|");
  useEffect(() => {
    let active = true;
    const loadNames = async () => {
      const entries = await Promise.all(affiliateUids.map(async (uid) => {
        if (demo?.names?.[uid]) return [uid, demo.names[uid]] as const;
        const identity = await fetchPublicCreatorProfileIdentity(uid).catch(() => null);
        const handle = identity?.handle?.trim();
        return [uid, handle ? (handle.startsWith("@") ? handle : `@${handle}`) : identity?.displayName || `Affilié · ${uid.slice(0, 6)}`] as const;
      }));
      if (active) setProfileNames(Object.fromEntries(entries));
    };
    void loadNames();
    return () => { active = false; };
  }, [affiliateUidsKey, demo]);
  const names = useMemo(() => Object.fromEntries(scoped.links.map((link) => [
    link.affiliateUid,
    demo?.names?.[link.affiliateUid] || profileNames[link.affiliateUid] || `Affilié · ${link.affiliateUid.slice(0, 6)}`,
  ])), [scoped.links, demo, profileNames]);
  const affiliates = useMemo(() => summarizeByAffiliate(performance, new Set(offers.map((offer) => offer.id)), names), [performance, offers, names]);
  const totals = affiliates.reduce((t, a) => ({ sales: t.sales + a.sales, revenue: t.revenue + a.revenue, commission: t.commission + a.commission }), { sales: 0, revenue: 0, commission: 0 });
  const chartData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: months }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - months + index + 1, 1);
      const monthSales = scoped.sales.filter((sale) => {
        const soldAt = referralDate(sale.createdAt);
        return sale.status === "converted" && soldAt?.getFullYear() === date.getFullYear() && soldAt?.getMonth() === date.getMonth();
      });
      return { month: new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(date), revenue: monthSales.reduce((sum, sale) => sum + (sale.amount || 0), 0) };
    });
  }, [scoped.sales, months]);
  const selectedLinks = scoped.links.filter((link) => link.affiliateUid === selectedAffiliate);
  const selectedSales = scoped.sales.filter((sale) => selectedLinks.some((link) => matchesAffiliateSale(sale, link)));

  return <main className="min-w-0 pb-16 text-foreground">
    <header className="flex flex-wrap items-start justify-between gap-4 pb-6">
      <div><h1 className="text-xl font-bold">Affiliés{companyName ? ` — ${companyName}` : ""}</h1><p className="mt-1 text-sm text-muted-foreground">Programme d’affiliation de votre entreprise</p></div>
    </header>
    <Tabs defaultValue="dashboard">
      <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-none border-b border-border bg-transparent p-0">
        <TabsTrigger value="dashboard" className={affiliateTab}>Tableau de bord</TabsTrigger>
        <TabsTrigger value="revenue" className={affiliateTab}>Revenu</TabsTrigger>
        <TabsTrigger value="management" className={affiliateTab}>Gestion</TabsTrigger>
      </TabsList>
      {error && <p role="alert" className="my-5 rounded-lg border border-destructive/30 p-4 text-sm text-destructive">{error}</p>}
      {loading && <p role="status" className="py-8 text-sm text-muted-foreground">Chargement de vos affiliés…</p>}
      {!loading && !error && <>
        <TabsContent value="dashboard" className="mt-0 space-y-8 py-6">
          <section aria-labelledby="affiliate-chart-title">
            <div className="flex flex-wrap justify-between gap-4">
              <div><h2 id="affiliate-chart-title" className="text-base font-semibold">Revenus générés par les parrainages</h2><p className="mt-2 text-2xl font-bold tabular-nums">{money(totals.revenue)}</p><p className="mt-1 text-xs text-muted-foreground">{totals.sales} parrainages confirmés · total enregistré</p></div>
              <select aria-label="Période du graphique" value={months} onChange={(event) => setMonths(Number(event.target.value))} className="h-11 rounded-lg border border-input bg-background px-3 text-sm"><option value={6}>6 derniers mois</option><option value={12}>12 derniers mois</option></select>
            </div>
            <div className="mt-6 h-60 w-full" aria-label="Graphique des revenus mensuels">
              <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis width={55} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Tooltip formatter={(value) => [money(Number(value)), "Revenus"]} contentStyle={{ background: "var(--popover)", color: "var(--popover-foreground)", borderColor: "var(--border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.12} strokeWidth={2} isAnimationActive={false} />
              </AreaChart></ResponsiveContainer>
            </div>
            {totals.sales === 0 && <p className="mt-3 text-xs text-muted-foreground">Aucun parrainage confirmé enregistré. Le suivi automatique des ventes n’est pas encore disponible.</p>}
          </section>
          <section aria-labelledby="affiliate-ranking-title">
            <h2 id="affiliate-ranking-title" className="mb-4 flex items-center gap-2 text-base font-semibold"><Trophy className="size-4" />Meilleurs affiliés</h2>
            <AffiliateTable columns={["Utilisateur", "Parrainage", "Récompense"]} empty={affiliates.length ? undefined : "Aucun affilié pour les offres de cette entreprise."}>
              {affiliates.map((affiliate, index) => <tr key={affiliate.affiliateUid} className="hover:bg-muted/40">
                <td className={affiliateCell}>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                    <UserProfileLink userId={affiliate.affiliateUid} className="font-medium">
                      {affiliate.affiliateName}
                    </UserProfileLink>
                    <Button variant="link" className="h-11 px-0 text-xs" onClick={() => setSelectedAffiliate(affiliate.affiliateUid)}>
                      <History className="mr-1 size-3.5" /> Voir l’historique
                    </Button>
                  </div>
                </td>
                <td className={affiliateCell}>{affiliate.sales}</td><td className={`${affiliateCell} font-medium`}>{money(affiliate.revenue)}</td>
              </tr>)}
            </AffiliateTable>
          </section>
        </TabsContent>
        <TabsContent value="revenue" className="mt-0 py-6">
          <div className="mb-6 flex flex-wrap gap-x-10 gap-y-4"><div><p className="text-xs text-muted-foreground">Gagné par l’entreprise</p><p className="mt-1 text-xl font-bold">{money(totals.revenue - totals.commission)}</p></div><div><p className="text-xs text-muted-foreground">Part des affiliés</p><p className="mt-1 text-xl font-bold">{money(totals.commission)}</p></div></div>
          <AffiliateTable columns={["Utilisateur", "Produit", "Gagné", "Part"]} empty={performance.some((row) => row.sales > 0) ? undefined : "Aucun revenu de parrainage enregistré."}>
            {performance.filter((row) => row.sales > 0).map((row) => <tr key={row.link.id}><td className={affiliateCell}><UserProfileLink userId={row.link.affiliateUid}>{names[row.link.affiliateUid]}</UserProfileLink></td><td className={affiliateCell}>{row.link.productName}</td><td className={affiliateCell}>{money(row.revenue - row.commission)}</td><td className={affiliateCell}>{money(row.commission)}<span className="mt-1 block text-xs text-muted-foreground">{row.link.commissionRate} %</span></td></tr>)}
          </AffiliateTable>
          <p className="mt-3 text-xs text-muted-foreground">Gagné : prix des achats moins la part affiliée, avant autres frais éventuels.</p>
        </TabsContent>
      </>}
      <TabsContent value="management"><CreatorAffiliateManagement offers={offers} onUpdateRate={onUpdateRate} /></TabsContent>
    </Tabs>
    <Dialog open={selectedAffiliate !== null} onOpenChange={(open) => { if (!open) setSelectedAffiliate(null); }}>
      <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-lg">
        <DialogHeader><DialogTitle>Parrainages de {selectedAffiliate ? names[selectedAffiliate] : "l’affilié"}</DialogTitle><DialogDescription>Historique des parrainages associés aux offres de cette entreprise.</DialogDescription></DialogHeader>
        <AffiliateHistory sales={selectedSales} links={selectedLinks} currency={currency} />
      </DialogContent>
    </Dialog>
  </main>;
};
