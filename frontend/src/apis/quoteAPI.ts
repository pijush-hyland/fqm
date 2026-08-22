import type { QuoteRequirement } from "../types/quoteRequirement.type";
import type { courierRate } from "../types/courierRate.type";
import { api } from "./api";

const QUOTE_BASE_URL = "/quotes";

export const QUOTE_URL = {
    getQuoteByRequirement: `${QUOTE_BASE_URL}/get-quotes`,
};

const quoteAPI = {
    getQuoteByRequirement: (data: QuoteRequirement) => api.post<courierRate[]>(QUOTE_URL.getQuoteByRequirement, data),
};
export default quoteAPI;