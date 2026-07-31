import { LucideChevronDown, LucideChevronUp } from "lucide-react"
import { ReactNode, useCallback, useState } from "react"
import { Header } from "./Header"
import { fields } from "../../model/common/sharedSchemas"

export interface CollapsibleHeaderProps {
    img?: string
    dmgType?: string
    title: string
    toggleCollapsedButton?: ReactNode
    toggleCollapsed?: () => void
}
interface CollapsibleHeader {
    ({ toggleCollapsedButton, title }: CollapsibleHeaderProps): ReactNode
}

export const Collapsible = ({ img = '', dmgType = 'none', title, Header, content, startCollapsed = false, className, settingsKey }: {
    img?: string, dmgType?: string, title: string, Header: CollapsibleHeader, content: ReactNode, startCollapsed?: boolean, className?: string, settingsKey?: string
}) => {
    const [isCollapsed, setCollapsed] = useState(startCollapsed)
    const toggleCollapsed = useCallback(() => {
        setCollapsed(!isCollapsed)
    }, [isCollapsed])
    return (
        <div className={className}>
            <Header img={img} dmgType={dmgType} title={title} toggleCollapsed={toggleCollapsed} toggleCollapsedButton={
                <button onClick={toggleCollapsed}><ToggleCollapseIcon isCollapsed={isCollapsed} /></button>
            } />
            {isCollapsed ? <></> : content}
        </div>
    )
}

export const CollapsibleSection = ({ title, content, settingsKey, startCollapsed = false }: { title: string, content: React.ReactElement, settingsKey?: string, startCollapsed?: boolean }) => {
    let initialCollapsedValue = startCollapsed
    const settings = (game.settings! as any)
    if (settingsKey) {
        settings.register("vagabond-lite", settingsKey, {
            name: "Hero Sheet Skills Collapsed",
            hint: "Hero Sheet Skills start collapsed",
            scope: "client",
            type: new fields.BooleanField(),
            default: false
        })

        initialCollapsedValue = settings.get("vagabond-lite", settingsKey)
    }
    const [isCollapsed, setCollapsed] = useState(initialCollapsedValue)
    const toggleCollapsed = useCallback(() => {
        const newVal = !isCollapsed
        if (settingsKey) {
            settings.set("vagabond-lite", settingsKey, newVal)
        }
        setCollapsed(newVal)
    }, [isCollapsed, settingsKey])
    return (
        <div>
            <div onClick={toggleCollapsed}>
                <Header title={title} collapseButton={<ToggleCollapseIcon isCollapsed={isCollapsed} />} />
            </div>
            {isCollapsed ? <></> : content}
        </div>
    )
}

const ToggleCollapseIcon = ({ isCollapsed }: { isCollapsed: boolean }) => {
    return isCollapsed ? <LucideChevronDown /> : <LucideChevronUp />
}