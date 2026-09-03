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