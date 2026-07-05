import { LucideChevronDown, LucideChevronUp } from "lucide-react"
import { ReactNode, useCallback, useState } from "react"

export interface CollapsibleHeaderProps {
    img?: string
    title: string
    toggleCollapsedButton: ReactNode
    toggleCollapsed?: () => void
}
interface CollapsibleHeader {
    ({ toggleCollapsedButton, title }: CollapsibleHeaderProps): ReactNode
}

export const Collapsible = ({ img = '', title, Header, content, startCollapsed = false, className }: {
    img: string, title: string, Header: CollapsibleHeader, content: ReactNode, startCollapsed?: boolean, className?: string
}) => {
    const [isCollapsed, setCollapsed] = useState(startCollapsed)
    const toggleCollapsed = useCallback(() => {
        setCollapsed(!isCollapsed)
    }, [isCollapsed])
    return (
        <div className={className}>
            <Header img={img} title={title} toggleCollapsed={toggleCollapsed} toggleCollapsedButton={
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