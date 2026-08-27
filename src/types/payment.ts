export type CompanyCategory = "SERVICIOS" | "RECARGAS";

export type Company = {
  id: string;
  name: string;
  logoKey: string;
  category: CompanyCategory;
  group: string | null;
  receivingAddress: string;
};

