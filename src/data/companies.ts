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

// logoKey points at /public/logos/{logoKey}.png. Only a handful of these
// files exist today (cfe, dish, infonavit, izzi, megacable, sky, telcel,
// telmex) — the rest reuse the company id as logoKey and will 404 until
// real logo assets are added.
export const COMPANIES: Company[] = [
  // AirTime carriers and fixed-denomination top-ups. Codes reuse the same
  // numbering as other RECARGAS/SERVICIOS entries below (e.g. "1", "8") —
  // per the business, these are a separate enum namespace and the
  // duplication across groups is expected.
  { id: "telcel", code: "1", name: "Telcel", logoKey: "telcel", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("telcel") },
  { id: "movistar", code: "2", name: "Movistar", logoKey: "movistar", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("movistar") },
  { id: "iusacell", code: "3", name: "Iusacell", logoKey: "iusacell", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("iusacell") },
  { id: "unefon", code: "4", name: "Unefon", logoKey: "unefon", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("unefon") },
  { id: "nextel", code: "5", name: "Nextel", logoKey: "nextel", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("nextel") },
  { id: "virgin", code: "6", name: "Virgin Mobile", logoKey: "virgin", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("virgin") },
  { id: "internet20", code: "7", name: "Internet $20", logoKey: "internet20", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("internet20") },
  { id: "internet30", code: "8", name: "Internet $30", logoKey: "internet30", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("internet30") },
  { id: "internet50", code: "9", name: "Internet $50", logoKey: "internet50", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("internet50") },
  { id: "internet200", code: "10", name: "Internet $200", logoKey: "internet200", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("internet200") },
  { id: "internet500", code: "11", name: "Internet $500", logoKey: "internet500", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("internet500") },
  { id: "internet100", code: "19", name: "Internet $100", logoKey: "internet100", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("internet100") },
  { id: "internet150", code: "20", name: "Internet $150", logoKey: "internet150", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("internet150") },
  { id: "internet300", code: "21", name: "Internet $300", logoKey: "internet300", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("internet300") },
  { id: "internettelcel", code: "25", name: "Internet Telcel", logoKey: "internettelcel", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("internettelcel") },
  { id: "flashmobile", code: "25", name: "Flash Mobile", logoKey: "flashmobile", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("flashmobile") },
  { id: "oui", code: "26", name: "OUI", logoKey: "oui", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("oui") },
  { id: "freedom", code: "27", name: "Freedom", logoKey: "freedom", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("freedom") },
  { id: "compartcarga", code: "28", name: "Compartcarga", logoKey: "compartcarga", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("compartcarga") },
  { id: "mimovil", code: "29", name: "Mi Movil", logoKey: "mimovil", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("mimovil") },
  { id: "abib", code: "30", name: "Abib", logoKey: "abib", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("abib") },
  { id: "newww", code: "31", name: "Newww", logoKey: "newww", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("newww") },
  { id: "bait", code: "32", name: "Bait", logoKey: "bait", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("bait") },
  { id: "yobi", code: "33", name: "Yobi", logoKey: "yobi", category: "RECARGAS", group: "airTime", receivingAddress: placeholderAddress("yobi") },

  // Codes confirmed against bluto's company enum. Category split (RECARGAS
  // vs SERVICIOS) as specified by the business, not inferred from the
  // company names.
  { id: "cfe", code: "1", name: "CFE", logoKey: "cfe", category: "RECARGAS", group: null, receivingAddress: placeholderAddress("cfe") },
  { id: "infonavit", code: "2", name: "Infonavit", logoKey: "infonavit", category: "RECARGAS", group: null, receivingAddress: placeholderAddress("infonavit") },
  { id: "telmex", code: "3", name: "Telmex", logoKey: "telmex", category: "RECARGAS", group: "Telecomunicaciones", receivingAddress: placeholderAddress("telmex") },
  { id: "axtel", code: "4", name: "Axtel", logoKey: "axtel", category: "RECARGAS", group: "Telecomunicaciones", receivingAddress: placeholderAddress("axtel") },
  { id: "sky", code: "5", name: "Sky", logoKey: "sky", category: "RECARGAS", group: "Compañías de Cable", receivingAddress: placeholderAddress("sky") },
  { id: "megacable", code: "6", name: "Megacable", logoKey: "megacable", category: "RECARGAS", group: "Compañías de Cable", receivingAddress: placeholderAddress("megacable") },
  { id: "gasnatural", code: "8", name: "Gas Natural", logoKey: "gasnatural", category: "RECARGAS", group: "Compañías de Gas", receivingAddress: placeholderAddress("gasnatural") },
  { id: "telnor", code: "9", name: "Telnor", logoKey: "telnor", category: "RECARGAS", group: "Telecomunicaciones", receivingAddress: placeholderAddress("telnor") },
  { id: "maxcom", code: "10", name: "Maxcom", logoKey: "maxcom", category: "RECARGAS", group: "Telecomunicaciones", receivingAddress: placeholderAddress("maxcom") },
  { id: "ecogas", code: "11", name: "Ecogas", logoKey: "ecogas", category: "RECARGAS", group: "Compañías de Gas", receivingAddress: placeholderAddress("ecogas") },
  { id: "tesoreriagdf", code: "12", name: "Tesorería GDF", logoKey: "tesoreriagdf", category: "RECARGAS", group: null, receivingAddress: placeholderAddress("tesoreriagdf") },
  { id: "dish", code: "13", name: "Dish", logoKey: "dish", category: "RECARGAS", group: "Compañías de Cable", receivingAddress: placeholderAddress("dish") },

  { id: "aguakan", code: "14", name: "Aguakan", logoKey: "aguakan", category: "SERVICIOS", group: "Organismos de Agua", receivingAddress: placeholderAddress("aguakan") },
  { id: "sencorp_h2soft", code: "15", name: "Sencorp H2Soft", logoKey: "sencorp_h2soft", category: "SERVICIOS", group: "Organismos de Agua", receivingAddress: placeholderAddress("sencorp_h2soft") },
  { id: "sadm_monterrey", code: "16", name: "SADM Monterrey", logoKey: "sadm_monterrey", category: "SERVICIOS", group: "Organismos de Agua", receivingAddress: placeholderAddress("sadm_monterrey") },
  { id: "jumapa_celaya", code: "17", name: "Jumapa Celaya", logoKey: "jumapa_celaya", category: "SERVICIOS", group: "Organismos de Agua", receivingAddress: placeholderAddress("jumapa_celaya") },
  { id: "siapa_guadalajara", code: "18", name: "Siapa Guadalajara", logoKey: "siapa_guadalajara", category: "SERVICIOS", group: "Organismos de Agua", receivingAddress: placeholderAddress("siapa_guadalajara") },
  { id: "cmapas_salamanca", code: "19", name: "Cmapas Salamanca", logoKey: "cmapas_salamanca", category: "SERVICIOS", group: "Organismos de Agua", receivingAddress: placeholderAddress("cmapas_salamanca") },
  { id: "amd_durango", code: "20", name: "AMD Durango", logoKey: "amd_durango", category: "SERVICIOS", group: "Organismos de Agua", receivingAddress: placeholderAddress("amd_durango") },
  { id: "comapa_nuevolaredo", code: "21", name: "Comapa Nuevo Laredo", logoKey: "comapa_nuevolaredo", category: "SERVICIOS", group: "Organismos de Agua", receivingAddress: placeholderAddress("comapa_nuevolaredo") },
  { id: "interapas_sanluis", code: "22", name: "Interapas San Luis", logoKey: "interapas_sanluis", category: "SERVICIOS", group: "Organismos de Agua", receivingAddress: placeholderAddress("interapas_sanluis") },
  { id: "jmas_chihuahua", code: "23", name: "Jmas Chihuahua", logoKey: "jmas_chihuahua", category: "SERVICIOS", group: "Organismos de Agua", receivingAddress: placeholderAddress("jmas_chihuahua") },
  { id: "jad_matamoros", code: "24", name: "Jad Matamoros", logoKey: "jad_matamoros", category: "SERVICIOS", group: "Organismos de Agua", receivingAddress: placeholderAddress("jad_matamoros") },
  { id: "agua_saltillo", code: "25", name: "Agua Saltillo", logoKey: "agua_saltillo", category: "SERVICIOS", group: "Organismos de Agua", receivingAddress: placeholderAddress("agua_saltillo") },
  { id: "compa_tamaulipas", code: "26", name: "Compañía Tamaulipas", logoKey: "compa_tamaulipas", category: "SERVICIOS", group: "Organismos de Agua", receivingAddress: placeholderAddress("compa_tamaulipas") },
  { id: "maxcom_diestel", code: "27", name: "Maxcom Diestel", logoKey: "maxcom_diestel", category: "SERVICIOS", group: "Telecomunicaciones", receivingAddress: placeholderAddress("maxcom_diestel") },
  { id: "telmex_diestel", code: "28", name: "Telmex Diestel", logoKey: "telmex_diestel", category: "SERVICIOS", group: "Telecomunicaciones", receivingAddress: placeholderAddress("telmex_diestel") },
  { id: "telnor_bc", code: "29", name: "Telnor BC", logoKey: "telnor_bc", category: "SERVICIOS", group: "Telecomunicaciones", receivingAddress: placeholderAddress("telnor_bc") },
  { id: "multimedios_monterrey", code: "30", name: "Multimedios Monterrey", logoKey: "multimedios_monterrey", category: "SERVICIOS", group: "Compañías de Cable", receivingAddress: placeholderAddress("multimedios_monterrey") },
  { id: "multimedios_saltillo", code: "31", name: "Multimedios Saltillo", logoKey: "multimedios_saltillo", category: "SERVICIOS", group: "Compañías de Cable", receivingAddress: placeholderAddress("multimedios_saltillo") },
  { id: "skyvetv", code: "32", name: "Skyvetv", logoKey: "skyvetv", category: "SERVICIOS", group: "Compañías de Cable", receivingAddress: placeholderAddress("skyvetv") },
  { id: "megacable_diestel", code: "33", name: "Megacable Diestel", logoKey: "megacable_diestel", category: "SERVICIOS", group: "Compañías de Cable", receivingAddress: placeholderAddress("megacable_diestel") },
  { id: "izzi", code: "34", name: "Izzi", logoKey: "izzi", category: "SERVICIOS", group: "Compañías de Cable", receivingAddress: placeholderAddress("izzi") },
  { id: "gasnatural_diestel", code: "35", name: "Gas Natural Diestel", logoKey: "gasnatural_diestel", category: "SERVICIOS", group: "Compañías de Gas", receivingAddress: placeholderAddress("gasnatural_diestel") },
  { id: "cia_mexicana_gas", code: "36", name: "Cía Mexicana de Gas", logoKey: "cia_mexicana_gas", category: "SERVICIOS", group: "Compañías de Gas", receivingAddress: placeholderAddress("cia_mexicana_gas") },
  { id: "cfe_diestel", code: "37", name: "CFE Diestel", logoKey: "cfe_diestel", category: "SERVICIOS", group: null, receivingAddress: placeholderAddress("cfe_diestel") },
  { id: "globalcard", code: "38", name: "Globalcard", logoKey: "globalcard", category: "SERVICIOS", group: "Servicios Financieros", receivingAddress: placeholderAddress("globalcard") },
  { id: "crediscotia", code: "39", name: "Crediscotia", logoKey: "crediscotia", category: "SERVICIOS", group: "Servicios Financieros", receivingAddress: placeholderAddress("crediscotia") },
  { id: "gobierno_chihuahua", code: "40", name: "Gobierno de Chihuahua", logoKey: "gobierno_chihuahua", category: "SERVICIOS", group: "Gobierno", receivingAddress: placeholderAddress("gobierno_chihuahua") },
  { id: "gobierno_zacatecas", code: "41", name: "Gobierno de Zacatecas", logoKey: "gobierno_zacatecas", category: "SERVICIOS", group: "Gobierno", receivingAddress: placeholderAddress("gobierno_zacatecas") },
  { id: "rednovo", code: "42", name: "Rednovo", logoKey: "rednovo", category: "SERVICIOS", group: "Servicios Financieros", receivingAddress: placeholderAddress("rednovo") },
  { id: "paynet", code: "43", name: "Paynet", logoKey: "paynet", category: "SERVICIOS", group: "Servicios Financieros", receivingAddress: placeholderAddress("paynet") },
  { id: "conekta", code: "44", name: "Conekta", logoKey: "conekta", category: "SERVICIOS", group: "Servicios Financieros", receivingAddress: placeholderAddress("conekta") },
  { id: "movistar_diestel", code: "45", name: "Movistar Diestel", logoKey: "movistar_diestel", category: "SERVICIOS", group: "Telecomunicaciones", receivingAddress: placeholderAddress("movistar_diestel") },
  { id: "nextel_diestel", code: "46", name: "Nextel Diestel", logoKey: "nextel_diestel", category: "SERVICIOS", group: "Telecomunicaciones", receivingAddress: placeholderAddress("nextel_diestel") },
  { id: "iusacell_diestel", code: "47", name: "Iusacell Diestel", logoKey: "iusacell_diestel", category: "SERVICIOS", group: "Telecomunicaciones", receivingAddress: placeholderAddress("iusacell_diestel") },
  { id: "traspais", code: "48", name: "Traspaís", logoKey: "traspais", category: "SERVICIOS", group: "Servicios Financieros", receivingAddress: placeholderAddress("traspais") },
  { id: "sofipa", code: "49", name: "Sofipa", logoKey: "sofipa", category: "SERVICIOS", group: "Servicios Financieros", receivingAddress: placeholderAddress("sofipa") },
];
