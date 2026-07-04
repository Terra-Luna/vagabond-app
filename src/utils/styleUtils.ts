import "../styles/vagabond-lite.css"

const documentWithStyleTag = (document as any) as { vgLiteDevStyleSheet: HTMLStyleElement }

const removeAndSaveVgLiteStyleTag = () => {
    const vgLiteStyleTag = document.querySelector('style[data-vite-dev-id*="vagabond-lite.css"]') as HTMLStyleElement;
    if (vgLiteStyleTag) {
        vgLiteStyleTag.remove();
        documentWithStyleTag.vgLiteDevStyleSheet = vgLiteStyleTag
    }
}

removeAndSaveVgLiteStyleTag()

export const vgLiteStyles = documentWithStyleTag.vgLiteDevStyleSheet.innerHTML as string

if (import.meta.hot) {
    import.meta.hot.on("vite:beforeUpdate", () => {
        document.head.appendChild(documentWithStyleTag.vgLiteDevStyleSheet)
    })

    import.meta.hot.on("vite:afterUpdate", () => {
        removeAndSaveVgLiteStyleTag()
    })
}