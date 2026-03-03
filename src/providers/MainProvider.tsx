"use client";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "./theme";
import { ReactNode, useState } from "react";

type Props = {
    children:ReactNode
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 3, // 12 hours
        },
    },
});

export const MainProvider = ({children}:Props) => {
    const [persister] = useState(() =>
        typeof window !== "undefined"
            ? createSyncStoragePersister({
                storage: window.localStorage,
                })
            : undefined
    );

    if (!persister) return null;
        
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
