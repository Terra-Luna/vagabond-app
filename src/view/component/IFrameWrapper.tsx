import { ReactNode, useRef } from "react";
import { createPortal } from "react-dom";

import vgliteStyles from "../../../public/styles/vagabond-lite.css?inline"

// Component that wraps children with an iFrame. If you want to save a bit of performance and aren't styling the children, you can use skipStyleInjection to not inject our css
export const IFrameWrapper = ({ children, skipStyleInjection, width, height }: { children: ReactNode; skipStyleInjection?: boolean, width: number | string, height: number }) => {
    const iFrameRef = useRef<HTMLIFrameElement>(null);

    const iDoc = iFrameRef.current?.contentWindow?.document || iFrameRef.current?.contentDocument
    const portalRoot = iDoc?.body;

    const fullChildren = (
        <>
            {!skipStyleInjection && <style>{vgliteStyles}</style>}
            {children}
        </>
    )

    return (
        <iframe ref={iFrameRef} width={width} height={height}>
            {portalRoot && createPortal(fullChildren, portalRoot)}
        </iframe>
    );
}