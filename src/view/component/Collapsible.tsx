import { LucideChevronDown, LucideChevronUp } from "lucide-react";
import { ReactNode, useCallback, useState } from "react";

export interface CollapsibleHeaderProps {
    toggleCollapsedButton: ReactNode;
    title: string;
}
interface CollapsibleHeader {
    ({ toggleCollapsedButton, title }: CollapsibleHeaderProps): ReactNode;
}

export const Collapsible = ({ title, Header, content, startCollapsed = false }: { title: string, Header: CollapsibleHeader, content: ReactNode, startCollapsed?: boolean }) => {
    const [isCollapsed, setCollapsed] = useState(startCollapsed);
    const toggleCollapsed = useCallback(() => {
        setCollapsed(!isCollapsed);
    }, [isCollapsed])

    return (
        <div className={isCollapsed ? "vglite-collapsed" : ""}>
            <Header title={title} toggleCollapsedButton={<button onClick={toggleCollapsed}><ToggleCollapseIcon isCollapsed={isCollapsed} /></button>} />
            {isCollapsed ? <></> : content}
        </div>
    )
}

const ToggleCollapseIcon = ({ isCollapsed }: { isCollapsed: boolean }) => {
    if (isCollapsed) return <LucideChevronDown />;
    return <LucideChevronUp />
}