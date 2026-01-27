
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

export default function Logo(props: React.HTMLAttributes<HTMLDivElement>) {
  const logoImage = PlaceHolderImages.find(img => img.id === 'xp-coin-icon')?.imageUrl;

  if (logoImage) {
    return (
      <div {...props} className={cn("relative", props.className)}>
        <Image src={logoImage} alt="HeroQuest Logo" layout="fill" objectFit="contain" />
      </div>
    );
  }

  return null;
}
