import { VgLiteCombatant } from "../../combat/documents/VgLiteCombat";
import { HeroDataModel } from "../../model/actor/HeroDataModel";
import { VagabondLiteAppArgs, VagabondLiteApplication } from "../VagabondLiteApplication";
import { BulkCombatantEditView } from "./BulkCombatantEditView";

export class BulkCombatantEditApp extends VagabondLiteApplication {

    combatants: VgLiteCombatant[] = []

    constructor(combatants: VgLiteCombatant[]) {
        super({
            window: { title: "Bulk Combatant Edit" },
            position: { width: 400 },
            Component: BulkCombatantEditView,
        } as VagabondLiteAppArgs)
        this.combatants = combatants
    }

    override getReactProps() {
        return {
            ...super.getReactProps(),
            combatants: this.combatants
        }
    }
}