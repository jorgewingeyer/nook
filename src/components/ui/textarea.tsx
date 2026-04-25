import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-sand/70 bg-warm-white px-3 py-2 text-base text-charcoal shadow-xs transition-[color,box-shadow] outline-none placeholder:text-warm-gray/60 focus-visible:border-gold/60 focus-visible:ring-[3px] focus-visible:ring-gold/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-elara-error aria-invalid:ring-elara-error/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
