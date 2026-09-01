import { tableBorder } from "../common/border-styles";

interface GaugeProps {
    value: number;
    max: number;
    fillColorClassName: string;
    maxColorClassName?: string;
    negativeSpaceColorClassName?: string;
    textClassName?: string;
    showText?: boolean;
    size?: 'sm' | 'md';
    rounded?: boolean;
}

export const Gauge = ({ value, max, fillColorClassName, maxColorClassName, negativeSpaceColorClassName, textClassName, showText, size = "md", rounded = true }: GaugeProps) => {
    const width = Math.min(value / max * 100, 100)
    const fillColor = (value > max) ? (maxColorClassName || fillColorClassName) : fillColorClassName
    const outerHeight = size === "sm" ? "h-[7px]" : "h-[12px]"
    const innerHeight = size === "sm" ? "h-[5px]" : "h-[10px]"

    return (
        <div className={`${outerHeight} w-full ${tableBorder} ${rounded ? 'rounded-md' : ''} flex items-center`}>
            <div
                className={fillColor + ` ${innerHeight} ${rounded ? 'rounded-md' : ''}`}
                style={{
                    width: `${width}%`, transition: "width 0.8s ease-in-out"
                }}>
            </div>
        </div>
    )
}