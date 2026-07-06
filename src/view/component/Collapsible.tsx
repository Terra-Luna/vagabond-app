import { LucideChevronDown, LucideChevronUp } from "lucide-react"
import { ReactNode, useCallback, useState } from "react"
import { Header } from "./Header"

export interface CollapsibleHeaderProps {
    img?: string
    dmgType?: string
    title: string
    toggleCollapsedButton: ReactNode
    toggleCollapsed?: () => void
}
interface CollapsibleHeader {
    ({ toggleCollapsedButton, title }: CollapsibleHeaderProps): ReactNode
}

export const Collapsible = ({ img = '', dmgType = 'none', title, Header, content, startCollapsed = false, className }: {
    img?: string, dmgType?: string, title: string, Header: CollapsibleHeader, content: ReactNode, startCollapsed?: boolean, className?: string
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

export const CollapsibleSection = ({ title, content }: { title: string, content: React.ReactElement }) => {
    const [isCollapsed, setCollapsed] = useState(false)
    const toggleCollapsed = useCallback(() => {
        setCollapsed(!isCollapsed)
    }, [isCollapsed])
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