import { describe, expect, it } from "vitest";
import { profileImageSource } from "../mansa/utils/profileImage";

describe("Images choisies par l’utilisateur uniquement", () => {
  it("ne fournit aucune image par défaut sans photo ou bannière", () => {
    expect(profileImageSource(undefined)).toBeNull();
    expect(profileImageSource(null)).toBeNull();
    expect(profileImageSource("")).toBeNull();
    expect(profileImageSource("   ")).toBeNull();
  });
  it("préserve exactement une image ajoutée par l’utilisateur", () => {
    expect(profileImageSource("https://storage.test/my-banner.jpg")).toBe("https://storage.test/my-banner.jpg");
    expect(profileImageSource("blob:my-profile-photo")).toBe("blob:my-profile-photo");
  });
});