import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { NavigationHost } from "../../view/context/navigation/NavigationHost"
import { HeroCreationWorkflow } from "./step/HeroCreationWorkflow"

export const HeroCreationNavHostView = ({actor, setClosed}: { actor: Actor & { system: HeroDataModel }, setClosed: () => void }) => {
    return (
        <NavigationHost>
            <HeroCreationWorkflow actor={actor} setClosed={setClosed} />
        </NavigationHost>
    )
}