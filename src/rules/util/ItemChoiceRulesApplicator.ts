import { PerkDataModel } from "../../model/item/character/PerkDataModel"
import { SpellDataModel } from "../../model/item/character/SpellDataModel"
import { normalizeRuleSelections } from "./item-rules-util"
import { ItemsCache } from "./ItemsCache"

export class PerkRulesSelectionsApplicator {

    /**
     * Reads all the Actor's virtual perk items and applies their rules' choice selections.
     */
    static apply(actor: Actor & { system: any }) {
        if (!actor || !actor.isOwner) return

        actor.system.spells = []
        actor.system.perks = []

        const activeRules = actor.system.getActiveRules()

        const itemRuleSelections = activeRules
            .filter(r => r.key === "ChoiceSet" && r.channel === "item")
            .flatMap(r => normalizeRuleSelections(r.selections).flatMap(selection => {
                const selectedItem = ItemsCache.items.get(selection.value)
                const hasItemSubselect = selectedItem?.system?.rules?.some(rule => rule.key === "ChoiceSet" && rule.channel === "item")
                return [selection.value, ...(hasItemSubselect && selection.subselect ? [selection.subselect] : [])]
            }))

        const grantRules = activeRules.filter(r => r.key === "GrantItem")
        const spellPerkGrantRules = grantRules.filter(r => r.type === "spell" || r.type === "perk")
        const spellPerkItemIds = [...itemRuleSelections, ...spellPerkGrantRules.map(r => r.uuid)]

        const spellPerkItems: any[] = []
        spellPerkItemIds.forEach(id => {
            const cachedItem = ItemsCache.items.get(id)
            if (cachedItem) spellPerkItems.push(cachedItem)
        })

        const selectedPerkSelections = activeRules
            .filter(r => r.key === "ChoiceSet" && r.channel === "item")
            .flatMap(r => normalizeRuleSelections(r.selections))
            .filter(selection => ItemsCache.perks().some(perk => perk.uuid === selection.value))
        const selectionsByPerk = new Map<string, any[]>()
        selectedPerkSelections.forEach(selection => {
            const selections = selectionsByPerk.get(selection.value) ?? []
            selections.push(selection)
            selectionsByPerk.set(selection.value, selections)
        })

        for (const fullItem of spellPerkItems) {
            if (fullItem.type === 'spell' || fullItem.type === 'perk') {

                if (fullItem.system instanceof SpellDataModel) {
                    if (actor.system.spells.some(sp => (sp as any)._sourceId === fullItem.uuid)) continue
                }

                const systemClone = foundry.utils.deepClone(fullItem.system.toObject())

                if (fullItem.system instanceof PerkDataModel) {
                    const parentSelection = selectionsByPerk.get(fullItem.uuid)?.shift()
                    systemClone.rules.forEach(rule => {
                        rule.selections = parentSelection?.subselect
                            ? [{ ...parentSelection, value: parentSelection.subselect, subselect: "" }]
                            : []
                    })

                    // Compound repeatable perks if the player has selected the same perk multiple times.
                    const hasOwnChoice = Boolean(parentSelection?.subselect)
                    const duplicatePerk = actor.system.perks.find(it => (it as any)._sourceId === fullItem.uuid)
                    if (duplicatePerk && !hasOwnChoice) {
                        if (!systemClone.canTakeMultiple) continue

                        systemClone.rules.forEach(rule => {
                            const matchingIds = spellPerkItemIds.filter(it => it === fullItem.uuid)
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
                        flags: { sys_id: { sourceId: fullItem.uuid }, isRuleSelection: true }
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

        // Needed to set player-made perk selections.
        actor.prepareBaseData()
    }

}