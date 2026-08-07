import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { VagabondLiteAppArgs, VagabondLiteApplication } from "../VagabondLiteApplication"
import { PerkSelectionView } from "./PerkSelectionView"

export class PerkSelectionApp extends VagabondLiteApplication {

    actor: Actor & { system: HeroDataModel }
    isLevelUp?: boolean

    constructor(actor: Actor & { system: HeroDataModel }, isLevelUp?: boolean) {
        super({
            window: { title: "Grants & Modifiers" },
            position: { width: 400 },
            Component: PerkSelectionView,
        } as VagabondLiteAppArgs)
        this.actor = actor
        this.isLevelUp = isLevelUp
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            actor: this.actor,
            isLevelUp: this.isLevelUp
        }
    }

}