import { useRef, useState } from 'react'
import { ControlledMenu, useHover } from '@szhsin/react-menu'
import ReactHtmlParser from 'react-html-parser'

export const Tooltip = ({ text, children }) => {
    const ref = useRef(null)
    const [isOpen, setOpen] = useState(false)
    const { anchorProps, hoverProps } = useHover(isOpen, setOpen)

    const [displayText, setDisplayText] = useState(null)
    const [delayHandler, setDelayHandler] = useState(null)

    const handleMouseEnter = (e: any) => {
        setDelayHandler(
            // @ts-ignore
            setTimeout(() => {
                setDisplayText(text)
                setOpen(true)
            }, 777)
        )
    }

    const handleMouseLeave = () => {
        setOpen(false)
        clearTimeout(delayHandler as any)
    }

    return (
        <div>
            <div
                ref={ref}
                {...anchorProps}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {children}
            </div>
            <ControlledMenu
                {...hoverProps}
                gap={10}
                direction={"top"}
                align={"center"}
                state={isOpen ? 'open' : 'closed'}
                // @ts-ignore
                anchorRef={ref}
            >
                <div className={tooltipBox}>
                    {ReactHtmlParser(displayText)}
                </div>
            </ControlledMenu>
        </div>
    )
}

const tooltipBox = `
    text-sm
    text-context-menu-text
    bg-context-menu-fill
    border border-solid border-table-border
    px-1 py-0.5
`