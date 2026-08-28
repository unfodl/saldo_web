// Shape of one row from bluto's POST /transaction/list — confirmed against a
// real response (see api/transactionApi.ts). Status/type are left as `string`
// rather than a union since only "SALDO_SUCCESS" / "SERVICE" have been
// observed so far and the full set of values isn't documented.
export type TransactionMetadata = {
  company?: string;
  reference?: string;
  phone?: string;
  amount?: string;
  amountService?: string;
  currency?: string;
  sendEmail?: string;
  dv?: string;
};

export type TransactionCrossmintResponse = {
  transactionId?: string;
  hash?: string;
  explorerLink?: string;
};

export type TransactionCrossmintInfo = {
  request?: { walletAddress?: string; amount?: string };
  response?: TransactionCrossmintResponse;
  reportedAt?: string;
};

export type TransactionSaldoResponse = {
  result?: string;
  paid?: string;
  currency?: string;
  amount?: string;
};

export type TransactionSaldoInfo = {
  request?: { mail?: string; company?: string; phone?: string; amount?: string };
  response?: TransactionSaldoResponse;
  error?: string;
  calledAt?: string;
};

export type Transaction = {
  _id: string;
  transactionId: string;
  email: string;
  walletAddress: string;
  chain: string;
  amount: string;
  amountUsdc: string;
  amountMxn?: string;
  currency: string;
  type: string;
  status: string;
  company?: {
    code: string;
    name: string;
  };
  metadata?: TransactionMetadata;
  crossmint?: TransactionCrossmintInfo;
  saldo?: TransactionSaldoInfo;
  createdAt: string;
  updatedAt: string;
};
