export const HeroCreationLabel = ({ text }: { text: string }) => {
    return <p className="text-xl text-text-primary font-eskapade font-bold">{text}</p>
}

export const HeroCreationSubLabel = ({ text }: { text: string }) => {
    return <p className="text-lg text-text-primary font-eskapade font-bold">{text}</p>
}

export const HeroCreationValue = ({ text }: { text: string }) => {
    return <p className="text-lg text-text-primary font-paradigm font-bold">{text}</p>
}

export const HeroCreationSubtext = ({ text }: { text: string }) => {
    return <p className="text-base text-text-secondary font-paradigm font-normal">{text}</p>
}

export const HeroCreationSuccessMessage = ({ text }: { text: string }) => {
    return <p className="text-base text-text-luck-current font-paradigm font-bold">{text}</p>
}

export const HeroCreationLabeledField = ({ label, value }: { label: string, value: string }) => {
    return (
        <div>
            <HeroCreationLabel text={label} />
            <p className="text-base text-text-secondary font-paradigm font-normal">{value}</p>
        </div>
    )
}