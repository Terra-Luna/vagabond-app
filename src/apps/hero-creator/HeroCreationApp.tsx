import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { appLang } from "../../utils/lang"
import { centerOnFirstRender } from "../../utils/sheetUtils"
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication"
import { HeroCreationNavHostView } from "./HeroCreationNavHostView"

export class HeroCreationApp extends VagabondApplication {

    public actor: Actor & { system: HeroDataModel }

    constructor(actor: Actor & { system: HeroDataModel }) {
        super({
            window: { title: `${appLang.HeroChoices.createHero}: ${actor.name}` },
            position: { height: 780, width: 1190 },
            actorId: actor.id,
            enforceSingleInstancePerActor: true,
            Component: HeroCreationNavHostView
        } as VagabondAppArgs)
        this.actor = actor
    }

    override async _onRender(context, options) {
        await super._onRender(context, options)
        centerOnFirstRender(this, 200)
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            actor: this.actor,
            setClosed: () => this.close()
        }
    }

}