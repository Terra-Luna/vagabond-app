import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { VagabondLiteAppArgs, VagabondLiteApplication } from "../VagabondLiteApplication"
import { HeroCreationNavHostView } from "./HeroCreationNavHostView"

export class HeroCreationApp extends VagabondLiteApplication {

    public actor: Actor & { system: HeroDataModel }

    constructor(actor: Actor & { system: HeroDataModel }) {
        super({
            window: { title: "Create your Hero" },
            position: { height: 900, width: 1380 },
            Component: HeroCreationNavHostView
        } as VagabondLiteAppArgs)
        this.actor = actor
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            actor: this.actor,
            setClosed: () => this.close()
        }
    }

}