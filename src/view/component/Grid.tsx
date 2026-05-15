import { CSSProperties, ReactNode } from "react";
import { useSmallLarge } from "../hooks"

export const GridRow = ({ children }) => <div className="vglite-row">{children}</div>


interface GridItemProps {
    children: ReactNode;
    sm?: number;
    lg: number;
    className?: string;
    style?: CSSProperties;
}
export const GridItem = ({ children, sm, lg, className, ...rest }: GridItemProps & Partial<React.HTMLAttributes<HTMLDivElement>>) => <div
    className={useSmallLarge({ sm, lg }) + className ? (" " + className) : ""}
    {...rest}>
    {children}
</div>