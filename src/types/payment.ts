export type CompanyCategory = "SERVICIOS" | "RECARGAS";

export type Company = {
  id: string;
  name: string;
  logoKey: string;
  category: CompanyCategory;
  group: string | null;
  receivingAddress: string;
};

export type PaymentStatus = "CONFIRMED" | "FAILED";

export type PaymentRecord = {
  id: string;
  companyId: string;
  companyName: string;
  companyLogoKey: string;
  reference: string;
  amount: string;
  status: PaymentStatus;
  txHash?: string;
  failureReason?: string;
  createdAt: string;
};
