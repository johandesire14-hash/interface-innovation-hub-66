import { createFileRoute } from "@tanstack/react-router";
import { AffiliatesView } from "@/mansa/components/dashboard/AffiliatesView";
import type { AffiliateLink, AffiliateProduct } from "@/mansa/services/affiliateService";
import type { AffiliateInvitation } from "@/mansa/services/affiliateHistoryService";

const products: AffiliateProduct[] = [
  { id: "p1", creatorId: "c1", name: "Formation : vendre sur WhatsApp Business", description: "12 modules vidéo pour transformer vos discussions en ventes.", category: "Formation", status: "active", affiliateCommissionRate: 30, pricingAmount: 41.32, currency: "XOF" },
  { id: "p2", creatorId: "c2", name: "Pack de 50 modèles Canva pour boutiques", description: "Visuels prêts à publier pour Instagram et Facebook.", category: "Design", status: "active", affiliateCommissionRate: 40, pricingAmount: 16.36, currency: "XOF" },
  { id: "p3", creatorId: "c3", name: "Ebook : lancer son e-commerce en Afrique de l’Ouest", description: "Guide pratique : paiement mobile, livraison, marketing.", category: "Ebook", status: "active", affiliateCommissionRate: 25, pricingAmount: 12.4, currency: "XOF" },
  { id: "p4", creatorId: "c4", name: "Coaching mensuel – Créateurs de contenu", description: "Un appel de groupe par semaine et une communauté privée.", category: "Abonnement", status: "active", affiliateCommissionRate: 20, pricingAmount: 24.79, currency: "XOF" },
];
const links: AffiliateLink[] = [
  { id: "l1", affiliateUid: "demo-affiliate", productId: "p1", productName: products[0]!.name, commissionRate: 30, code: "AMINA30", createdAt: "2026-10-02" },
  { id: "l2", affiliateUid: "demo-affiliate", productId: "p2", productName: products[1]!.name, commissionRate: 40, code: "AMINACANVA", createdAt: "2026-10-18" },
];
const invitations: AffiliateInvitation[] = [
  { id: "i1", inviteeName: "Koffi Mensah", inviteeEmail: "koffi.mensah@gmail.com", productId: "p1", productName: products[0]!.name, status: "converted", createdAt: "2026-11-20", amount: 41.32, currency: "XOF" },
  { id: "i2", inviteeName: "Fatou Diop", inviteeEmail: "fatou.diop@yahoo.fr", productId: "p2", productName: products[1]!.name, status: "registered", createdAt: "2026-11-18" },
  { id: "i3", inviteeName: "Yao Kouassi", inviteeEmail: "yao.k@outlook.com", productId: "p1", productName: products[0]!.name, status: "pending", createdAt: "2026-11-15" },
];
const demo = { products, links, invitations };

export const Route = createFileRoute("/apercu-affilies")({
  head: () => ({
    meta: [
      { title: "Aperçu – Page affiliés | afhub" },
      { name: "description", content: "Exemple de la page affiliés avec des programmes et des liens fictifs." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Aperçu – Page affiliés | afhub" },
      { property: "og:description", content: "Exemple de la page affiliés avec des données fictives." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <p className="mb-4 rounded-lg border border-border bg-muted px-4 py-2 text-sm text-muted-foreground">
        Aperçu avec des données fictives — rien n’est enregistré.
      </p>
      <AffiliatesView demo={demo} />
    </main>
  ),
});
