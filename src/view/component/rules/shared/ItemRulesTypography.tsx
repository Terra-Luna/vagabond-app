export const ItemRulesLabel = ({ text }: { text: string}) => {
    return <p className="font-eskapade font-bold text-text-primary text-base">{text}</p>
}

export const ItemRulesLabelledField = ({ label, value }: { label: string, value: string }) => {
    return (
        <div>
            <ItemRulesLabel text={label} />
            <p className="font-paradigm font-normal text-text-primary text-base">{value}</p>
        </div>
    )
}