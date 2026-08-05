import { DiceRollSchema } from "../../combat/engine/DiceRoll"
import { VagabondLiteApplication, VagabondLiteAppArgs } from "../VagabondLiteApplication"
import { AttackBuilderView } from "./AttackBuilderView"

export class AttackBuilderApp extends VagabondLiteApplication {

    actor: Actor

    constructor(actor: Actor) {
        super({
            window: { title: "Attack Builder", resizable: false },
            position: { width: 420 },
            Component: AttackBuilderView,
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