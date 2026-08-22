const EXCHANGE_URL = "https://www.saldo.mx/Saldos/api/ripplev3/exchangeUSD";

/**
 * Converts a MXN amount to its USD equivalent using Saldo's own exchange
 * endpoint (the same rate used elsewhere on saldo.mx). The peso amount goes
 * in the URL path; response shape is `{ result: "SUCCESS", MXN, USD, EU }`.
 */
export async function convertMxnToUsd(mxnAmount: number): Promise<number> {
  const response = await fetch(`${EXCHANGE_URL}/${mxnAmount}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Exchange rate request failed (${response.status})`);
  }

  const data = await response.json();
  if (data?.result !== "SUCCESS" || typeof data?.USD !== "string") {
    throw new Error("Unexpected exchange rate response");
  }

  return Number(data.USD);
}
