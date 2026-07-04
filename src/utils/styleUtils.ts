import "../styles/vagabond-lite.css"

/** 
 * Because we use the shadow DOM very prolifically so our tailwind styles don't blow up the core Foundry styles, we have to do some shenanigans to get HMR (Hot Module Replacement, or "hot reload") working
 * When you import a css file like we do above, vite interprets that as "inject this stylesheet as a <style> tag on the document head"
 * We then grab that style tag, toss it on document, then remove it so it doesn't break the page styling
 * That style tag on document (not a child of it, just a property) can then have its innerHTML exported to be injected into the shadow DOM
 * AND, when a hot reload happens, we can just put that style element BACK as a child of document.head, have vite HMR it if necessary, and then remove it again!
 */

const documentWithStyleTag = (document as any) as { vgLiteDevStyleSheet: HTMLStyleElement }

const removeAndSaveVgLiteStyleTag = () => {
    // todo - figure out what ID this tag gets in prod
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