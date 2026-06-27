import { useRef, useState } from 'react'
import { ControlledMenu, useHover } from '@szhsin/react-menu'

export const Tooltip = ({ text, children }) => {
    const ref = useRef(null);
    const [isOpen, setOpen] = useState(false);
    const { anchorProps, hoverProps } = useHover(isOpen, setOpen);

    return (
        <div>
            <div
                ref={ref}
                {...anchorProps}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
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
                <div className={tooltipBox}>{text}</div>
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