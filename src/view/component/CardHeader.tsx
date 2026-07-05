import { CollapsibleHeaderProps } from "./Collapsible"
import { Divider } from "./Header"

const cardHeaderLayout = "flex items-center py-1 px-1 bg-section-header-fill"
const cardHeaderStyle = "text-text-section-header text-xl font-eskapade font-bold"

export const CardHeader = ({ img = '', title, toggleCollapsedButton, toggleCollapsed }: CollapsibleHeaderProps) => {
    return (
        <div onClick={toggleCollapsed} className={
            `${cardHeaderLayout} ${cardHeaderStyle} cursor-pointer`
        }>
            {
                img && img.length > 0 ?
                    <img
                        src={img}
                        height={32}
                        width={32}
                        className="border border-solid border-sheet-main-fill rounded-sm mr-2"
                    /> : <></>
            }
            {title}
            <Divider />
            {toggleCollapsedButton}
        </div>
    )
}