export const SpellcastingLabel = ({ text }: { text: any }) => {
    return <p className="text-lg text-text-header-tertiary font-eskapade font-bold">{text}</p>
}

export const SpellcastingSubtext = ({ text }: { text: any }) => {
    return <div className="max-h-[56px] overflow-y-auto">
        <p className="text-sm text-text-secondary font-eskapade font-normal">{text}</p>
    </div>
}