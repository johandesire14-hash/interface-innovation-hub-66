import { useState } from "react";
import { profileImageSource } from "../../utils/profileImage";

export function ProfileImage({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  const image = profileImageSource(src);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  if (!image || image === failedSource) return null;
  return <img src={image} alt={alt} className={className} onError={() => setFailedSource(image)} />;
}