import Image from "next/image";

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/saldo-logo.png"
      alt="Saldo"
      width={size}
      height={size}
      className="rounded-xl"
      priority
    />
  );
}
