import fields = foundry.data.fields;

type VagabondCombatantModelSchema = ReturnType<typeof defineSchema>;

export type VagabondCombatantInstance = InstanceType<typeof VagabondCombatantModel>
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

export class VagabondCombatantModel extends foundry.abstract.TypeDataModel<
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
            const disposition = this.parent.token?.disposition
            if (disposition === 1) {
                this.combatGroup = "heroes"
            } else if (disposition === -1) {
                this.combatGroup = "adversaries"
            } else {
                this.combatGroup = "npcs"
            }
        }
    }
}