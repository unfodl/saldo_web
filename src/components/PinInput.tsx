import { useId } from "react";

export function PinInput({
  value,
  onChange,
  name,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  name: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex flex-col items-center gap-2">
      <span className="text-sm text-ink-3">PIN de 4 dígitos</span>
      <input
        id={id}
        name={name}
        type="password"
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
          onChange(digits);
        }}
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="••••"
        className="h-16 w-40 rounded-xl bg-white text-center text-3xl tracking-[0.6em] text-forest outline-none ring-1 ring-forest/10 focus:ring-2 focus:ring-amber disabled:opacity-50"
      />
    </label>
  );
}
