export const HeroCreationLabel = ({ text }: { text: string }) => {
    return <p className="text-lg text-text-primary font-eskapade font-bold">{text}</p>
}

export const HeroCreationLabeledField = ({ label, value }: { label: string, value: string }) => {
    return (
        <div>
            <HeroCreationLabel text={label} />
            <p className="text-base text-text-secondary font-paradigm font-normal">{value}</p>
        </div>
    )
}