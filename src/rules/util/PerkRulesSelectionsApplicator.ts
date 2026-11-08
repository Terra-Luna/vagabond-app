import { PerkDataModel } from "../../model/item/character/PerkDataModel"
import { SpellDataModel } from "../../model/item/character/SpellDataModel"
import { sys_id } from "../../util/foundry-util"
import { getRuleItemFlagEntries, getRuleItemFlags, isItemChoiceRule, mergeItemFlags, normalizeRuleSelections, type RuleFlagSource } from "./item-rules-util"
import { ItemsCache } from "./ItemsCache"

export class PerkRulesSelectionsApplicator {

  /**
   * Reads all the Actor's virtual perk items and applies their rules' choice selections.
   * Feature Item rules are included by HeroDataModel.getActiveRules().
   */
  static apply(actor: Actor & { system: any }) {
    if (!actor) return

    actor.system.spells = []
    actor.system.perks = []

    const activeRules = actor.system.getActiveRules()

    const itemRuleSelections = activeRules
      .filter((r) => isItemChoiceRule(r))
      .flatMap((r) =>
        normalizeRuleSelections(r.selections).flatMap((selection) => {
          const selectedItem = ItemsCache.items.get(selection.value)
          const hasItemSubselect = selectedItem?.system?.rules?.some((rule) =>
            isItemChoiceRule(rule),
          )
          return [
            selection.value,
            ...(hasItemSubselect && selection.subselect
              ? [selection.subselect]
              : []),
          ]
        }),
      )

    const grantRules = activeRules.filter((r) => r.key === "GrantItem")
    const spellPerkGrantRules = grantRules.filter(
      (r) => r.type === "spell" || r.type === "perk",
    )
    const spellPerkItemIds = [
      ...itemRuleSelections,
      ...spellPerkGrantRules.map((r) => r.uuid),
    ]

    const spellPerkItems: any[] = []
    spellPerkItemIds.forEach((id) => {
      const cachedItem = ItemsCache.items.get(id)
      if (cachedItem) spellPerkItems.push(cachedItem)
    })

    const selectedPerkSelections = activeRules
      .filter((r) => isItemChoiceRule(r))
      .flatMap((r) => normalizeRuleSelections(r.selections))
      .filter((selection) =>
        ItemsCache.perks().some((perk) => perk.uuid === selection.value),
      )

    const selectionsByPerk = new Map<string, any[]>()

    /** Flags configured on the ChoiceSet rules, keyed by the uuid of the item each rule selected. */
    const flagsByItem = new Map<string, Record<string, unknown>>()
    /** The same flags, with the rule that set them, so the sheet can say where an item's flags came from. */
    const sourcesByItem = new Map<string, RuleFlagSource[]>()
    const stampFlags = (uuid: string, rule: any) => {
      flagsByItem.set(
        uuid,
        mergeItemFlags(flagsByItem.get(uuid), getRuleItemFlags(rule)),
      )
      const flags = getRuleItemFlagEntries(rule)
      if (!flags.length) return
      const sources = sourcesByItem.get(uuid) ?? []
      const source = { rule: String(rule.label ?? ""), flags }
      if (!sources.some((it) => JSON.stringify(it) === JSON.stringify(source)))
        sourcesByItem.set(uuid, [...sources, source])
    }
    activeRules.filter(isItemChoiceRule).forEach((rule) =>
      normalizeRuleSelections(rule.selections).forEach((selection) => {
        stampFlags(selection.value, rule)
        // A selected Perk's own item ChoiceSet rule configures the item chosen inside it.
        const inner = ItemsCache.items
          .get(selection.value)
          ?.system?.rules?.filter(isItemChoiceRule)
        if (selection.subselect)
          inner?.forEach((it: any) => stampFlags(selection.subselect, it))
      }),
    )

    selectedPerkSelections.forEach((selection) => {
      const selections = selectionsByPerk.get(selection.value) ?? []
      selections.push(selection)
      selectionsByPerk.set(selection.value, selections)
    })

    for (const fullItem of spellPerkItems) {
      if (fullItem.type === "spell" || fullItem.type === "perk") {
        if (typeof fullItem.system?.toObject !== "function") continue

        if (fullItem.system instanceof SpellDataModel) {
          if (
            actor.system.spells.some(
              (sp) => (sp as any)._sourceId === fullItem.uuid,
            )
          )
            continue
        }

        const systemClone = foundry.utils.deepClone(fullItem.system.toObject())

        if (fullItem.system instanceof PerkDataModel) {
          const parentSelection = selectionsByPerk.get(fullItem.uuid)?.shift()
          systemClone.rules.forEach((rule) => {
            rule.selections = parentSelection
              ? [
                  {
                    ...parentSelection,
                    value: parentSelection.subselect ?? "",
                    subselect: "",
                  },
                ]
              : []
          })

          // Compound repeatable perks if the player has selected the same perk multiple times.
          const hasOwnChoice = systemClone.rules.some(
            (rule: any) => rule.key === "ChoiceSet",
          )
          const duplicatePerk = actor.system.perks.find(
            (it) => (it as any)._sourceId === fullItem.uuid,
          )
          if (duplicatePerk && !hasOwnChoice) {
            if (!systemClone.canTakeMultiple) continue

            systemClone.rules.forEach((rule) => {
              const matchingIds = spellPerkItemIds.filter(
                (it) => it === fullItem.uuid,
              )
              if ("maxChoices" in rule) {
                rule.maxChoices =
                  (rule.maxChoices as number) * matchingIds.length
              }
              else if ("selector" in rule && "value" in rule) {
                rule.value = (rule.value as number) * 2
              }
            })
            // Remove the original entry so it can be replaced with the compounded version.
            actor.system.perks = actor.system.perks.filter(
              (p) => p._sourceId !== fullItem.uuid,
            )
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
            flags: {
              ...fullItem.flags,
              [sys_id]: mergeItemFlags(
                fullItem.flags?.[sys_id],
                // Set by the ChoiceSet rule that selected the item. The source item is never touched.
                flagsByItem.get(fullItem.uuid),
                { sourceId: fullItem.uuid },
              ),
              isRuleSelection: true,
            },
          },
          ...systemClone,
          ruleFlags: sourcesByItem.get(fullItem.uuid) ?? [],
        }

        if (fullItem.type === "spell") {
          actor.system.spells.push(itemModel as unknown as SpellDataModel)
        }
        else if (fullItem.type === "perk") {
          actor.system.perks.push(itemModel as unknown as PerkDataModel)
        }
      }
    }

    // Needed to set player-made perk selections.
    actor.prepareBaseData()
  }

}
