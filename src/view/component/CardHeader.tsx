import { CollapsibleHeaderProps } from "./Collapsible"
import { ImageWithDamageTypeBadge } from "./DamageTypeIcon"
import { Divider } from "./Header"

export const CardHeader = ({ img = '', dmgType = 'none', title, toggleCollapsedButton, toggleCollapsed }: CollapsibleHeaderProps) => {
    const cardHeaderLayout = "flex items-center py-1 px-1 bg-section-header-fill"
    const cardHeaderStyle = "text-text-section-header text-xl font-eskapade font-bold"
    return (
        <div onClick={toggleCollapsed} className={
            `${cardHeaderLayout} ${cardHeaderStyle} cursor-pointer`
        }>
            {
                !img || img === '' ? <></> :
                    <ImageWithDamageTypeBadge img={img} dmgType={dmgType} size={38} />
            }
            <span className="ml-2">{title}</span>
            <Divider />
            {toggleCollapsedButton}
        </div>
    )
}