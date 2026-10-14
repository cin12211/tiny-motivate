import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

// Duolingo-style 3D buttons: bold uppercase label, solid fill, darker bottom "lip"
// that collapses on press.
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-black uppercase tracking-wider transition-[transform,box-shadow,background-color] duration-100 select-none cursor-pointer active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:bg-line disabled:text-muted-foreground disabled:shadow-[0_4px_0_var(--m-line-dark)] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 [&_.iconify:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-3 focus-visible:ring-sky/50",
  {
    variants: {
      variant: {
        default:
          "bg-green text-white shadow-[0_4px_0_var(--m-green-dark)] hover:brightness-105",
        secondary:
          "bg-sky text-white shadow-[0_4px_0_var(--m-sky-dark)] hover:brightness-105",
        gold:
          "bg-yellow text-[#5a3d00] shadow-[0_4px_0_var(--m-yellow-dark)] hover:brightness-105",
        destructive:
          "bg-red text-white shadow-[0_4px_0_var(--m-red-dark)] hover:brightness-105",
        outline:
          "border-2 border-line bg-surface text-sky shadow-[0_4px_0_var(--m-line)] hover:bg-field",
        soft:
          "border-2 border-green bg-green-soft text-green-dark shadow-[0_4px_0_var(--m-green)]",
        ghost:
          "text-muted-foreground hover:bg-field active:translate-y-0 normal-case tracking-normal font-bold",
        link: "text-sky underline-offset-4 hover:underline active:translate-y-0",
      },
      size: {
        "default": "h-12 px-5 text-sm",
        "xs": "h-7 gap-1 rounded-lg px-2 text-[11px] [&_svg:not([class*='size-'])]:size-3.5 [&_.iconify:not([class*='size-'])]:size-3.5",
        "sm": "h-10 rounded-xl px-4 text-xs",
        "lg": "h-14 px-6 text-base",
        "icon": "size-11 rounded-xl",
        "icon-xs": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3.5 [&_.iconify:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9 rounded-xl",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)
export type ButtonVariants = VariantProps<typeof buttonVariants>
