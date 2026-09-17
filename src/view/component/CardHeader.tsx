import { UtilityButton } from "./Button"
import { CollapsibleHeaderProps } from "./Collapsible"
import { ImageWithDamageTypeBadge } from "./DamageTypeIcon"
import { Divider } from "./Header"
import { Tooltip } from "./Tooltip"

export const CardHeader = ({ img = '', dmgType = 'none', title, toggleCollapsedButton, toggleCollapsed, actions = [] }: CollapsibleHeaderProps) => {
    const cardHeaderLayout = "flex items-center py-1 px-1 bg-section-header-fill"
    const cardHeaderStyle = "text-text-section-header text-xl font-eskapade font-bold"
    return (
        <div onClick={toggleCollapsed} className={
            `${cardHeaderLayout} ${cardHeaderStyle} cursor-pointer`
        }>
            {!img || img === ''
                ? <></>
                : <ImageWithDamageTypeBadge img={img} dmgType={dmgType} size={38} />
            }
            <span className={`${img ? 'ml-2' : 'ml-1'}`}>{title}</span>
            <Divider />

            {toggleCollapsedButton}

            {actions && (
                <div className="flex gap-x-1 ml-1">
                    {actions.map((ska, index) => (
                        <Tooltip title={ska.tooltip.title} content={ska.tooltip.content}>
                            <UtilityButton key={index} onClick={async (e) => {
                                e?.stopPropagation()
                                await ska.action(e, ska.item)
                            }}>
                                <p className="text-text-primary">{ska.label}</p>
                            </UtilityButton>
                        </Tooltip>
                    ))}
                </div>
            )}
        </div>
    )
}