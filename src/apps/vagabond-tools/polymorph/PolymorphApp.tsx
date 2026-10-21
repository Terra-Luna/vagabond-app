import { AdversaryDataModel } from "../../../model/actor/AdversaryDataModel"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { NpcDataModel } from "../../../model/actor/NpcDataModel"
import { centerOnFirstRender } from "../../../utils/sheetUtils"
import { VagabondAppArgs, VagabondApplication } from "../../VagabondApplication"
import { PolymorphAppView } from "./PolymorphAppView"

export class PolymorphApp extends VagabondApplication {
    
    private actor: Actor & { system: HeroDataModel | AdversaryDataModel | NpcDataModel }

    constructor(actor: Actor & { system: HeroDataModel | AdversaryDataModel | NpcDataModel }) {
        super({
            window: { title: "Polymorph: " + actor.name },
            position: { width: 280 },
            Component: PolymorphAppView
        } as VagabondAppArgs)
        this.actor = actor
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            actor: this.actor
        }
    }

    override async _onRender(context, options) {
        await super._onRender(context, options)
        centerOnFirstRender(this, 200)
    }

}