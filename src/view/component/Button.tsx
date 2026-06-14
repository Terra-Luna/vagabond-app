// todo combine the 3 button files into this one

import { ReactNode } from "react"
import { glowOnHover } from "../sheets/VgLiteSheet"

export const Button = ({ className, children, onClick }: { className?: string, onClick: () => any, children: ReactNode }) => {
    return (
        <button onClick={onClick} className={`cursor-pointer ${glowOnHover} ${className} border border-solid`}>
            {children}
        </button>
    )
}