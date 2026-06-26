import { useState } from 'react'
import { Divider, ItemDivider } from './Header'
import { ControlledMenu, MenuItem } from '@szhsin/react-menu'

export const ctxMenuContainerStyle = "bg-context-menu-fill text-context-menu-text border-2 border-solid border-table-border z-99"
export const ctxMenuTextStyle = "text-base font-eskapade font-bold hover:bg-context-menu-hover px-2 pr-4 z-99"
export const ctxMenuDestructiveTextStyle = "text-destructive-action text-lg font-eskapade font-bold hover:bg-context-menu-hover px-2 pr-4 z-99"

/**
 * A reusable context menu!
 * Sample implementation...
 *

const Component = () => {
    const { onCtxMenu, ContextMenu } = useContextMenu()
    return(
        <div onContenxtMenu={(e) => onCtxMenu(e, [
                { icon: Sword, label: 'Attack', action: () => someFunction(arg1, arg2) },
                ...
            ])}>
            <div>Right click on me!</div>
            <ContextMenu />
        </div>
    )
}

 */
export interface CtxMenuItem {
    icon: any
    label: string
    action: (e: any) => void
    isDestructive?: boolean
}

export const useContextMenu = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [menuAnchorPoint, setMenuAnchorPoint] = useState({ x: 0, y: 0 })
    const [menuItems, setMenuItems] = useState<CtxMenuItem[]>([])

    const onCtxMenu = (e: any, menuItems: CtxMenuItem[]) => {
        if (typeof document.hasFocus === 'function' && !document.hasFocus()) return
        e.stopPropagation()
        e.preventDefault()
        setMenuAnchorPoint({ x: e.clientX, y: e.clientY })
        setMenuItems(menuItems)
        setIsMenuOpen(true)
    }

    const ContextMenu = () => {
        return (
            <ControlledMenu
                menuClassName={ctxMenuContainerStyle}
                anchorPoint={menuAnchorPoint}
                state={isMenuOpen ? 'open' : 'closed'}
                direction="right"
                onClose={() => setIsMenuOpen(false)}
            >
                {
                    menuItems.map((item) => (
                        <div key={item.label}>
                            { item.isDestructive ? <Divider /> : <></> }
                            <MenuItem className={item.isDestructive ? ctxMenuDestructiveTextStyle : ctxMenuTextStyle} onClick={item.action}>
                                {item.icon ?
                                    <div className="flex items-center">
                                        {formattedIcon(item.icon, item.isDestructive)}
                                        <div className="mx-1" />
                                        <p className="my-1">{item.label}</p>
                                        <div className="mr-1" />
                                    </div> : <></>
                                }
                            </MenuItem>
                        </div>
                    ))
                }
            </ControlledMenu>
        )
    }

    return { onCtxMenu, ContextMenu }
}

const formattedIcon = (IconComponent, isDestructive) => {
    return <IconComponent size={14} className={isDestructive ? `text-destructive-action` : `text-context-menu-text`} />
}