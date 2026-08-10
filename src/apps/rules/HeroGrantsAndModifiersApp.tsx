import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication"
import { HeroGrantsAndModifiersView } from "./HeroGrantsAndModifiersView"

export class HeroGrantsAndModifiersApp extends VagabondApplication {

    actor: Actor & { system: HeroDataModel }

    constructor(actor: Actor & { system: HeroDataModel }) {
        super({
            window: { title: "Grants & Modifiers" },
            position: { width: 500 },
            Component: HeroGrantsAndModifiersView,
        } as VagabondAppArgs)
        this.actor = actor
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            actor: this.actor
        }
    }

}