import { ReactNode } from "react"

export const DynamicGrid = ({ children, widthIncrement = 1, itemsStart }: { children: ReactNode, widthIncrement?: 1 | 2 | 3 | 4, itemsStart?: boolean }) => {
    return (
        <div className={
            `grid gap-1 ${itemsStart ? "items-start" : "items-center"} ${widthIncrement === 1
                ? "grid-cols-[repeat(auto-fit,minmax(150px,1fr))]"
                : widthIncrement === 2 ? `grid-cols-[repeat(auto-fit,minmax(300px,1fr))]`
                    : widthIncrement === 3 ? `grid-cols-[repeat(auto-fit,minmax(450px,1fr))]`
                        : `grid-cols-[repeat(auto-fit,minmax(600px,1fr))]`}`
        }>
            {children}
        </div>
    )
}