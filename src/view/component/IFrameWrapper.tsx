import { ReactNode, useRef } from "react";
import { createPortal } from "react-dom";
import vgliteStyles from "../../../public/styles/vagabond-lite.css?inline"

// Component that wraps children with an iFrame. If you want to save a bit of performance and aren't styling the children, you can use skipStyleInjection to not inject our css
export const IFrameWrapper = (
    {
        children,
        skipStyleInjection,
        width,
        height
    }: {
        children: ReactNode,
        skipStyleInjection?: boolean,
        width: number | string,
        height: number | string
    }
) => {
    const iFrameRef = useRef<HTMLIFrameElement>(null);

    const iDoc = iFrameRef.current?.contentWindow?.document || iFrameRef.current?.contentDocument
    const portalRoot = iDoc?.body;

    const theme = (game.settings as any).get("core", "uiConfig").colorScheme.applications

    const fullChildren = (
        <>
            {!skipStyleInjection && <style>{vgliteStyles}</style>}
            <div className={theme}>
                {children}
            </div>
        </>
    )

    // add our fonts
    const fontFaces = [
        new FontFace(
            'Eskapade',
            'url("systems/vagabond-lite/assets/fonts/eskapade-black.ttf")',
            { weight: 'bold', style: 'normal', }
        ),
        new FontFace(
            'Eskapade',
            'url("systems/vagabond-lite/assets/fonts/eskapade-regular.ttf")',
            { weight: 'normal', style: 'normal', }
        ),
        new FontFace(
            'Paradigm',
            'url("systems/vagabond-lite/assets/fonts/paradigm-regular.otf")',
            { weight: 'normal', style: 'normal', }
        ),
        new FontFace(
            'Paradigm',
            'url("systems/vagabond-lite/assets/fonts/paradigm-bold.otf")',
            { weight: 'bold', style: 'normal', }
        ),
    ];

    Promise.all(fontFaces.map(face => face.load())).then(fonts => fonts.forEach(
        font => iDoc?.fonts.add(font)
    ))

    return (
        <iframe ref={iFrameRef} width={width} height={height}>
            {portalRoot && createPortal(fullChildren, portalRoot)}
        </iframe>
    );
}