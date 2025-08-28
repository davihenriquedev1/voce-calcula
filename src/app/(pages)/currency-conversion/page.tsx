import { dehydrate, QueryClient,HydrationBoundary } from '@tanstack/react-query';
import CurrencyConversion from '@/components/calculators/CurrencyConversion';
import { Suspense } from 'react';
import { LoadingBounce } from '@/components/partials/Loading';
import { getExchangeRates } from '@/lib/exchangeRates';

const Page = async () => {

    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
        queryKey: ['exchange_rates'],
        queryFn: getExchangeRates
    });

    const dehydratedState = dehydrate(queryClient);
    
    /**
        O dehydratedState é o estado serializado do cache do React Query, usado principalmente em Server-Side Rendering (SSR) ou Static-Site Generation (SSG) no Next.js.
        Ele não é só os dados puros; contém informações de todas as queries que estavam no cache no momento da serialização, incluindo:
        queries → array de todas as queries, cada uma com:
            queryKey → a chave usada na query
            queryHash → hash da query
            state → que contém:
                data → os dados reais da query
                error → erro (se houver)
                status → 'success' | 'error' | 'loading'
                isFetching, isStale, etc.
        mutations → histórico de mutações (geralmente vazio se não houve nenhuma)
    */
    return (
        <Suspense fallback={<LoadingBounce/>}>
            <HydrationBoundary state={dehydratedState}>
                <CurrencyConversion />
            </HydrationBoundary>
        </Suspense> 
    )

}

export default Page;