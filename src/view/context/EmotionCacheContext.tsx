import { ReactNode, useMemo } from "react";
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'

export const EmotionCacheContext = ({ scaduRoot, children }: { scaduRoot: any; children: ReactNode; }) => {
    const emotionCache = useMemo(() => {
        return createCache({
            key: 'shadow-react-select',
            container: scaduRoot, // Pass your shadow-root node here
            prepend: true,
        });
    }, [scaduRoot]);

    return (
        <CacheProvider value={emotionCache}>
            {children}
        </CacheProvider>
    )
}