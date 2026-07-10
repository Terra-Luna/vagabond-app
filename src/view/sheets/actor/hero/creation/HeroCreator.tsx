import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { useNameAndAncestry } from "./component/NameAndAncestry"

export const HeroCreator = ({ hero }: { hero: Actor & { system: HeroDataModel } }) => {
    const { NameAndAncestry } = useNameAndAncestry(hero)

    return (
        <div>
            <NameAndAncestry />
        </div>
    )

}