import { useQuery } from '@tanstack/react-query';
import { getExchangeRates } from '../services/exchange-rates';
import { MetaExchangeRates } from '../types';

export const useExchangeRates = () => {
	return useQuery<MetaExchangeRates>({
		queryKey: ['exchange_rates'],
		queryFn: getExchangeRates,
		staleTime: 1000 * 60 * 30,
		refetchInterval: 1000 * 60 * 30,
		gcTime: 1000 * 60 * 60,
		refetchOnWindowFocus: false,
	});
};