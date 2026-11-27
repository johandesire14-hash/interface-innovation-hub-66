import React, { useState } from "react";
import {
  Check,
  ChevronLeft,
  Copy,
  Facebook,
  Gift,
  Linkedin,
  Mail,
  MessageCircle,
  Send,
  Share2,
  X,
} from "lucide-react";

interface ProductAffiliateSharePageProps {
  productName: string;
  productImage?: string;
  affiliateUrl?: string;
  isCreatingLink?: boolean;
  linkError?: string;
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
  onBack,
}) => {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");

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

  const message = affiliateUrl ? shareMessage(productName, affiliateUrl) : "";
  const encodedMessage = encodeURIComponent(message);
  const encodedUrl = encodeURIComponent(affiliateUrl || "");
  const emailHref = email.trim()
    ? `mailto:${encodeURIComponent(email.trim())}?subject=${encodeURIComponent(`Découvre ${productName}`)}&body=${encodeURIComponent(message)}`
    : `mailto:?subject=${encodeURIComponent(`Découvre ${productName}`)}&body=${encodeURIComponent(message)}`;

  return (
    <main
      className="fixed inset-0 z-[60] flex min-h-dvh flex-col overflow-y-auto bg-[#191919] text-white"
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

        {affiliateUrl ? (
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
        ) : (
          <p
            role={linkError ? "alert" : "status"}
            className={`mt-7 w-full rounded-xl border p-4 text-sm ${linkError ? "border-rose-400/20 bg-rose-400/10 text-rose-200" : "border-white/10 bg-white/[0.04] text-zinc-300"}`}
          >
            {linkError || (isCreatingLink ? "Création de votre lien affilié…" : "Le lien affilié n’est pas disponible pour ce produit.")}
          </p>
        )}

        {affiliateUrl && (
          <>
        <div className="mt-8 w-full">
          <button
            type="button"
            onClick={() => void share()}
            className="flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 text-lg font-semibold text-[#191919] transition hover:bg-zinc-200"
          >
            <Share2 className="size-6" /> Partager le lien affilié
          </button>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6" aria-label="Partager sur les réseaux sociaux">
            <a
              aria-label="Partager sur WhatsApp"
              title="WhatsApp"
              href={`https://wa.me/?text=${encodedMessage}`}
              target="_blank"
              rel="noreferrer"
              className="flex size-16 items-center justify-center rounded-full bg-white/[0.06] text-emerald-400 hover:bg-white/10"
            >
              <MessageCircle className="size-7" />
            </a>
            <a
              aria-label="Partager sur X"
              title="X"
              href={`https://twitter.com/intent/tweet?text=${encodedMessage}`}
              target="_blank"
              rel="noreferrer"
              className="flex size-16 items-center justify-center rounded-full bg-white/[0.06] text-white hover:bg-white/10"
            >
              <span className="text-2xl font-medium">𝕏</span>
            </a>
            <a
              aria-label="Partager sur LinkedIn"
              title="LinkedIn"
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
              target="_blank"
              rel="noreferrer"
              className="flex size-16 items-center justify-center rounded-full bg-white/[0.06] text-sky-400 hover:bg-white/10"
            >
              <Linkedin className="size-7" />
            </a>
            <a
              aria-label="Partager sur Facebook"
              title="Facebook"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank"
              rel="noreferrer"
              className="flex size-16 items-center justify-center rounded-full bg-white/[0.06] text-blue-400 hover:bg-white/10"
            >
              <Facebook className="size-7" />
            </a>
          </div>
        </div>

        <div className="my-8 flex w-full items-center gap-4 text-sm text-zinc-500">
          <span className="h-px flex-1 bg-white/10" />
          Ou envoyer un e-mail d’invitation
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <form
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
            className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#191919] hover:bg-zinc-200"
          >
            <Send className="size-4" /> Envoyer
          </button>
        </form>
          </>
        )}
      </section>
    </main>
  );
};
