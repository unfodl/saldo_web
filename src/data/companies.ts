import type { Company, CompanyCategory } from "../types/payment";

export const CATEGORY_LABEL: Record<CompanyCategory, string> = {
  SERVICIOS: "Servicios",
  RECARGAS: "Recargas",
};

// Placeholder Stellar receiving addresses (correct length/format, not real
// accounts) — ported from the old Next.js app's prisma/seed.ts. bluto has no
// endpoint for this list or these addresses; replace with each company's
// real USDC-receiving Stellar address before go-live.
function placeholderAddress(tag: string): string {
  return `G${tag.toUpperCase().padEnd(55, "0")}`.slice(0, 56);
}

export const COMPANIES: Company[] = [
  { id: "cfe", name: "CFE", logoKey: "cfe", category: "SERVICIOS", group: null, receivingAddress: placeholderAddress("cfe") },
  { id: "telmex", name: "Telmex", logoKey: "telmex", category: "SERVICIOS", group: null, receivingAddress: placeholderAddress("telmex") },
  { id: "sky", name: "Sky", logoKey: "sky", category: "SERVICIOS", group: null, receivingAddress: placeholderAddress("sky") },
  { id: "infonavit", name: "Infonavit", logoKey: "infonavit", category: "SERVICIOS", group: null, receivingAddress: placeholderAddress("infonavit") },
  { id: "dish", name: "Dish", logoKey: "dish", category: "SERVICIOS", group: "Compañías de Cable", receivingAddress: placeholderAddress("dish") },
  { id: "izzi", name: "Izzi", logoKey: "izzi", category: "SERVICIOS", group: "Compañías de Cable", receivingAddress: placeholderAddress("izzi") },
  { id: "megacable", name: "Megacable", logoKey: "megacable", category: "SERVICIOS", group: "Compañías de Cable", receivingAddress: placeholderAddress("megacable") },
  { id: "att", name: "AT&T", logoKey: "att", category: "RECARGAS", group: null, receivingAddress: placeholderAddress("att") },
];
