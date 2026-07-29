import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { VagabondLiteAppArgs, VagabondLiteApplication } from "../VagabondLiteApplication"
import { HeroGrantsAndModifiersView } from "./HeroGrantsAndModifiersView"

export class HeroGrantsAndModifiersApp extends VagabondLiteApplication {

    actor: Actor & { system: HeroDataModel }

    constructor(actor: Actor & { system: HeroDataModel }) {
        super({
            window: { title: "Grants & Modifiers" },
            position: { width: 500 },
            Component: HeroGrantsAndModifiersView,
        } as VagabondLiteAppArgs)
        this.actor = actor
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            actor: this.actor
        }
    }

}