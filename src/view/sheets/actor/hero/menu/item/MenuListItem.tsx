import { ItemDivider } from "../../../../../component/Header"

export const MenuListItem = ({ text, onClick, toggleMenu }: { text: string, onClick: any, toggleMenu?: any }) => {
    return (
        <div>
            <ItemDivider />
            <li className={`hover-glow mt-2 p2`} onClick={() => {
                onClick()
                if (toggleMenu) toggleMenu()
            }}>
                {text}
            </li>
        </div>
    )
}