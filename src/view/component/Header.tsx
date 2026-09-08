import { UtilityButton } from "./Button"

export const Header = ({ title, collapseButton, textLeft = false, actions = [] }: {
    title: string, collapseButton?: React.ReactElement, textLeft?: boolean, actions?: SkillCardAction[]
}) => {
    return (
        <div className="bg-section-header-fill text-text-section-header font-eskapade font-bold w-full flex items-center text-lg">
            {textLeft ? <div className="pl-2" /> : <Divider />}
            <div>{title.toUpperCase()}</div>
            <Divider />

            {actions && (
                <div className="flex gap-x-1 mr-1">
                    {actions.map((ska, index) => (
                        <UtilityButton key={index} onClick={async (e) => {
                            e?.stopPropagation()
                            await ska.action(ska.item)
                        }}>
                            <p className="text-text-primary">{ska.label}</p>
                        </UtilityButton>
                    ))}
                </div>
            )}

            {collapseButton && <div className="mr-2">{collapseButton}</div>}
        </div>
    )
}

export const ClearHeader = ({ title }: { title: string }) => {
    if (!title) return null
    return (
        <div className="flex gap-x-2 items-center px-4">
            <Divider />
            {title.toUpperCase()}
            <Divider />
        </div>
    )
}

export const Divider = () => <div className={"grow h-[2px] bg-section-header-line mx-1"} />
export const ItemDivider = () => <div className={"grow h-[1px] bg-table-border/50"} />

export interface SkillCardAction {
    label: string, item: any, action: (item) => Promise<void>
}