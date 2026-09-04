import styles from "../styles/vagabond-app.css?inline"
export let appStyles: any = styles

if (import.meta.hot) {
    // whenever the css file hot-reloads...
    import.meta.hot.accept('../styles/vagabond-app.css?inline', (newModule) => {
        if (newModule && newModule.default) {
            // replace our exported variable with the new content
            appStyles = newModule.default;

            // and let all our scaduRoots know they need to update
            window.dispatchEvent(new CustomEvent('tailwind-styles-updated', {
                detail: appStyles
            }));
        }
    });
}

// Creates a style tag that will listen for any HMR updates
export const createStyleTag = () => {
    const styleTag = document.createElement('style')
    styleTag.textContent = appStyles
    listenForTailwindUpdates(styleTag)
    return styleTag
}

// If we're running for a dev server, listens for our tailwind-styles-updated event and replaces the style tag's content with the new css
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