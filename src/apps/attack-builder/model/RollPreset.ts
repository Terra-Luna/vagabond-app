import { DiceRollSchema } from "./DieRollSchema"

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