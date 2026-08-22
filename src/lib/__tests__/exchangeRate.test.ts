import { afterEach, describe, expect, it, vi } from "vitest";
import { convertMxnToUsd } from "@/lib/exchangeRate";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("convertMxnToUsd", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses the USD field from a successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ result: "SUCCESS", MXN: "500.50", USD: "29.41", EU: "1.73" })),
    );

    const usd = await convertMxnToUsd(500.5);
    expect(usd).toBe(29.41);
  });

  it("includes the peso amount in the request URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ result: "SUCCESS", MXN: "100", USD: "5.88" }));
    vi.stubGlobal("fetch", fetchMock);

    await convertMxnToUsd(100);
    expect(fetchMock.mock.calls[0][0]).toContain("/exchangeUSD/100");
  });

  it("throws when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 500)));
    await expect(convertMxnToUsd(100)).rejects.toThrow();
  });

  it("throws when the response body doesn't match the expected shape", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ result: "ERROR" })));
    await expect(convertMxnToUsd(100)).rejects.toThrow();
  });
});
