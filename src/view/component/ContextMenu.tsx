import { ControlledMenu, MenuItem, SubMenu } from '@szhsin/react-menu'
import { FunctionComponent, useState } from 'react'

import { Divider } from './Header'

export const ctxMenuContainerStyle = "bg-context-menu-fill text-context-menu-text border-2 border-solid border-table-border z-99 pointer-events-auto"
export const ctxSubMenuContainerStyle = "bg-context-menu-fill text-context-menu-text border-2 border-solid border-table-border z-99 pointer-events-auto relative left-[2px]"
const baseCtxMenuTextStyle = "font-eskapade font-bold z-99"
const normalHover = "hover:bg-context-menu-hover"
export const ctxMenuTextStyle = `${baseCtxMenuTextStyle} ${normalHover} text-base`
export const ctxMenuDestructiveTextStyle = `${baseCtxMenuTextStyle} ${normalHover} text-destructive-action text-lg z-99`
export const ctxMenuSelectedTextStyle = `${baseCtxMenuTextStyle} bg-context-menu-hover/60`

export interface CtxMenuItem {
    icon?: FunctionComponent<{ size, className }>
    label: string
    action?: (e: any) => void
    isDestructive?: boolean
    isSelected?: boolean
    subMenuItems?: CtxMenuItem[]
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
            <div
                onMouseEnter={e => e.stopPropagation()}
                onMouseOver={e => e.stopPropagation()}>
                <ControlledMenu
                    menuClassName={ctxMenuContainerStyle}
                    anchorPoint={menuAnchorPoint}
                    state={isMenuOpen ? 'open' : 'closed'}
                    direction="right"
                    onClose={() => setIsMenuOpen(false)}
                >
                    {
                        menuItems.map((item, index) =>
                            <OneMenuItem key={index} item={item} length={menuItems.length} />
                        )
                    }
                </ControlledMenu>
            </div>
        )
    }

    return { onCtxMenu, ContextMenu }
}

const OneMenuItem = ({ item, length }: { item: CtxMenuItem, length: number | undefined }) => {
    if (item.subMenuItems) {
        return (
            <SubMenu label={<LabelAndIcon item={item} isSubMenu />} className={ctxMenuTextStyle} menuClassName={ctxSubMenuContainerStyle}>
                {item.subMenuItems.map(subItem => <OneMenuItem item={subItem} length={item.subMenuItems?.length} />)}
            </SubMenu>)
    }

    return <MenuItem className={item.isDestructive ? ctxMenuDestructiveTextStyle : item?.isSelected ? ctxMenuSelectedTextStyle : ctxMenuTextStyle} onClick={item.action}>
        {item.isDestructive && (length ?? 0) > 1 && <Divider />}
        <LabelAndIcon item={item} />
    </MenuItem>
}

const LabelAndIcon = ({ item, isSubMenu }: { item: CtxMenuItem, isSubMenu?: boolean }) => (
    <div className="flex items-center text-sm px-1">
        {formattedIcon(item.icon, item.isDestructive)}
        <p className="my-1">{`${item.label}${isSubMenu ? '...' : ''}`}</p>
    </div>)

const formattedIcon = (IconComponent: FunctionComponent<{ size, className }> | undefined, isDestructive) => {
    if (!IconComponent) return undefined
    return <IconComponent size={14} className={`mr-2 ${isDestructive ? `text-destructive-action` : `text-context-menu-text`}`} />
}