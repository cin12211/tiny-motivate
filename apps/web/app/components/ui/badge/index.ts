import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Badge } from "./Badge.vue"

// "Chip" from the Mini design: small mono label in a 5px box.
export const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-[5px] border font-medium overflow-hidden [&_.iconify]:size-4",
  {
    variants: {
      variant: {
        default: "h-6 border-line bg-surface px-[9px] text-xs text-indigo",
        solid: "h-7 border-indigo bg-primary px-[11px] text-[13px] text-primary-foreground shadow-glow",
        outline: "h-6 border-indigo bg-transparent px-[9px] text-xs text-indigo",
      },
      size: {
        default: "",
        sm: "h-5 px-[7px] text-[11px] shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)
export type BadgeVariants = VariantProps<typeof badgeVariants>
