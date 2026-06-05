import { LucideChevronDown, LucideChevronUp } from "lucide-react"
import { ReactNode, useCallback, useState } from "react"

export interface CollapsibleHeaderProps {
    title: string
    isCollapsed: boolean
    toggleCollapsedButton: ReactNode
    toggleCollapsed?: () => void
}
interface CollapsibleHeader {
    ({ toggleCollapsedButton, title }: CollapsibleHeaderProps): ReactNode
}

export const Collapsible = ({ title, Header, content, startCollapsed = false }: { title: string, Header: CollapsibleHeader, content: ReactNode, startCollapsed?: boolean }) => {
    const [isCollapsed, setCollapsed] = useState(startCollapsed)
    const toggleCollapsed = useCallback(() => {
        setCollapsed(!isCollapsed)
    }, [isCollapsed])
    return (
        <div>
            <Header title={title} isCollapsed={isCollapsed} toggleCollapsed={toggleCollapsed} toggleCollapsedButton={
                <button onClick={toggleCollapsed}><ToggleCollapseIcon isCollapsed={isCollapsed} /></button>
            } />
            {isCollapsed ? <></> : content}
        </div>
    )
}

const ToggleCollapseIcon = ({ isCollapsed }: { isCollapsed: boolean }) => {
    if (isCollapsed) return <LucideChevronDown />
    return <LucideChevronUp />
}