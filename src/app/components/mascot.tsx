import type { SVGProps } from "react";

export default function Mascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.4 15.2c.9-2.4 2.8-4.2 5.1-4.8" />
      <path d="M9.4 4.5c.3-1.2 1.4-2.2 2.8-2.3 2.3-.2 4.3 1.5 4.3 3.8 0 1.2-.5 2.3-1.3 3.2" />
      <path d="M20.2 18.3c.4-1.3.2-2.8-.5-3.9-1-1.4-2.8-2.3-4.6-2.3-1.2 0-2.3.4-3.3 1-.8.5-1.5 1.2-2 2.1" />
      <path d="M6.3 16.5c-1.3-1-2.4-2.5-2.7-4.2-.3-2.2.8-4.3 2.7-5.3 1-.5 2.1-.7 3.2-.5" />
      <path d="M2.6 18.2c.4 1.2 1.5 2.2 2.8 2.3 2.3.2 4.3-1.5 4.3-3.8 0-.6-.1-1.2-.4-1.7" />
      <path d="M9.9 19.3c-1 .3-1.9.9-2.6 1.8-2.2 2.5-1.6 6.2 1.2 7.7 2.9 1.5 6.3.5 8.5-2 1.9-2.2 2.2-5.3.8-7.7" />
      <path d="M16.9 12.5c.3 1.3.1 2.8-.7 3.9-1.1 1.5-3.1 2.4-5.1 2.4" />
    </svg>
  );
}
