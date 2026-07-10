export const HeroCreationLabel = ({ text }: { text: string }) => {
    return <p className="text-base text-header-text-tertiary font-eskapade font-bold">{text}</p>
}

export const HeroCreationLabeledField = ({ label, value }: { label: string, value: string }) => {
    return (
        <div>
            <HeroCreationLabel text={label} />
            <p className="text-base text-text-secondary font-paradigm font-normal">{value}</p>
        </div>
    )
}