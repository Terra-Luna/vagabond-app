import { glowOnHover } from "../../../../../common/text-styles"

export const MenuListItem = ({ text, onClick, toggleMenu }: { text: string, onClick: any, toggleMenu?: any }) => {
    return <li className={`${glowOnHover} cursor-pointer`} onClick={() => {
        onClick()
        if (toggleMenu) toggleMenu()
    }}>{text}</li>
}