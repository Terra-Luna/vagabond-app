import { DiceRollSchema } from "../../combat/engine/DiceRoll"
import { VagabondApplication, VagabondAppArgs } from "../VagabondApplication"
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

export interface RollPreset {
    title: string, description: string,
    weaponId: string,
    skill: string,
    d20Count: number,
    favorHinder: 'none' | 'favor' | 'hinder',
    skillCheckMod: number,
    critThreshold: number,
    damageRolls: DiceRollSchema[],
    flatModifier: number,
    perDieBonus: number,
    armorPiercing: number
}