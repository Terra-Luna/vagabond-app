import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { PerkDataModel } from "../../model/item/character/PerkDataModel"
import { SpellDataModel } from "../../model/item/character/SpellDataModel"
import { ItemsCache } from "./ItemsCache"

export class PerkRulesSelectionsApplicator {

    /**
     * Reads all the Actor's virtual perk items and applies their rules' choice selections.
     */
    static apply(actor: Actor & { system: HeroDataModel }) {
        actor.system.spells = []
        actor.system.perks = []

        const activeRules = actor.system.getActiveRules()
        const perkSelections = actor.flags["vagabond-lite"]?.perkSelections ?? {}

        const itemRuleSelections = [
            ...activeRules.filter(r => r.key === "ChoiceSet" && r.channel === "item").flatMap(r => r.selections),
            ...Object.values(perkSelections).deepFlatten()
        ]

        const itemGrantRules = activeRules.filter(r => r.key === "GrantItem" && (r.type === "spell" || r.type === "perk"))
        const itemIds = [...itemRuleSelections, ...itemGrantRules.map(r => r.uuid)]

        const items: any[] = []
        itemIds.forEach(id => {
            const cachedItem = ItemsCache.items.get(id)
            if (cachedItem) items.push(cachedItem)
        })

        for (const fullItem of items) {
            if (fullItem.type === 'spell' || fullItem.type === 'perk') {

                if (fullItem.system instanceof SpellDataModel) {
                    if (actor.system.spells.some(sp => (sp as any)._sourceId === fullItem.uuid)) continue
                }

                const systemClone = foundry.utils.deepClone(fullItem.system.toObject())

                if (fullItem.system instanceof PerkDataModel) {
                    systemClone.rules.forEach(rule => {
                        const id = rule.id as string
                        rule.selections = id in perkSelections ? perkSelections[id] : []
                    })

                    const duplicatePerk = actor.system.perks.find(it => (it as any)._sourceId === fullItem.uuid)
                    if (duplicatePerk) {
                        if (!systemClone.canTakeMultiple) continue

                        systemClone.rules.forEach(rule => {
                            const matchingIds = itemIds.filter(it => it === fullItem.uuid)
                            if ("maxChoices" in rule) {
                                rule.maxChoices = (rule.maxChoices as number) * matchingIds.length
                            }
                            else if ("selector" in rule && "value" in rule) {
                                rule.value = (rule.value as number) * 2
                            }
                        })
                        // Remove the original entry so it can be replaced with the compounded version.
                        actor.system.perks = actor.system.perks.filter(p => p._sourceId !== fullItem.uuid)
                    }
                }

                const itemModel = {
                    _sourceId: fullItem.uuid,
                    isRuleSelection: true,
                    parent: {
                        id: foundry.utils.randomID(),
                        name: fullItem.name || "Unknown Feature",
                        img: fullItem.img || "icons/svg/item-bag.svg",
                        type: fullItem.type,
                        flags: { "vagabond-lite": { sourceId: fullItem.uuid }, isRuleSelection: true }
                    },
                    ...systemClone
                }

                if (fullItem.type === 'spell') {
                    actor.system.spells.push(itemModel as unknown as SpellDataModel)
                }
                else if (fullItem.type === 'perk') {
                    actor.system.perks.push(itemModel as unknown as PerkDataModel)
                }
            }
        }

        actor.prepareBaseData()
    }

}