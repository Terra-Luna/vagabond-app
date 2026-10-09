import { DiceRollSchema } from "./DieRollSchema"

export interface RollPreset {
    id: string,
    title: string, description: string,
    weaponId: string,
    skill: string,
    d20Count: number,
    favorHinder: 'none' | 'favor' | 'hinder',
    bonusSkillCheckDice?: number[],
    skillCheckMod: number,
    critThreshold: number,
    critSum: boolean,
    explodeFavor: boolean,
    damageRolls: DiceRollSchema[],
    flatModifier: number,
    perDieBonus: number,
    armorPiercing: number
}