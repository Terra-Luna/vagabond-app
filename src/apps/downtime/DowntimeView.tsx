import { HeroDataModel } from "../../model/actor/HeroDataModel"

export const DowntimeView = ({ onCancel, actor }: {
    onCancel: () => void,
    actor: Actor & { system: HeroDataModel }
}) => {

    return (
        <>Downtime!</>
    )
}