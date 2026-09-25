import { ReactNode } from "react"

import { UtilityButton } from "./Button"
import { Tooltip } from "./Tooltip"

export const Header = ({ title, collapseButton, textLeft = false, actions = [] }: {
    title: string | ReactNode, collapseButton?: React.ReactElement, textLeft?: boolean, actions?: SkillCardAction[]
}) => {
    return (
        <div className="bg-section-header-fill text-text-section-header font-eskapade font-bold w-full flex items-center text-base relative min-h-[1.5rem]">
            {textLeft ? (
                // LEFT-ALIGNED LAYOUT
                <>
                    <div className="pl-2" />
                    <div>{title}</div>
                    <Divider />
                </>
            ) : (<>
                {/* Background Dividers */}
                    <div className="absolute inset-0 flex items-center pointer-events-none w-full">
                        <div className="flex-1"><Divider /></div>
                        {/* Invisible spacer  */}
                        <div className="px-2 opacity-0 select-none">{title}</div>
                        <div className="flex-1"><Divider /></div>
                    </div>

                    {/* Title Text Layer: Centered over the container */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-section-header-fill px-2 pointer-events-auto">
                            {title}
                        </div>
                    </div>
                </>
            )}

            {/* ACTIONS & COLLAPSE BUTTON: Floating elements aligned to the right side */}
            <div className="ml-auto flex items-center z-10">
                {collapseButton && <div className="mr-2">{collapseButton}</div>}

                {actions && (
                    <div className="flex gap-x-1 ml-1">
                        {actions.map((ska, index) => (
                            <Tooltip key={index} title={ska.tooltip.title} content={ska.tooltip.content}>
                                <UtilityButton onClick={async (e) => {
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
        </div>
    )
}

export const ClearHeader = ({ title, collapseButton }: { title: string, collapseButton?: React.ReactElement }) => {
    if (!title) return null
    return (
        <div className={`flex gap-x-2 items-center px-4 ${collapseButton ? "cursor-pointer hover-glow" : ""}`}>
            <Divider />
            {title}
            <Divider />
            {collapseButton && <div className="mr-2">{collapseButton}</div>}
        </div>
    )
}

export const Divider = () => <div className={"grow h-[2px] bg-section-header-line mx-1"} />
export const ItemDivider = () => <div className={"grow h-[1px] bg-table-border/50"} />

export interface SkillCardAction {
    label: string, tooltip: { title: string, content: string }, item: any, action: (e, item) => Promise<void>
}