import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ href = "/", className, priority = false }: BrandLogoProps) {
  return (
    <Link href={href} aria-label="Sprint Desk Home" className={cn("inline-flex items-center justify-center bg-transparent", className)}>
      <Image
        src="/sprint-desk.png"
        alt="Sprint Desk"
        width={100}
        height={100}
        className="h-[100px] w-[100px] bg-transparent object-contain"
        priority={priority}
      />
    </Link>
  );
}
