import { useDimensions } from "./context/DimensionsContext";

const BREAKPOINT = 600;

interface UseBreakpointsArgs {
    sm?: number;
    lg: number;
}
export const useSmallLarge = ({ sm, lg }: UseBreakpointsArgs) => {
    const dimensions = useDimensions()
    if (dimensions.width > BREAKPOINT) {
        return `vglite-col-${lg}`
    }
    else if (sm) {
        return `vglite-col-${sm}`
    }
    else {
        return `vglite-col-12`
    }
}