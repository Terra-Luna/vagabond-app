import { ReactNode } from "react"

export const DynamicGrid = ({ children, wideMode }: { children: ReactNode, wideMode?: boolean }) => {
    return (
        <div className={
            `grid gap-1 items-center ${wideMode
                ? "grid-cols-[repeat(auto-fit,minmax(300px,1fr))]"
                : "grid-cols-[repeat(auto-fit,minmax(150px,1fr))]"}`
        }>
            {children}
        </div>
    )
}