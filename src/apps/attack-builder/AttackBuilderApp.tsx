import { DiceRollSchema } from "../../combat/engine/DiceRoll"
import { VagabondLiteApplication, VagabondLiteAppArgs } from "../VagabondLiteApplication"
import { AttackBuilderView } from "./AttackBuilderView"

export class AttackBuilderApp extends VagabondLiteApplication {

    actor: Actor
    preset?: AttackPreset

    constructor(actor: Actor, preset?: AttackPreset) {
        super({
            window: { title: "Attack Builder", resizable: false },
            position: { width: 420 },
            Component: AttackBuilderView,
        } as VagabondLiteAppArgs)

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

export interface AttackPreset {
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