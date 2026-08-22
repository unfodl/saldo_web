export function Logo({ size = 40 }: { size?: number }) {
  return (
    <img
      src="/saldo-logo.png"
      alt="Saldo"
      width={size}
      height={size}
      className="rounded-xl"
    />
  );
}
