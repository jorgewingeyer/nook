import { cn } from "@/lib/utils";

interface NookLogoProps {
  variant?: "light" | "dark";
  width?: number;
  className?: string;
}

export function NookLogo({ variant = "light", width = 160, className }: NookLogoProps) {
  const height = Math.round((width / 260) * 60);

  const archStroke = variant === "dark" ? "#D4AF7A" : "#B8945F";
  const wordmarkFill = variant === "dark" ? "#F5EDE0" : "#2E1F0E";
  const dotFill = variant === "dark" ? "#D4AF7A" : "#B8945F";
  const homeFill = variant === "dark" ? "#D4AF7A" : "#7A6A58";
  const homeOpacity = variant === "dark" ? "0.7" : "1";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 260 60"
      fill="none"
      width={width}
      height={height}
      aria-label="Nook Home"
      role="img"
      className={cn(className)}
    >
      <g transform="translate(0, 6)">
        <path
          d="M6 46 L6 22 Q6 4 21 4 Q36 4 36 22 L36 46"
          stroke={archStroke}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M13 46 L13 24 Q13 12 21 12 Q29 12 29 24 L29 46"
          stroke={archStroke}
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.45"
        />
        <line
          x1="0"
          y1="46"
          x2="42"
          y2="46"
          stroke={archStroke}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>
      <text
        x="54"
        y="44"
        fontFamily="Cormorant Garamond, Georgia, serif"
        fontSize="38"
        fontWeight="400"
        letterSpacing="2"
        fill={wordmarkFill}
      >
        nook
      </text>
      <circle cx="208" cy="44" r="2.5" fill={dotFill} opacity="0.7" />
      <text
        x="216"
        y="44"
        fontFamily="Jost, Helvetica Neue, sans-serif"
        fontSize="10"
        fontWeight="500"
        letterSpacing="5"
        fill={homeFill}
        opacity={homeOpacity}
      >
        HOME
      </text>
    </svg>
  );
}
