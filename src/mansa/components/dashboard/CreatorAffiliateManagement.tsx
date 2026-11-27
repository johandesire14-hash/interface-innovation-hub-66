import { useEffect, useState } from "react";
import { Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AffiliateTable, affiliateCell } from "./AffiliateTable";

export interface AffiliateManagedOffer {
  id: string;
  name: string;
  rate?: number;
}

export function CreatorAffiliateManagement({
  offers,
  onUpdateRate,
}: {
  offers: readonly AffiliateManagedOffer[];
  onUpdateRate?: (id: string, rate: number) => Promise<void>;
}) {
  const [instructions, setInstructions] = useState("");
  const [rateDrafts, setRateDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; message: string; error: boolean } | null>(null);

  useEffect(() => {
    setRateDrafts((current) => {
      const next = { ...current };
      let changed = false;
      for (const offer of offers) {
        if (!(offer.id in next)) {
          next[offer.id] = offer.rate === undefined ? "" : String(offer.rate);
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [offers]);

  const saveRate = async (offer: AffiliateManagedOffer) => {
    if (!onUpdateRate || savingId) return;
    const rawRate = rateDrafts[offer.id]?.trim() ?? "";
    const rate = Number(rawRate);
    if (!rawRate || !Number.isFinite(rate) || rate < 0 || rate > 100) {
      setFeedback({ id: offer.id, message: "Saisissez un taux entre 0 et 100 %.", error: true });
      return;
    }

    setSavingId(offer.id);
    setFeedback(null);
    try {
      await onUpdateRate(offer.id, rate);
      setRateDrafts((current) => ({ ...current, [offer.id]: String(rate) }));
      setFeedback({ id: offer.id, message: "Commission enregistrée.", error: false });
    } catch (error) {
      setFeedback({
        id: offer.id,
        message: error instanceof Error ? error.message : "Impossible d’enregistrer la commission.",
        error: true,
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-10 py-6">
      <section aria-labelledby="affiliate-instructions-title">
        <h2 id="affiliate-instructions-title" className="flex items-center gap-2 text-base font-semibold">
          Instructions
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ajoute des instructions claires pour guider les affiliés dans la promotion de ton offre.
        </p>
        <label htmlFor="affiliate-instructions" className="sr-only">
          Instructions pour les affiliés
        </label>
        <textarea
          id="affiliate-instructions"
          value={instructions}
          onChange={(event) => setInstructions(event.target.value)}
          rows={5}
          placeholder="Messages à partager, arguments clés, pratiques à éviter…"
          className="mt-4 w-full resize-y rounded-lg border border-input bg-background p-4 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="mt-2 text-xs text-muted-foreground" role="status">
          Brouillon non publié — l’enregistrement des instructions n’est pas encore disponible.
        </p>
      </section>

      <section aria-labelledby="affiliate-commissions-title">
        <h2 id="affiliate-commissions-title" className="mb-2 text-base font-semibold">
          Commission
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Modifie le taux de chaque produit directement ici. Un taux de 0 % désactive son programme d’affiliation.
        </p>
        <AffiliateTable
          columns={["Offre", "Statut", "Commission sur le produit"]}
          empty={offers.length ? undefined : "Aucune offre dans cette entreprise."}
        >
          {offers.map((offer) => {
            const isSaving = savingId === offer.id;
            const isEnabled = Number(rateDrafts[offer.id]) > 0;
            return (
              <tr key={offer.id}>
                <td className={`${affiliateCell} font-medium`}>{offer.name}</td>
                <td className={affiliateCell}>
                  <span className={isEnabled ? "text-success-foreground" : "text-muted-foreground"}>
                    {rateDrafts[offer.id] === undefined || rateDrafts[offer.id] === ""
                      ? "Non configuré"
                      : isEnabled
                        ? "Activé"
                        : "Désactivé"}
                  </span>
                </td>
                <td className={affiliateCell}>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="sr-only" htmlFor={`affiliate-rate-${offer.id}`}>
                      Commission de {offer.name}, en pourcentage
                    </label>
                    <div className="flex min-h-11 items-center rounded-lg border border-input bg-background px-3">
                      <input
                        id={`affiliate-rate-${offer.id}`}
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        inputMode="decimal"
                        value={rateDrafts[offer.id] ?? ""}
                        onChange={(event) => {
                          setRateDrafts((current) => ({ ...current, [offer.id]: event.target.value }));
                          setFeedback((current) => (current?.id === offer.id ? null : current));
                        }}
                        disabled={!onUpdateRate || isSaving}
                        placeholder="—"
                        className="w-20 bg-transparent text-sm tabular-nums outline-none disabled:opacity-60"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11 gap-2"
                      onClick={() => void saveRate(offer)}
                      disabled={!onUpdateRate || isSaving}
                    >
                      {feedback?.id === offer.id && !feedback.error ? <Check /> : <Save />}
                      {isSaving ? "Enregistrement…" : "Enregistrer"}
                    </Button>
                  </div>
                  {feedback?.id === offer.id && (
                    <p className={`mt-2 text-xs ${feedback.error ? "text-destructive" : "text-success-foreground"}`} role={feedback.error ? "alert" : "status"}>
                      {feedback.message}
                    </p>
                  )}
                </td>
              </tr>
            );
          })}
        </AffiliateTable>
      </section>
    </div>
  );
}
