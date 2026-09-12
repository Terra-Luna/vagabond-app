import { ControlledMenu } from '@szhsin/react-menu'
import { ReactNode, RefObject, useEffect, useRef, useState } from 'react'

import { tableBorderRounded } from '../common/border-styles'

export const tooltipContainerStyle = "pointer-events-none z-99"
export const tooltipContentStyle = ""

export interface TooltipProps {
    title?: string
    content: ReactNode
    children: ReactNode
    interactive?: boolean
}

/**
 * Tooltip scoped to a target portal. Set interactive to true to keep it open when hovering over the tooltip content.
 * Content can be a string with \n line-breaks or, preferrably, a ReactNode.
 * @param param0
 * @returns
 */
export const Tooltip = ({ title, content, children, interactive }: TooltipProps) => {

    const disabled = false // TODO: hook this into a user-specific tooltip enable/disable setting.

    const anchorRef = useRef<HTMLSpanElement>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
    const openTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)
    const closeTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

    useEffect(() => {
        const anchor = anchorRef.current
        const root = anchor?.getRootNode() as Document | ShadowRoot | undefined
        if (!root) return
        let container = root.querySelector<HTMLDivElement>(':scope > .tooltip-portal-root')
        if (!container) {
            container = document.createElement('div')
            container.className = 'tooltip-portal-root'
            root.appendChild(container)
        }

        const theme = anchor?.closest('.light, .dark')
        if (theme) {
            container.classList.remove('light', 'dark')
            container.classList.add(theme.classList.contains('dark') ? 'dark' : 'light')
        }
        setPortalTarget(container)
    }, [])

    useEffect(() => () => {
        clearTimeout(openTimeout.current)
        clearTimeout(closeTimeout.current)
    }, [])

    const show = () => {
        if (disabled || !content) return
        clearTimeout(closeTimeout.current)
        openTimeout.current = setTimeout(() => setIsOpen(true), 800)
    }

    const hide = () => {
        clearTimeout(openTimeout.current)
        closeTimeout.current = setTimeout(() => setIsOpen(false), 50)
    }

    const cancelHide = () => clearTimeout(closeTimeout.current)

    return (
        <>
            <span
                ref={anchorRef}
                onMouseEnter={show}
                onMouseLeave={hide}
                onFocus={show}
                onBlur={hide}
            >
                {children}
            </span>
            {portalTarget &&
                <ControlledMenu
                    state={isOpen ? 'open' : 'closed'}
                    anchorRef={anchorRef as RefObject<Element>}
                    direction={"top"}
                    align={"center"}
                    captureFocus={false}
                    unmountOnClose
                    portal={{ target: portalTarget }}
                    menuClassName={tooltipContainerStyle}
                    onClose={() => setIsOpen(false)}
                >
                    <div
                        className={`
                            bg-context-menu-fill ${tableBorderRounded} border-2 p-2 
                            ${interactive ? 'pointer-events-auto' : ''}
                        `}
                        onMouseEnter={interactive ? cancelHide : undefined}
                        onMouseLeave={interactive ? hide : undefined}
                    >
                        {/* TITLE (OPTIONAL) */}
                        {title &&
                            <div className="text-lg text-text-header-tertiary font-eskapade font-bold">
                                {title}
                            </div>
                        }
                        {/* CONTENT (REQUIRED) */}
                        {renderContent(content)}
                    </div>
                </ControlledMenu>
            }
        </>
    )
}

/**
 * Added this because plain strings with \n won't automatically create line breaks in JSX.
 * @param content 
 * @returns 
 */
const renderContent = (content: ReactNode) => {
    if (typeof content !== 'string') return content
    return content.split('\n').map((line, index) => (
        <span key={index} className="text-base text-text-primary font-paradigm font-normal">
            {index > 0 && <br />}
            {line}
        </span>
    ))
}