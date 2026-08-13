export const ClassSheetSectionHeader = ( { text }: { text: string }) => {
    return (
        <p className="text-2xl text-text-header-tertiary font-eskapade font-bold">{text}</p>
    )
}

export const ClassSheetLabel = ({ text }: { text: string }) => {
    return (
        <p className="text-sm font-paradigm font-bold">{text}</p>
    )
}

export const ClassSheetText = ({ text }: { text: string }) => {
    return (
        <p className="text-sm font-paradigm font-normal">{text}</p>
    )
}