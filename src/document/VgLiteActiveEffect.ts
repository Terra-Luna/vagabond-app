/**
Systemic bonuses:
    Name: should match the accessor-operator path.
    Description: User-friendly description to help users set up Active Effects.
    
Documentation: https://foundryvtt.com/article/active-effects/

//List Actor paths:
const types = Actor.implementation.TYPES
const shells = types.map( t => new Actor.implementation({name: t, type: t}))
shells.forEach( s => console.log(`'${s.type}'`, 'type Actors have the following attribute keys available:\nsystem.\n', s.toObject().system))
 
//List Item paths:
const types = Item.implementation.TYPES
const shells = types.map( t => new Item.implementation({name: t, type: t}))
shells.forEach( s => console.log(`'${s.type}'`, 'type Items have the following attribute keys available:\nsystem.\n', s.toObject().system))

//Create an ActiveEffect
const doc = game.items.getName("Backpack")
const effectData = {
	name: 'Backpack',
	origin: doc.uuid,
	changes: [
		{ key: 'system.inventory.capacity', mode: '2', value: 2, priority: 20 }
	],
	disabled: false,
    transfer: true
}
await doc.createEmbeddedDocuments('ActiveEffect', [effectData])

*/

/**
 * The static effects' names and descriptions can be displayed to a GM user when configuring
 * active effects for Classes, Ancestries, Equipment, etc... On-save, the path property can 
 * be used to apply the effect via #addActiveEffect(), below.
 */
export class VgLiteActiveEffect<SubType extends ActiveEffect.SubType = ActiveEffect.SubType> extends ActiveEffect<SubType> {

    static statusEffects = [
        {
            _id: "vgliteberserk000",
            id: "berserk",
            name: "VGLITE.StatusConditions.berserk.name",
            img: "icons/svg/explosion.svg",
            changes: [{ key: "system.statuses.berserk", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vgliteblinded000",
            id: "blinded",
            name: "VGLITE.StatusConditions.blinded.name",
            img: "icons/svg/blind.svg",
            changes: [
                { key: "system.statuses.blinded", mode: "OVERRIDE", value: "true" },
                { key: "system.statuses.vulnerable", mode: "OVERRIDE", value: "true" }
            ]
        },
        {
            _id: "vgliteburning000",
            id: "burning",
            name: "VGLITE.StatusConditions.burning.name",
            img: "icons/svg/fire.svg",
            changes: [
                { key: "system.statuses.stacks.burning", mode: "ADD", value: JSON.stringify({ duration: "Cd4", damageType: "fire" }) }
            ]
        },
        {
            _id: "vglitecharmed000",
            id: "charmed",
            name: "VGLITE.StatusConditions.charmed.name",
            img: "icons/svg/heal.svg",
            changes: [{ key: "system.statuses.charmed", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vgliteconfused00",
            id: "confused",
            name: "VGLITE.StatusConditions.confused.name",
            img: "icons/svg/stoned.svg",
            changes: [{ key: "system.statuses.confused", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vglitedazed00000",
            id: "dazed",
            name: "VGLITE.StatusConditions.dazed.name",
            img: "icons/svg/daze.svg",
            changes: [{ key: "system.statuses.dazed", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vglitefatigued00",
            id: "fatigued",
            name: "VGLITE.StatusConditions.fatigued.name",
            img: "icons/svg/downgrade.svg",
            changes: [{ key: "system.counters.fatigue", mode: "ADD", value: "1" }]
        },
        {
            _id: "vglitefrighten00",
            id: "frightened",
            name: "VGLITE.StatusConditions.frightened.name",
            img: "icons/svg/terror.svg",
            changes: [
                { key: "system.statuses.frightened", mode: "OVERRIDE", value: "true" },
                { key: "system.modifiers.damage.all", mode: "ADD", value: "-2" }
            ]
        },
        {
            _id: "vgliteincapacit0",
            id: "incapacitated",
            name: "VGLITE.StatusConditions.incapacitated.name",
            img: "icons/svg/falling.svg",
            changes: [
                { key: "system.statuses.incapacitated", mode: "OVERRIDE", value: "true" },
                { key: "system.statuses.vulnerable", mode: "OVERRIDE", value: "true" }
            ]
        },
        {
            _id: "vgliteinvisible0",
            id: "invisible",
            name: "VGLITE.StatusConditions.invisible.name",
            img: "icons/svg/invisible.svg",
            changes: [{ key: "system.statuses.invisible", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vgliteparalyzed0",
            id: "paralyzed",
            name: "VGLITE.StatusConditions.paralyzed.name",
            img: "icons/svg/paralysis.svg",
            changes: [
                { key: "system.statuses.paralyzed", mode: "OVERRIDE", value: "true" },
                { key: "system.statuses.incapacitated", mode: "OVERRIDE", value: "true" },
                { key: "system.attributes.speed.value", mode: "OVERRIDE", value: "0" }
            ]
        },
        {
            _id: "vgliteprone00000",
            id: "prone",
            name: "VGLITE.StatusConditions.prone.name",
            img: "icons/svg/wall-direction.svg",
            changes: [{ key: "system.statuses.prone", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vgliterestrained",
            id: "restrained",
            name: "VGLITE.StatusConditions.restrained.name",
            img: "icons/svg/net.svg",
            changes: [
                { key: "system.statuses.restrained", mode: "OVERRIDE", value: "true" },
                { key: "system.statuses.vulnerable", mode: "OVERRIDE", value: "true" },
                { key: "system.attributes.speed.value", mode: "OVERRIDE", value: "0" }
            ]
        },
        {
            _id: "vglitesickened00",
            id: "sickened",
            name: "VGLITE.StatusConditions.sickened.name",
            img: "icons/svg/poison.svg",
            changes: [
                { key: "system.statuses.sickened", mode: "OVERRIDE", value: "true" },
                { key: "system.modifiers.healing.in", mode: "ADD", value: "-2" }
            ]
        },
        {
            _id: "vglitesuffocatin",
            id: "suffocating",
            name: "VGLITE.StatusConditions.suffocating.name",
            img: "icons/svg/silenced.svg",
            changes: [{ key: "system.statuses.suffocating", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vgliteunconsciou",
            id: "unconscious",
            name: "VGLITE.StatusConditions.unconscious.name",
            img: "icons/svg/unconscious.svg",
            changes: [
                { key: "system.statuses.unconscious", mode: "OVERRIDE", value: "true" },
                { key: "system.statuses.blinded", mode: "OVERRIDE", value: "true" },
                { key: "system.statuses.incapacitated", mode: "OVERRIDE", value: "true" },
                { key: "system.statuses.prone", mode: "OVERRIDE", value: "true" }
            ]
        },
        {
            _id: "vglitevulnerable",
            id: "vulnerable",
            name: "VGLITE.StatusConditions.vulnerable.name",
            img: "icons/svg/target.svg",
            changes: [{ key: "system.statuses.vulnerable", mode: "OVERRIDE", value: "true" }]
        },
        {
            _id: "vglitedead000000",
            id: "dead",
            name: "VGLITE.StatusConditions.dead.name",
            img: "icons/svg/skull.svg"
        }
    ]

    /**
     * Intercepts when an effect is created so the canvas scrolling text 
     * for modifications and token status updates reads correctly.
     */
    protected override _onCreate(data: any, options: any, userId: string): void {
        if (userId === game.userId && game.i18n?.has(this.name)) {
            const rawName = this.name;
            (this as any).name = game.i18n.localize(rawName)
            super._onCreate(data, options, userId);
            (this as any).name = rawName
        }
        else {
            super._onCreate(data, options, userId)
        }
    }

    /**
     * Intercepts when an effect is modified (like toggling it back on) so the 
     * canvas scrolling text for modifications and token status updates reads
     * correctly.
     */
    protected override _onUpdate(changed: any, options: any, userId: string): void {
        if (userId === game.userId && game.i18n?.has(this.name)) {
            const rawName = this.name;
            (this as any).name = game.i18n.localize(rawName);
            super._onUpdate(changed, options, userId);
            (this as any).name = rawName
        }
        else {
            super._onUpdate(changed, options, userId);
        }
    }

    static override async fromStatusEffect(statusId: string, options: Record<string, any> = {}): Promise<any> {
        const statusBlueprint = this.statusEffects.find(e => e.id === statusId)
        if (!statusBlueprint) return super.fromStatusEffect(statusId, options)

        // Handle special stackable burning effect!
        // Duration & damageType are embedded into the options arg as: { duration: "CdX", damageType: "fire" }
        if (statusId === "burning") {
            const createData = foundry.utils.deepClone(statusBlueprint)
            createData._id = foundry.utils.randomID(16)
            const duration = options.duration || "Cd4"
            const dmgType = options.damageType || "fire"

            const stackChange = createData?.changes?.find(
                (c: any) => c.key === "system.statuses.stacks.burning"
            )

            if (stackChange) {
                stackChange.value = JSON.stringify({
                    duration: duration,
                    damageType: dmgType,
                    sourceUuid: options.origin || ""
                })
            }

            const effectInstance = new this(createData as any, options)
            return effectInstance
        }

        return super.fromStatusEffect(statusId, options)
    }

}