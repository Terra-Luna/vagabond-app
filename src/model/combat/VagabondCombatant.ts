import { HeroDataModel } from "../actor/HeroDataModel";
import fields = foundry.data.fields;
import { VagabondCombatant } from "../../combat/documents/VagabondCombat";
import { AdversaryDataModel } from "../actor/AdversaryDataModel";

type VagabondCombatantModelSchema = ReturnType<typeof defineSchema>;

export type VagabondCombatantInstance = InstanceType<typeof VagabondCombatModel>
export const COMBAT_GROUPS = ['heroes', 'adversaries', 'npcs'] as const
export type CombatGroup = typeof COMBAT_GROUPS[number]

const defineSchema = () => {
    return {
        activations: new fields.SchemaField({
            value: new fields.NumberField({ integer: true }),
            max: new fields.NumberField({ integer: true }),
        }),
        combatGroup: new fields.StringField({ choices: ['heroes', 'adversaries', 'npcs'] }),
    };
};

export class VagabondCombatModel extends foundry.abstract.TypeDataModel<
    VagabondCombatantModelSchema,
    Combatant.Implementation
> {
    hookId: number | undefined = undefined;

    static defineSchema() {
        return defineSchema();
    }

    prepareBaseData(): void {
        const activations = foundry.utils.getProperty(this.parent.actor?.getRollData() ?? {}, "activations") as number;
        this.activations.max ??= activations ?? 1;
        this.activations.value ??= this.parent.combat?.started ? this.activations.max : 0;
        if (game.actors && this.parent.actorId) {
            const parentActor = game.actors.get(this.parent.actorId)
            if (parentActor) {
                if (parentActor.system instanceof HeroDataModel) {
                    this.combatGroup = "heroes"
                } else if (parentActor.system instanceof AdversaryDataModel) {
                    this.combatGroup = "adversaries"
                } else {
                    this.combatGroup = "npcs"
                }
            }
        }

        (this.parent as VagabondCombatant).updateBurningStatus()
    }
}