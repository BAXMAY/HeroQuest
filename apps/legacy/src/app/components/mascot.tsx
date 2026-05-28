import type { SVGProps } from "react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Mascot(props: SVGProps<SVGSVGElement>) {
  const logoImage = PlaceHolderImages.find(img => img.id === 'xp-coin-icon')?.imageUrl;

  if (logoImage) {
    // Using a div wrapper to apply SVG props like className, width, height
    return (
      <div className={props.className}>
        <Image src={logoImage} alt="HeroQuest Mascot" width={24} height={24} />
      </div>
    );
  }

  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M6.71,1.5c-3.3,2.2-3.3,6.6,0,8.8l2.12,1.41L6.71,13.2A4.41,4.41,0,0,0,3.5,16.5a4.41,4.41,0,0,0,3.21,3.21A4.41,4.41,0,0,0,10,22a4.5,4.5,0,0,0,4.24-3.3l1.42-2.12,1.41,2.12A4.5,4.5,0,0,0,21.31,22a4.41,4.41,0,0,0,3.21-3.21,4.41,4.41,0,0,0-1.28-4.29l-2.12-1.42,2.12-1.42c3.3-2.2,3.3-6.6,0-8.8C19.82-.7,15.38-.7,13.17,1.5L12,2.7,10.83,1.5C8.62-.7,4.18-.7,1.93,1.5,1.93,1.5,3.41-.7,6.71,1.5ZM12,8.5a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,12,8.5Z" />
    </svg>
  );
}
