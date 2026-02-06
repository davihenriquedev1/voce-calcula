import { useQuery } from '@tanstack/react-query'; // Hook principal do React Query para buscar e gerenciar dados assíncronos
import { getExchangeRates } from '@/lib/exchangeRates'; // Função que vai fazer a requisição à API de câmbio
import { MetaExchangeRates } from '@/types/exchange-rates'; // Tipagem TypeScript para os dados que a API retorna

export const useExchangeRates = () => {
	return useQuery<MetaExchangeRates>({  // Cria uma query usando o React Query, tipada com ExchangeRates
		queryKey: ['exchange_rates'], // Identificador único da query; usado para cache e refetch
		queryFn: getExchangeRates,   // Função que realmente faz a requisição
		staleTime: 1000 * 60 * 20, // Define por quanto tempo os dados são considerados "frescos"
		refetchInterval: 1000 * 60 * 20,  // Enquanto a tela estiver aberta, ele refaz
		gcTime: 1000 * 60 * 30,   // Quanto tempo o cache deve permanecer na memória antes de ser limpo
		refetchOnMount: false,          // Não refaz a requisição toda vez que o componente monta
		refetchOnWindowFocus: false,    // Não refaz a requisição quando o usuário volta para a aba do navegador
	});
};