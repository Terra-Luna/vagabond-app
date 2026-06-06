import { CollapsibleHeaderProps } from "./Collapsible"
import { Divider } from "./Header"


const cardHeaderLayout = "flex items-center pt-2 pb-1 pl-2 pr-2 bg-section-header-fill"
const cardHeaderStyle = "text-text-section-header text-xl font-eskapade font-bold rounded-t-lg"

export const CardHeader = ({ title, isCollapsed, toggleCollapsedButton, toggleCollapsed }: CollapsibleHeaderProps) => {
    return (
        <div onClick={toggleCollapsed} className={
            `${cardHeaderLayout} ${cardHeaderStyle} ${isCollapsed ? 'rounded-b-lg' : ''} cursor-pointer`
        }>
            {title}
            <Divider />
            {toggleCollapsedButton}
        </div>
    )
}