import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication"
import { HeroCreationNavHostView } from "./HeroCreationNavHostView"

export class HeroCreationApp extends VagabondApplication {

    public actor: Actor & { system: HeroDataModel }

    constructor(actor: Actor & { system: HeroDataModel }) {
        super({
            window: {
                title: "Create your Hero"
            },
            position: {
                height: 900, width: 1380, top: 0, left: 60
            },
            Component: HeroCreationNavHostView
        } as VagabondAppArgs)
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