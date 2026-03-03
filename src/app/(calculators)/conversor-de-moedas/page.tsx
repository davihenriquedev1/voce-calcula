import { dehydrate, QueryClient,HydrationBoundary } from '@tanstack/react-query';
import { getExchangeRates } from '@/features/currency-conversion/services/exchange-rates';
import { CurrencyConversionPage } from '@/features/currency-conversion/CurrencyConversionPage';

const Page = async () => {

    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
        queryKey: ['exchange_rates'],
        queryFn: getExchangeRates
    });

    const dehydratedState = dehydrate(queryClient);
    
    return (
        <HydrationBoundary state={dehydratedState}>
            <CurrencyConversionPage />
        </HydrationBoundary>
    )

}

export default Page;