import { AdversaryDataModel } from "../../../model/actor/AdversaryDataModel"
import { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { NpcDataModel } from "../../../model/actor/NpcDataModel"
import { centerOnFirstRender } from "../../../utils/sheetUtils"
import { VagabondAppArgs, VagabondApplication } from "../../VagabondApplication"
import { PolymorphAppView } from "./PolymorphAppView"

export class PolymorphApp extends VagabondApplication {

    private caster: Actor & { system: HeroDataModel | AdversaryDataModel | NpcDataModel }

    constructor({ caster }: {
        caster: Actor & { system: HeroDataModel | AdversaryDataModel | NpcDataModel }
    }) {
        super({
            window: { title: "Polymorph: " + caster.name },
            position: { width: 280, height: "auto" },
            actorId: caster.id,
            enforceSingleInstancePerActor: true,
            Component: PolymorphAppView
        } as VagabondAppArgs)
        this.caster = caster
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            caster: this.caster
        }
    }

    override async _onRender(context, options) {
        await super._onRender(context, options)
        centerOnFirstRender(this, 200)
    }

}