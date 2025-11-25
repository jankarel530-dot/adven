import type { SVGProps } from "react";

export function ChristmasTreeIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="m12 14-4 4h8l-4-4" />
      <path d="M12 10v4" />
      <path d="M12 3v2" />
      <path d="m19 12-2-2" />
      <path d="m5 12 2-2" />
      <path d="m19 5-2 2" />
      <path d="m5 19 2-2" />
    </svg>
  );
}

export function OrnamentIcon(props: SVGProps<SVGSVGElement>) {
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
        <rect x="10" y="2" width="4" height="4" rx="1" />
        <path d="M12 6v2" />
        <circle cx="12" cy="15" r="5" />
        <path d="M12 15h.01" />
    </svg>
  );
}
