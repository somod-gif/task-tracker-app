import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandSpinnerProps = {
  size?: number;
  className?: string;
};

export function BrandSpinner({ size = 64, className }: BrandSpinnerProps) {
  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      <Image
        src="/sprint-desk.png"
        alt="SprintDesk loading"
        width={size}
        height={size}
        className="animate-spin object-contain"
        priority
      />
    </div>
  );
}
