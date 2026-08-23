import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication"
import { usePerkSelectionView } from "./PerkSelectionView"

export class PerkSelectionApp extends VagabondApplication {

    actor: Actor & { system: HeroDataModel }
    isLevelUp?: boolean

    constructor(actor: Actor & { system: HeroDataModel }, isLevelUp?: boolean) {
        super({
            window: { title: "Grants & Modifiers" },
            position: { width: 800, height: 900 },
            Component: () => {
                const { PerkSelection, bonusChoicesByPerk } = usePerkSelectionView(actor, isLevelUp)
                return <div className="flex flex-col min-h-0 w-full p-1 mb-4 overflow-y-auto">
                    <PerkSelection bonusChoices={bonusChoicesByPerk} />
                </div>
            }
        } as VagabondAppArgs)
        this.actor = actor
        this.isLevelUp = isLevelUp
    }

}