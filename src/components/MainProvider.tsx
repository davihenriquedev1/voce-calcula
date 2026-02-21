"use client";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "./theme-provider";
import { ReactNode } from "react";
import { useState } from "react";

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
    const [persister] = useState(() => {
        if (typeof window === "undefined") {
            return undefined;
        }

        return createSyncStoragePersister({
            storage: window.localStorage,
        });
    });

    if (!persister) {
        return null; // evita quebrar no SSR
    }

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
