"use client";

import { QueryClient } from "@tanstack/react-query";
import { Persister, PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "./theme";
import { ReactNode, useEffect, useState } from "react";

type Props = {
    children:ReactNode
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 3,
        },
    },
});

export const MainProvider = ({children}:Props) => {
    const [mounted, setMounted] = useState(false);
    const [persister, setPersister] = useState<Persister | undefined>(undefined);

    useEffect(() => {
        setMounted(true);

        setPersister(createSyncStoragePersister({ storage: window.localStorage }));
    }, []);

    if (!mounted || !persister) return null;
        
    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
           
                <ThemeProvider  
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" position="bottom"
            />
        </PersistQueryClientProvider>
    )
}
