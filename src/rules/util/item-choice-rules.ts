import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { PerkDataModel } from "../../model/item/character/PerkDataModel"
import { SpellDataModel } from "../../model/item/character/SpellDataModel"
import { RulesCache } from "./ItemRulesCache"

export function applyItemChoiceRuleSelections(actor: Actor & { system: HeroDataModel }) {
    actor.system.spells = []
    actor.system.perks = []

    const activeRules = actor.system.getActiveRules(actor)
    const perkSelections = actor.flags["vagabond-lite"]?.perkSelections ?? {}

    const itemRuleSelections = [
        ...activeRules.filter(r => r.key === "ChoiceSet" && r.channel === "item").flatMap(r => r.selections),
        ...Object.values(perkSelections).deepFlatten()
    ]

    const itemGrantRules = activeRules.filter(r => r.key === "GrantItem" && (r.type === "spell" || r.type === "perk"))
    const itemIds = [...itemRuleSelections, ...itemGrantRules.map(r => r.uuid)]

    const items: any[] = []
    itemIds.forEach(id => {
        const cachedItem = RulesCache.items.get(id)
        if (cachedItem) items.push(cachedItem)
    })

    for (const fullItem of items) {
        if (fullItem.type === 'spell' || fullItem.type === 'perk') {

            if (fullItem.system instanceof SpellDataModel) {
                if (actor.system.spells.some(sp => (sp as any)._sourceId === fullItem.uuid)) continue
            }

            const systemData = foundry.utils.deepClone(fullItem)?.system

            if (systemData instanceof PerkDataModel) {
                const matchingPerk = actor.system.perks.find(it => (it as any)._sourceId === fullItem.uuid)

                systemData.rules.forEach(rule => {
                    const id = rule.id as string
                    rule.selections = id in perkSelections ? perkSelections[id] : []
                })

                if (matchingPerk) {
                    if (!systemData.canTakeMultiple) continue

                    /**
                     * Instead of addinga duplicate Perk, compound each of their rules' maxChoices
                     * so the correct number of selection options show up on the character sheet.
                     */
                    matchingPerk.rules.forEach(rule => {
                        const perkIds = itemIds.filter(it => it === (matchingPerk as any)._sourceId)
                        if ("maxChoices" in rule) rule.maxChoices = rule.maxChoices as number * perkIds.length
                    })
                    continue
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
                ...systemData
            }

            if (fullItem.type === 'spell') {
                actor.system.spells.push(itemModel as unknown as SpellDataModel)
            } else if (fullItem.type === 'perk') {
                actor.system.perks.push(itemModel as unknown as PerkDataModel)
            }
        }
    }
}