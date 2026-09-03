import styles from "../styles/vagabond-lite.css?inline"
export let vgLiteStyles: any = styles

if (import.meta.hot) {
    import.meta.hot.accept('../styles/vagabond-lite.css?inline', (newModule) => {
        if (newModule && newModule.default) {
            vgLiteStyles = newModule.default;
            console.log('Updating tailwind styles...');

            window.dispatchEvent(new CustomEvent('tailwind-styles-updated', {
                detail: vgLiteStyles
            }));
        }
    });
}

export const createStyleTag = () => {
    const styleTag = document.createElement('style')
    styleTag.textContent = vgLiteStyles
    listenForTailwindUpdates(styleTag)
    return styleTag
}

export const listenForTailwindUpdates = (styleTag: HTMLStyleElement) => {
    if (import.meta.env.DEV) {
        const handleUpdate = (e: Event) => {
            const customEvent = e as CustomEvent<string>;
            if (styleTag) {
                styleTag.textContent = customEvent.detail;
            }
        };

        window.addEventListener('tailwind-styles-updated', handleUpdate);
    }
}