import { ReactNode } from "react"
import { Button } from "./Button"

export const ButtonWithIcon = ({ className, onClick, icon, label }: { className?: string, onClick: () => any, icon: ReactNode, label: string }) => {
    return <Button className={`flex ${className}`} onClick={onClick}>
        {icon}
        {label}
    </Button>
}