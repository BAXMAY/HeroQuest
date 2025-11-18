import type { SVGProps } from "react";

export function PawPrintIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="4" r="2" />
      <circle cx="18" cy="8" r="2" />
      <circle cx="4" cy="8" r="2" />
      <path d="M9 10c0 2.5-2 4.5-5 4.5" />
      <path d="M14 10c0 2.5 2 4.5 5 4.5" />
      <path d="M20 18.9c-2-2-2-5.5-2-5.5" />
      <path d="M4 18.9c2-2 2-5.5 2-5.5" />
      <path d="M12 21c-2 0-4-1.5-4-3.5 0-2 2-4 4-4s4 2 4 4c0 2-2 3.5-4 3.5Z" />
    </svg>
  );
}

export function HandsHelpingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 12h2a2 2 0 1 0 0-4h-3c-1.1 0-2 .9-2 2v1a2 2 0 0 0 2 2Z" />
      <path d="M14 11.5V14a2 2 0 0 1-2 2H9" />
      <path d="M3 14h2a2 2 0 1 1 0 4h-3c-1.1 0-2-.9-2-2v-1a2 2 0 0 1 2-2Z" />
      <path d="M7 16.5V14a2 2 0 0 0-2-2h-1" />
      <path d="M15.5 6H14a2 2 0 0 0-2 2v1.5" />
      <path d="M18 6h1a2 2 0 0 1 2 2v2" />
      <path d="M22 12v1.5" />
    </svg>
  );
}
