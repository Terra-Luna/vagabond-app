import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { VagabondLiteAppArgs, VagabondLiteApplication } from "../VagabondLiteApplication"
import { HeroCreationNavHostView } from "./HeroCreationNavHostView"

export class HeroCreationApp extends VagabondLiteApplication {

    public heroActor: Actor & { system: HeroDataModel }

    constructor(heroActor: Actor & { system: HeroDataModel }) {
        super({
            window: { title: "Create your Hero" },
            position: { height: 990, width: 650 },
            Component: HeroCreationNavHostView
        } as VagabondLiteAppArgs)
        this.heroActor = heroActor
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            actor: this.heroActor,
            setClosed: () => this.close()
        }
    }

}