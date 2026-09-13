import { ControlledMenu } from '@szhsin/react-menu'
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import ReactHtmlParser from 'react-html-parser'

import { createStyleTag } from '../../utils/styleUtils'
import { tableBorderRounded } from '../common/border-styles'

const TOOLTIP_CURSOR_GAP = 8
const TOOLTIP_ESTIMATED_WIDTH = 240
export const tooltipContainerStyle = "pointer-events-none z-99"
export const tooltipContentStyle = ""

export interface TooltipProps {
    title?: string
    content?: ReactNode
    children: ReactNode
    interactive?: boolean
    disabled?: boolean
}

/**
 * Shared by a tree of nested Tooltips so that only the deepest (innermost) one currently hovered
 * is allowed to open to prevent them from stacking.
 */
interface TooltipNestState {
    depth: number
    activeDepth: { current: number }
    closers: Map<number, () => void>
}
const TooltipNestContext = createContext<TooltipNestState | null>(null)

/**
 * Tooltip scoped to a target portal. Set interactive to true to keep it open when hovering over the tooltip content.
 * Content can be a string with \n line-breaks or, preferrably, a ReactNode.
 * @param param0
 * @returns
 */
export const Tooltip = ({ title, content, children, interactive, disabled }: TooltipProps) => {

    const anchorRef = useRef<HTMLSpanElement>(null)
    const cursorXY = useRef({ x: 0, y: 0 })
    const [isOpen, setIsOpen] = useState(false)
    const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 })
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
    const openTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)
    const closeTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

    const parentNest = useContext(TooltipNestContext)
    const nestRef = useRef<TooltipNestState>(undefined)
    if (!nestRef.current) {
        nestRef.current = parentNest
            ? { depth: parentNest.depth + 1, activeDepth: parentNest.activeDepth, closers: parentNest.closers }
            : { depth: 1, activeDepth: { current: 0 }, closers: new Map() }
    }
    const nest = nestRef.current

    useEffect(() => {
        nest.closers.set(nest.depth, () => setIsOpen(false))
        return () => { nest.closers.delete(nest.depth) }
    }, [nest])

    const claimHover = () => {
        if (nest.depth > nest.activeDepth.current) {
            nest.closers.forEach((close, depth) => { if (depth < nest.depth) close() })
        }
        nest.activeDepth.current = Math.max(nest.activeDepth.current, nest.depth)
    }
    const releaseHover = () => {
        if (nest.activeDepth.current === nest.depth) nest.activeDepth.current = nest.depth - 1
    }

    useEffect(() => {
        const anchor = anchorRef.current
        if (!anchor || !document.body) return
        let portalHost = document.body.querySelector<HTMLDivElement>(':scope > .tooltip-portal-root')
        if (!portalHost) {
            portalHost = document.createElement('div')
            portalHost.className = 'tooltip-portal-root'
            document.body.appendChild(portalHost)
        }

        const shadowRoot = portalHost.shadowRoot ?? portalHost.attachShadow({ mode: 'open' })
        let container = shadowRoot.querySelector<HTMLDivElement>('.tooltip-portal-container')
        if (!container) {
            container = document.createElement('div')
            container.className = 'tooltip-portal-container'
            shadowRoot.appendChild(container)
        }

        if (!shadowRoot.querySelector('style[data-tooltip-styles]')) {
            const styleTag = createStyleTag()
            styleTag.dataset.tooltipStyles = 'true'
            shadowRoot.prepend(styleTag)
        }

        Object.assign(portalHost.style, {
            position: 'fixed',
            inset: '0',
            zIndex: '9999',
            pointerEvents: 'none'
        })

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

    const trackPointer = (e: { clientX?: number, clientY?: number }) => {
        if (disabled || !content) return
        claimHover()
        if (typeof e.clientX === 'number' && typeof e.clientY === 'number') {
            cursorXY.current = { x: e.clientX, y: e.clientY }
        }
        else if (anchorRef.current) {
            const rect = anchorRef.current.getBoundingClientRect()
            cursorXY.current = { x: rect.left, y: rect.top }
        }
    }

    const show = (e: { clientX?: number, clientY?: number } = {}) => {
        if (disabled || !content) return
        trackPointer(e)
        clearTimeout(closeTimeout.current)
        openTimeout.current = setTimeout(() => {
            // a deeper nested Tooltip may have claimed hover since this was scheduled - only the
            // innermost hovered Tooltip is allowed to actually open
            if (nest.activeDepth.current !== nest.depth) return
            setAnchorPoint({ x: cursorXY.current.x, y: cursorXY.current.y - TOOLTIP_CURSOR_GAP })
            setIsOpen(true)
        }, 1200)
    }

    const hide = () => {
        releaseHover()
        clearTimeout(openTimeout.current)
        closeTimeout.current = setTimeout(() => setIsOpen(false), 50)
    }

    const cancelHide = () => clearTimeout(closeTimeout.current)

    const resetTimer = (e: { clientX?: number, clientY?: number }) => {
        if (isOpen) {
            clearTimeout(openTimeout.current)
            clearTimeout(closeTimeout.current)
            setIsOpen(false)
        }
        else {
            clearTimeout(openTimeout.current)
            show(e)
        }
    }

    return (
        <>
            <span
                ref={anchorRef}
                onMouseEnter={show}
                onMouseMove={trackPointer}
                onMouseLeave={hide}
                onFocus={() => show()}
                onBlur={hide}
                onClick={resetTimer}
                onAuxClick={resetTimer}
            >
                <TooltipNestContext.Provider value={nest}>
                    {children}
                </TooltipNestContext.Provider>
            </span>
            {portalTarget &&
                <ControlledMenu
                    state={isOpen ? 'open' : 'closed'}
                    anchorPoint={anchorPoint}
                    direction={anchorPoint.x < TOOLTIP_ESTIMATED_WIDTH ? "right" : "left"}
                    align={"end"}
                    captureFocus={false}
                    unmountOnClose
                    portal={{ target: portalTarget }}
                    menuClassName={tooltipContainerStyle}
                    onClose={() => setIsOpen(false)}
                    onClick={() => {
                        if (interactive) return
                        hide()
                        setIsOpen(false)
                    }}
                >
                    <div
                        className={`bg-context-menu-fill ${tableBorderRounded} border-2 px-2 py-0.5 ${typeof content === 'string' ? 'max-w-[min(24rem,calc(100vw-2rem))] whitespace-normal break-words' : ''} ${interactive ? 'pointer-events-auto' : ''}`}
                        onMouseEnter={interactive ? cancelHide : undefined}
                        onMouseLeave={interactive ? hide : undefined}
                    >
                        {/* TITLE (OPTIONAL) */}
                        {title &&
                            <div className="text-base text-text-header-tertiary font-eskapade font-bold">
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
const renderContent = (content?: ReactNode) => {
    if (!content) return null
    if (typeof content !== 'string') return content
    return <span className="text-sm text-context-menu-text font-paradigm font-normal whitespace-normal break-words">
        {ReactHtmlParser(content.replace(`\n`, `<br />`))}
    </span>
}