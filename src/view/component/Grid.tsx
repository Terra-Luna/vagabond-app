import { CSSProperties, ReactNode } from "react";
import { useSmallLarge } from "../hooks"

export const GridRow = ({ children, ...rest }: { children: ReactNode } & Partial<React.HTMLAttributes<HTMLDivElement>>) => <div className="vglite-row" {...rest}>{children}</div>

interface GridItemProps {
    children: ReactNode;
    sm?: number;
    lg: number;
    className?: string;
    style?: CSSProperties;
}
export const GridItem = ({ children, sm, lg, className, ...rest }: GridItemProps & Partial<React.HTMLAttributes<HTMLDivElement>>) => <div
    className={useSmallLarge({ sm, lg }) + (className ? (" " + className) : "")}
    {...rest}>
    {children}
</div>