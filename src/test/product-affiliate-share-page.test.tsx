import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductAffiliateSharePage } from "@/mansa/components/dashboard/ProductAffiliateSharePage";

describe("ProductAffiliateSharePage", () => {
  it("affiche le nouveau texte et partage le lien affilié du produit", () => {
    const onBack = vi.fn();
    render(
      <ProductAffiliateSharePage
        productName="Cours photo"
        affiliateUrl="https://mansa.example/affiliate/ABC123"
        onBack={onBack}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Deviens affilié et gagne l’argent sur ta commission.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Lien affilié à copier" })).toHaveValue(
      "https://mansa.example/affiliate/ABC123",
    );
    expect(screen.getByRole("link", { name: "Partager sur WhatsApp" })).toHaveAttribute(
      "href",
      expect.stringContaining(encodeURIComponent("https://mansa.example/affiliate/ABC123")),
    );
    expect(screen.getByRole("button", { name: "Partager le lien affilié" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retour à la fiche produit" }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("affiche le bloc de partage complet sous le titre, avec Reddit et l'historique", async () => {
    render(
      <ProductAffiliateSharePage
        productName="Cours photo"
        affiliateUrl="https://mansa.example/affiliate/ABC123"
        onBack={() => {}}
      />,
    );

    expect(screen.getByRole("link", { name: "Partager sur Reddit" })).toHaveAttribute(
      "href",
      expect.stringContaining(encodeURIComponent("https://mansa.example/affiliate/ABC123")),
    );
    expect(screen.getByRole("link", { name: "Partager sur WhatsApp" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Partager sur X" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Partager sur LinkedIn" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Partager sur Facebook" })).toBeInTheDocument();
    expect(screen.getByText("Ou envoyer un e-mail d’invitation")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Adresse e-mail du destinataire" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Historique des invitations" }));
    expect(screen.getByText(/Aucun parrainage enregistré|Connectez-vous à votre compte/)).toBeInTheDocument();
  });

  it("affiche la raison si la création du lien échoue au lieu de masquer la page", () => {
    render(
      <ProductAffiliateSharePage
        productName="Cours photo"
        linkError="La création de liens affiliés n’est pas encore disponible pour ces offres."
        onBack={() => {}}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "La création de liens affiliés n’est pas encore disponible pour ces offres.",
    );
    expect(screen.queryByRole("textbox", { name: "Lien affilié à copier" })).not.toBeInTheDocument();
  });
});
