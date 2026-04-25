import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-sand/70 bg-warm-white px-3 py-1 text-base text-charcoal shadow-xs transition-[color,box-shadow] outline-none",
        "placeholder:text-warm-gray/60",
        "selection:bg-gold/20 selection:text-espresso",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-charcoal",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-gold/60 focus-visible:ring-[3px] focus-visible:ring-gold/20",
        "aria-invalid:border-elara-error aria-invalid:ring-elara-error/20",
        "md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
