import { InputHTMLAttributes, forwardRef } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, className = "", id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <label htmlFor={inputId} className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink-3">{label}</span>
        <input
          ref={ref}
          id={inputId}
          className={`h-13 rounded-xl bg-white px-4 text-base text-forest placeholder:text-ink-4/60 outline-none ring-1 ring-forest/10 focus:ring-2 focus:ring-amber ${className}`}
          {...props}
        />
      </label>
    );
  },
);
TextField.displayName = "TextField";
