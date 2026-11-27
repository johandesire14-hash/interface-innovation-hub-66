import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Facebook,
  Gift,
  History,
  Linkedin,
  Mail,
  Send,
  Share2,
  Users,
  X,
} from "lucide-react";

import {
  getAffiliateInvitationHistory,
  type AffiliateInvitation,
} from "../../services/affiliateHistoryService";
import { getAffiliateLinksForUser, type AffiliateLink } from "../../services/affiliateService";
import { matchesAffiliateSale, referralDateLabel } from "./affiliatePresentation";
import { getUserFacingErrorMessage } from "../../utils/userFacingError";

const REDDIT_PATH =
  "M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z";

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-6">
    <path d={REDDIT_PATH} />
  </svg>
);

const WHATSAPP_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-6">
    <path d={WHATSAPP_PATH} />
  </svg>
);

const invitationStatusLabels: Record<AffiliateInvitation["status"], string> = {
  pending: "En attente",
  registered: "Inscription",
  converted: "Achat confirmé",
  cancelled: "Annulé",
};

interface ProductAffiliateSharePageProps {
  productName: string;
  productImage?: string;
  affiliateUrl?: string;
  isCreatingLink?: boolean;
  linkError?: string;
  /** Signed-in user id, used to load that person's own invitation history. */
  affiliateUid?: string;
  currency?: string;
  onBack: () => void;
}

const shareMessage = (productName: string, affiliateUrl: string) =>
  `Découvre ${productName}. Deviens affilié et gagne l’argent sur ta commission : ${affiliateUrl}`;

export const ProductAffiliateSharePage: React.FC<ProductAffiliateSharePageProps> = ({
  productName,
  productImage,
  affiliateUrl,
  isCreatingLink = false,
  linkError = "",
  affiliateUid = "",
  currency = "XOF",
  onBack,
}) => {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [invitations, setInvitations] = useState<AffiliateInvitation[]>([]);
  const [links, setLinks] = useState<AffiliateLink[]>([]);

  const copyLink = async () => {
    if (!affiliateUrl) return;
    try {
      await navigator.clipboard.writeText(affiliateUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copiez votre lien affilié :", affiliateUrl);
    }
  };

  const share = async () => {
    if (!affiliateUrl) return;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: productName,
          text: "Deviens affilié et gagne l’argent sur ta commission.",
          url: affiliateUrl,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await copyLink();
  };

  const toggleHistory = async () => {
    const next = !historyOpen;
    setHistoryOpen(next);
    if (!next || historyLoaded) return;
    if (!affiliateUid) return;
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const [sales, ownLinks] = await Promise.all([
        getAffiliateInvitationHistory(affiliateUid),
        getAffiliateLinksForUser(affiliateUid),
      ]);
      const mine = ownLinks.filter((link) => link.affiliateUid === affiliateUid);
      setLinks(mine);
      setInvitations(sales.filter((sale) => mine.some((link) => matchesAffiliateSale(sale, link))));
      setHistoryLoaded(true);
    } catch (error) {
      console.error("Affiliate invitation history load failed:", error);
      setHistoryError(
        getUserFacingErrorMessage(
          error,
          "Impossible de charger l’historique des invitations. Réessayez.",
        ),
      );
      setInvitations([]);
      setLinks([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const message = affiliateUrl ? shareMessage(productName, affiliateUrl) : "";
  const encodedMessage = encodeURIComponent(message);
  const encodedUrl = encodeURIComponent(affiliateUrl || "");
  const emailHref = email.trim()
    ? `mailto:${encodeURIComponent(email.trim())}?subject=${encodeURIComponent(`Découvre ${productName}`)}&body=${encodeURIComponent(message)}`
    : `mailto:?subject=${encodeURIComponent(`Découvre ${productName}`)}&body=${encodeURIComponent(message)}`;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <main
      className="fixed inset-0 z-[200] flex h-dvh shrink-0 flex-col overflow-y-auto overscroll-contain bg-[#191919] text-white"
      aria-label="Partager le lien affilié"
    >
      <header className="relative flex min-h-20 shrink-0 items-center justify-center border-b border-white/[0.06] px-16">
        <button
          type="button"
          onClick={onBack}
          aria-label="Retour à la fiche produit"
          className="absolute left-5 flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
        >
          <ChevronLeft className="size-6" />
        </button>
        <h1 className="text-center text-lg font-semibold sm:text-2xl">Partager avec un ami</h1>
        <button
          type="button"
          onClick={onBack}
          aria-label="Fermer le partage"
          className="absolute right-5 flex size-10 items-center justify-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white"
        >
          <X className="size-5" />
        </button>
      </header>

      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-6 pb-10 pt-10 text-center sm:px-10 sm:pt-14">
        <div className="flex h-44 w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl sm:h-52">
          {productImage ? (
            <img src={productImage} alt={productName} className="size-full object-contain" />
          ) : (
            <div className="flex size-36 items-center justify-center rounded-full bg-white/[0.04] text-emerald-300">
              <Gift className="size-20" strokeWidth={1.2} />
            </div>
          )}
        </div>

        <h2 className="mt-8 text-3xl font-bold leading-tight sm:text-4xl">
          Deviens affilié et gagne l’argent sur ta commission.
        </h2>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-zinc-400">
          Partage ton lien personnel pour faire découvrir « {productName} » et toucher la commission
          prévue par le créateur, selon les conditions du programme.
        </p>

        {!affiliateUrl && (
          <p
            role={linkError ? "alert" : "status"}
            className={`mt-7 w-full rounded-xl border p-4 text-sm ${linkError ? "border-rose-400/20 bg-rose-400/10 text-rose-200" : "border-white/10 bg-white/[0.04] text-zinc-300"}`}
          >
            {linkError || (isCreatingLink ? "Création de votre lien affilié…" : "Le lien affilié n’est pas disponible pour ce produit.")}
          </p>
        )}

        {(
          <>
            <div className={`mt-8 w-full ${affiliateUrl ? "" : "pointer-events-none opacity-50"}`} aria-disabled={!affiliateUrl}>
              <button
                type="button"
                onClick={() => void share()}
                className="flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 text-lg font-semibold text-[#191919] transition hover:bg-zinc-200"
              >
                <Share2 className="size-6" /> Partager le lien affilié
              </button>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-5" aria-label="Partager sur les réseaux sociaux">
                <a
                  aria-label="Partager sur WhatsApp"
                  title="WhatsApp"
                  href={`https://wa.me/?text=${encodedMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex size-14 items-center justify-center rounded-full bg-white/[0.06] text-emerald-400 hover:bg-white/10"
                >
                  <WhatsAppIcon />
                </a>
                <a
                  aria-label="Partager sur X"
                  title="X"
                  href={`https://twitter.com/intent/tweet?text=${encodedMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex size-14 items-center justify-center rounded-full bg-white/[0.06] text-white hover:bg-white/10"
                >
                  <span className="text-xl font-medium">𝕏</span>
                </a>
                <a
                  aria-label="Partager sur LinkedIn"
                  title="LinkedIn"
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex size-14 items-center justify-center rounded-full bg-white/[0.06] text-sky-400 hover:bg-white/10"
                >
                  <Linkedin className="size-6" />
                </a>
                <a
                  aria-label="Partager sur Reddit"
                  title="Reddit"
                  href={`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(productName)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex size-14 items-center justify-center rounded-full bg-white/[0.06] text-orange-500 hover:bg-white/10"
                >
                  <RedditIcon />
                </a>
                <a
                  aria-label="Partager sur Facebook"
                  title="Facebook"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex size-14 items-center justify-center rounded-full bg-white/[0.06] text-blue-400 hover:bg-white/10"
                >
                  <Facebook className="size-6" />
                </a>
              </div>
            </div>

            <div className="my-8 flex w-full items-center gap-4 text-sm text-zinc-500">
              <span className="h-px flex-1 bg-white/10" />
              Ou envoyer un e-mail d’invitation
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <form
              aria-disabled={!affiliateUrl}
              className="flex min-h-16 w-full items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-2"
              onSubmit={(event) => {
                event.preventDefault();
                window.location.href = emailHref;
              }}
            >
              <Mail className="ml-3 size-5 shrink-0 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Entrer l’adresse e-mail"
                aria-label="Adresse e-mail du destinataire"
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
              />
              <button
                type="submit"
                disabled={!affiliateUrl}
                className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#191919] hover:bg-zinc-200"
              >
                <Send className="size-4" /> Envoyer
              </button>
            </form>

            <button
              type="button"
              onClick={() => void toggleHistory()}
              aria-expanded={historyOpen}
              aria-controls="affiliate-share-history"
              className="mt-6 inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-zinc-300 hover:bg-white/[0.06] hover:text-white"
            >
              <History className="size-4" /> Historique des invitations
              <ChevronRight className={`size-4 transition-transform ${historyOpen ? "rotate-90" : ""}`} />
            </button>

            {historyOpen && (
              <div
                id="affiliate-share-history"
                className="mt-4 w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-left"
              >
                {!affiliateUid ? (
                  <p className="text-sm text-zinc-400">
                    Connectez-vous à votre compte pour consulter l’historique des invitations.
                  </p>
                ) : historyLoading ? (
                  <p role="status" className="text-sm text-zinc-400">
                    Chargement de l’historique…
                  </p>
                ) : historyError ? (
                  <p role="alert" className="text-sm text-rose-200">
                    {historyError}
                  </p>
                ) : invitations.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-white/[0.04] text-zinc-500">
                      <Users className="size-6" />
                    </div>
                    <p className="text-sm text-zinc-400">
                      Aucun parrainage enregistré pour le moment. Les invitations apparaîtront ici
                      dès qu’une personne inscrite via votre lien sera enregistrée.
                    </p>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {invitations.map((sale) => {
                      const link = links.find((item) => matchesAffiliateSale(sale, item));
                      return (
                        <li
                          key={sale.id}
                          className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3"
                        >
                          <p className="text-sm font-semibold text-white">
                            {sale.inviteeUsername || sale.inviteeName}
                          </p>
                          <p className="mt-1 text-xs text-zinc-400">
                            {sale.productName} · {invitationStatusLabels[sale.status]} ·{" "}
                            {referralDateLabel(sale.createdAt)}
                          </p>
                          {link && (
                            <p className="mt-1 text-xs text-zinc-500">
                              Lien {link.code} · {link.commissionRate} % de commission
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {affiliateUrl && (
            <div className="mt-7 flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2">
              <input
                readOnly
                value={affiliateUrl}
                aria-label="Lien affilié à copier"
                className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-sm text-white outline-none"
                onFocus={(event) => event.currentTarget.select()}
              />
              <button
                type="button"
                onClick={() => void copyLink()}
                className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#191919] hover:bg-zinc-200"
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copié" : "Copier"}
              </button>
            </div>
            )}
          </>
        )}
      </section>
    </main>
    ,
    document.body,
  );
};
