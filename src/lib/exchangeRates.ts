import { ExchangeRates } from "@/types/exchange-rates";
import axios from 'axios';

const req = axios.create({
    baseURL:`http://localhost:3001`
});

export const getExchangeRates = async (): Promise<ExchangeRates> => {
    const response = await req.get(`/api/exchange-rates`);
    return response.data;
}