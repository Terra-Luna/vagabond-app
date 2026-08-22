import { ReactNode } from "react";

export type TypographyVariant = 'subheader' | 'header';

export const Typography = ({ children, variant }: { children: ReactNode, variant: TypographyVariant }) => {
    // based on variant, determine the component we're rendering
    const Component = variant === 'header' ? SubHeaderText // todo make "HeaderText"
        : variant === 'subheader' ? SubHeaderText : undefined;

    if (Component) {
        return <Component>{children}</Component>
    }

    return undefined;
}

const SubHeaderText = ({ children }: { children: ReactNode }) => (
    <span className="text-xl font-bold font-eskapade">{children}</span>
)