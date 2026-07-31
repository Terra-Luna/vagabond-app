import { AdversaryDataModel } from "../../model/actor/AdversaryDataModel"
import { DamageRoll } from "./DamageRoll"
import { DiceRoll } from "./util/dice-utils"
import { Attack } from "./Attack"

export interface AdversaryAttackArgs { attackName: string, dmgType: string, dice: DiceRoll[] }

export class AdversaryAttack extends Attack {

    override actor: Actor & { system: AdversaryDataModel }
    override targetIds: string[]

    constructor(
        actor: Actor & { system: AdversaryDataModel },
        args: AdversaryAttackArgs,
        targetIds?: string[]
    ) {
        super(args.attackName)
        this.actor = actor
        this.targetIds = targetIds ?? []
        this.damageRoll = new DamageRoll({
            atkName: args.attackName,
            dmgType: args.dmgType,
            dice: args.dice
        })
    }
    
}