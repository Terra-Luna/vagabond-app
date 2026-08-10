import { VgLiteCombatant } from "../../combat/documents/VgLiteCombat";
import { HeroDataModel } from "../../model/actor/HeroDataModel";
import { VagabondAppArgs, VagabondApplication } from "../VagabondApplication";
import { BulkCombatantEditView } from "./BulkCombatantEditView";

export class BulkCombatantEditApp extends VagabondApplication {

    combatants: VgLiteCombatant[] = []

    constructor(combatants: VgLiteCombatant[]) {
        super({
            window: { title: "Bulk Combatant Edit" },
            position: { width: 400 },
            Component: BulkCombatantEditView,
        } as VagabondAppArgs)
        this.combatants = combatants
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            combatants: this.combatants
        }
    }
}