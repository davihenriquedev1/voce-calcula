import { MetaExchangeRates } from "@/types/exchange-rates";
import axios from 'axios';

export const getExchangeRates = async (): Promise<MetaExchangeRates> => {
    const response = await axios.get(`/api/exchange-rates`);
    return response.data;
}