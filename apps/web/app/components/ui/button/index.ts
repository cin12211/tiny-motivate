import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

// Mini style: flat 7px buttons, single indigo accent with a soft glow,
// lowercase mono labels (no uppercase / 3D lip).
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-[transform,background-color,border-color,opacity] duration-100 select-none cursor-pointer active:scale-[.98] disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[18px] [&_.iconify:not([class*='size-'])]:size-[18px] shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-glow-lg",
        outline: "border border-line bg-surface text-indigo hover:border-indigo",
        dashed: "border border-dashed border-muted-foreground text-indigo hover:bg-surface",
        ghost: "text-muted-foreground hover:bg-surface hover:text-indigo",
        /** Handwritten "done" button from the design (Caveat font). */
        hand: "bg-primary text-primary-foreground font-hand text-[22px] font-medium shadow-glow",
        /** Outlined state, e.g. "đã xong". */
        soft: "border border-indigo bg-transparent text-indigo",
        link: "text-indigo underline decoration-dotted underline-offset-[3px] active:scale-100",
      },
      size: {
        "default": "h-[46px] px-5 text-[13.5px]",
        "xs": "h-7 gap-1 rounded-md px-2 text-[11.5px] [&_.iconify:not([class*='size-'])]:size-3.5",
        "sm": "h-[34px] rounded-md px-3 text-[12.5px] [&_.iconify:not([class*='size-'])]:size-4",
        "lg": "h-[52px] px-6 text-sm",
        "icon": "size-9 rounded-lg",
        "icon-sm": "size-[30px] rounded-md [&_.iconify:not([class*='size-'])]:size-[17px]",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)
export type ButtonVariants = VariantProps<typeof buttonVariants>
