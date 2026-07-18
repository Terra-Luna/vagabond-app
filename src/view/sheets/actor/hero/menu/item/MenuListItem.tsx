import { glowOnHover } from "../../../../../common/text-styles"

export const MenuListItem = ({ text, onClick, toggleMenu }: { text: string, onClick: any, toggleMenu?: any }) => {
    return <li className={`
        ${glowOnHover} 
        border border-solid border-table-border rounded-sm
        px-2 py-0.5
        hover:bg-context-menu-fill/50
    `} onClick={() => {
        onClick()
        if (toggleMenu) toggleMenu()
    }}>{text}</li>
}