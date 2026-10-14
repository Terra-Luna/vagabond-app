import { appLang } from "../../utils/lang"
import { centerOnFirstRender } from "../../utils/sheetUtils"
import { VagabondAppArgs,VagabondApplication } from "../VagabondApplication"
import { RollPreset } from "./model/RollPreset"
import { RollBuilderView } from "./RollBuilderView"

export class RollBuilderApp extends VagabondApplication {

    actor: Actor
    preset?: RollPreset

    constructor(actor: Actor, preset?: RollPreset) {
        super({
            window: { title: `${appLang.AttackBuilder.title}: ${actor.name}`, resizable: false },
            position: { width: 500 },
            actorId: actor.id ?? undefined,
            enforceSingleInstancePerActor: true,
            Component: RollBuilderView
        } as VagabondAppArgs)

        this.actor = actor
        this.preset = preset
    }

    override async _onRender(context, options) {
        await super._onRender(context, options)
        centerOnFirstRender(this)
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            actor: this.actor,
            preset: this.preset,
            setClosed: () => this.close()
        }
    }

}