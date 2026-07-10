import { HeroDataModel } from "../../../../../model/actor/HeroDataModel"
import { useNameAndAncestry } from "./component/NameAndAncestry"

export const HeroCreator = ({ hero }: { hero: Actor & { system: HeroDataModel } }) => {
    const { NameAndAncestry } = useNameAndAncestry(hero)

    return (
        <div className="text-text-primary text-lg font-eskapade space-y-2">
            <NameAndAncestry />


        </div>
    )

}