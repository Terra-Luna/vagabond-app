import { VagabondApplication, VagabondAppArgs } from "../VagabondApplication"
import { RollPreset } from "./model/RollPreset"
import { RollBuilderView } from "./RollBuilderView"

export class RollBuilderApp extends VagabondApplication {

    actor: Actor
    preset?: RollPreset

    constructor(actor: Actor, preset?: RollPreset) {
        super({
            window: { title: "Roll Builder", resizable: false },
            position: { width: 420 },
            Component: RollBuilderView,
        } as VagabondAppArgs)

        this.actor = actor
        this.preset = preset
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