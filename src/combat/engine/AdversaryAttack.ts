import { AdversaryDataModel } from "../../model/actor/AdversaryDataModel"
import { Attack } from "./Attack"
import { DiceRoll } from "./util/dice-utils"

export interface AdversaryAttackArgs { attackName: string, dice: DiceRoll[] }

export class AdversaryAttack extends Attack {

    override actor: Actor & { system: AdversaryDataModel }
    override targets: Token[] | undefined

    constructor(
        actor: Actor & { system: AdversaryDataModel },
        args: AdversaryAttackArgs,
        targets?: Token[]
    ) {
        super()
        this.actor = actor
        this.targets = targets
        this.attackName = args.attackName
        this.damageDice = args.dice
    }
    
}