/* eslint-disable react-refresh/only-export-components */
import { ControlledMenu, MenuItem, SubMenu } from '@szhsin/react-menu'
import { FunctionComponent, useCallback, useMemo, useRef, useState } from 'react'

import { Divider } from './Header'

export const ctxMenuContainerStyle = "bg-context-menu-fill text-context-menu-text border-2 border-solid border-table-border z-99 pointer-events-auto"
export const ctxSubMenuContainerStyle = "bg-context-menu-fill text-context-menu-text border-2 border-solid border-table-border z-99 pointer-events-auto relative left-[2px]"
const baseCtxMenuTextStyle = "font-eskapade font-normal z-99"
const normalHover = "hover:bg-context-menu-hover"
export const ctxMenuTextStyle = `${baseCtxMenuTextStyle} ${normalHover} text-base`
export const ctxMenuDestructiveTextStyle = `${baseCtxMenuTextStyle} ${normalHover} text-destructive-action text-lg z-99`
export const ctxMenuSelectedTextStyle = `${baseCtxMenuTextStyle} bg-sheet-header-fill text-text-header-secondary`

export interface CtxMenuItem {
    icon?: FunctionComponent<{ size, className }>
    label: string
    action?: (e: any) => void
    isDestructive?: boolean
    isSelected?: boolean | (() => boolean)
    subMenuItems?: CtxMenuItem[] | (() => CtxMenuItem[])
}

export const useContextMenu = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [menuAnchorPoint, setMenuAnchorPoint] = useState({ x: 0, y: 0 })
    const [menuItems, setMenuItems] = useState<CtxMenuItem[]>([])

    // because of shadow dom shenanigans, the context menu gets blurred too often and thinks it needs to close when it's on top of another component that we render with react
    // we can get around this by monitoring whether the mouse is currently in the context menu, and whether the selected menu item had "keepOpen" set
    const isHoveringInMenu = useRef(false)
    const keepOpenRef = useRef(false)

    const onCtxMenu = (e: any, menuItems: CtxMenuItem[]) => {
        if (typeof document.hasFocus === 'function' && !document.hasFocus()) return
        e.stopPropagation()
        e.preventDefault()
        setMenuAnchorPoint({ x: e.clientX, y: e.clientY })
        setMenuItems(menuItems)
        setIsMenuOpen(true)
    }

    const onClose = useCallback((closeEvent?: { reason?: string }) => {
        // if the mouse hasn't left the context menu, and the menu item had keepOpen set, we shouldn't actually close
        if (closeEvent?.reason === "blur" && isHoveringInMenu.current && keepOpenRef.current) {
            return
        }
        setIsMenuOpen(false)
    }, [])

    const onItemAction = useCallback((e: any) => {
        keepOpenRef.current = !!e?.keepOpen
    }, [])

    const ContextMenu = useMemo(() => () => (
        <ContextMenuHost
            isMenuOpen={isMenuOpen}
            menuAnchorPoint={menuAnchorPoint}
            menuItems={menuItems}
            onClose={onClose}
            setIsHovering={(isHovering) => { isHoveringInMenu.current = isHovering }}
            onItemAction={onItemAction}
        />
    ), [isMenuOpen, menuAnchorPoint, menuItems, onClose])

    return { onCtxMenu, ContextMenu }
}

const ContextMenuHost = ({ isMenuOpen, menuAnchorPoint, menuItems, onClose, onItemAction, setIsHovering }: {
    isMenuOpen: boolean, menuAnchorPoint: { x: number, y: number }, menuItems: CtxMenuItem[], onClose: (closeEvent?: { reason?: string }) => void, onItemAction: (e: any) => void, setIsHovering: (hovering: boolean) => void
}) => {
    return (
        <div
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}>
            <ControlledMenu
                menuClassName={ctxMenuContainerStyle}
                anchorPoint={menuAnchorPoint}
                state={isMenuOpen ? 'open' : 'closed'}
                direction="right"
                onClose={onClose}
            >
                {
                    menuItems.map((item, index) =>
                        <OneMenuItem key={index} item={item} length={menuItems.length} onItemAction={onItemAction} />
                    )
                }
            </ControlledMenu>
        </div>
    )
}

const OneMenuItem = ({ item, length, onItemAction }: { item: CtxMenuItem, length: number | undefined, onItemAction: (e: any) => void }) => {
    const isSelected = typeof item.isSelected === 'function' ? item.isSelected() : item.isSelected
    const subMenuItems = typeof item.subMenuItems === 'function' ? item.subMenuItems() : item.subMenuItems

    if (subMenuItems) {
        return (
            <SubMenu label={<LabelAndIcon item={item} isSubMenu />} className={isSelected ? ctxMenuSelectedTextStyle : ctxMenuTextStyle} menuClassName={ctxSubMenuContainerStyle}>
                {subMenuItems.map((subItem, index) => <OneMenuItem key={index} item={subItem} length={item.subMenuItems?.length} onItemAction={onItemAction} />)}
            </SubMenu>)
    }

    return <MenuItem className={item.isDestructive ? ctxMenuDestructiveTextStyle : isSelected ? ctxMenuSelectedTextStyle : ctxMenuTextStyle} onClick={(e) => { item.action?.(e); onItemAction(e) }}>
        {item.isDestructive && (length ?? 0) > 1 && <Divider />}
        <LabelAndIcon item={item} />
    </MenuItem>
}

const LabelAndIcon = ({ item, isSubMenu }: { item: CtxMenuItem, isSubMenu?: boolean }) => (
    <div className="flex items-center text-sm px-1">
        {formattedIcon(item.icon, item.isDestructive)}
        <p className="my-1">{`${item.label}${isSubMenu ? '...' : ''}`}</p>
    </div>
)

const formattedIcon = (IconComponent: FunctionComponent<{ size, className }> | undefined, isDestructive) => {
    if (!IconComponent) return undefined
    return <IconComponent size={14} className={`mr-2 ${isDestructive ? `text-destructive-action` : `text-context-menu-text`}`} />
}