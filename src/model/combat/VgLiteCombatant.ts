import { HeroDataModel } from "../actor/HeroDataModel";
import fields = foundry.data.fields;
import { AdversaryDataModel } from "../actor/AdversaryDataModel";

type VgLiteCombatantModelSchema = ReturnType<typeof defineSchema>;

export type VgLiteCombatantInstance = InstanceType<typeof VGLiteCombatantModel>
const COMBAT_GROUPS = ['heroes', 'adversaries', 'npcs'] as const
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

export class VGLiteCombatantModel extends foundry.abstract.TypeDataModel<
    VgLiteCombatantModelSchema,
    Combatant.Implementation
> {
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
    }
}