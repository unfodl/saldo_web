import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "outline" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-amber text-forest hover:bg-amber-dark disabled:bg-amber/40 disabled:text-forest/50",
  outline:
    "border border-forest/20 text-forest bg-transparent hover:bg-forest/5 disabled:opacity-40",
  ghost: "text-forest hover:bg-forest/5 disabled:opacity-40",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`h-13 rounded-xl px-6 font-medium text-base transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
