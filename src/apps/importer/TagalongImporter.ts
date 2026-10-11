import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { findOrCreateElectiveTrainingsRule, getItemChoiceRules, getItemGrants, getItemRules, getSkillTrainingChoiceRules, getStatChoiceRules, normalizeRuleSelections, randomId, RuleSelection, saveItemRuleSelections } from "../../rules/util/item-rules-util"
import { ItemsCache } from "../../rules/util/ItemsCache"
import { getRuleSelectors } from "../../rules/util/selector-util"
import { updateDocument } from "../../utils/documentUtils"
import { stackStackables } from "../../utils/heroInventoryUtil"
import { appLang } from "../../utils/lang"
import { localizeString } from "../../utils/localeUtils"
import { addItemToActor, TypedIndexEntry } from "../../utils/modelUtil"
import { api } from "../api/VagabondAPI"
import { showConfirmationDialog } from "../vagabond-tools/dialog/showConfirmationDialog"
import { cleanTagalongItemName, fetchHero, TagalongItem } from "./TagalongApi"
import { TagalongItemCreator } from "./TagalongItemCreator"

type TagalongCharacter = Awaited<ReturnType<typeof fetchHero>>["character"]
type ImportableItem = Item | TypedIndexEntry
type RuleBearingItem = Item & { system: { rules: any[], featureIds?: string[] } }

/**
 * Imports hero data from www.vgbnd.app and maps it to the system hero data model.
 * 
 * Sample links:
 *      (Human Magus) https://www.vgbnd.app/character/e38db88c-ec28-4b67-a44c-09f0fe199d01
 *         (Elf Sorc) https://www.vgbnd.app/character/943534e9-433c-46c7-9c1b-4e666654601a
 */
export const importHero = async (hero: HeroDataModel, tagalongUrl: string) => {
    try {
        ui.notifications?.info(appLang.Notifications.importingCharacter)
        const url = new URL(tagalongUrl)
        const res = (await fetchHero(url)).character

        if (!res) {
            ui.notifications?.error("Vagabond | Failed to fetch character data from: " + tagalongUrl)
            return
        }

        console.info(res)

        /**
         * Remove existing Ancestry & Class from the hero's embedded items
         */
        await hero.parent.deleteEmbeddedDocuments("Item", hero.parent.items
            .filter(it => it.type === "ancestry" || it.type === "class")
            .map(it => it.id)
        )

        /**
         * Build a list of failed item lookups...
         */
        const failures: string[] = []

        /**
         * Update the Hero's data model...
         */
        const stats = { ...res.assignedStats }
        if (res.strongPotentialStat && Object.prototype.hasOwnProperty.call(stats, res.strongPotentialStat)) {
            stats[res.strongPotentialStat] += 1
        }
        Object.keys(res.levelStats).forEach(stat => {
            if (Object.prototype.hasOwnProperty.call(stats, stat)) {
                stats[stat] += res.levelStats[stat as keyof typeof res.levelStats]
            }
        })

        await updateDocument(hero.parent, {
            tagalongId: res.id,
            name: res.name,
            prototypeToken: { name: res.name, actorLink: true },
            level: { current: res.level, xp: res.xp },
            health: { value: res.current_hp },
            mana: { value: res.current_mana },
            statuses: {
                counters: {
                    luck: res.current_luck,
                    studied: res.studied_dice,
                    fatigue: res.fatigue
                }
            },
            stats,
            inventory: {
                coins: res.current_wealth
            }
        })

        /**
         * Lookup matching Ancestry...
         */
        let ancestry = ItemsCache.ancestries().find(it => it.name.toUpperCase() === res.ancestry.toUpperCase()) as any
        if (!ancestry) {
            failures.push(`Ancestry: ${res.ancestry}`)
        }

        /**
         * Lookup matching Class.
         */
        let clazz = ItemsCache.classes().find(it => it.name.toUpperCase() === res.class.toUpperCase()) as any
        if (!clazz) {
            failures.push(`Class: ${res.class}`)
        }

        if (ancestry) await hero.parent.createEmbeddedDocuments("Item", [ancestry])
        if (clazz) await hero.parent.createEmbeddedDocuments("Item", [clazz])

        await api.util.syncAncestryAndClass(hero.parent, false)

        ancestry = ancestry && hero.parent.items.find(item => item.type === "ancestry" && item.name === ancestry.name)
        clazz = clazz && hero.parent.items.find(item => item.type === "class" && item.name === clazz.name)

        if (ItemsCache.ancestries().some(item => item.name.toUpperCase() === res.ancestry.toUpperCase()) && !ancestry) {
            failures.push(`Ancestry: ${res.ancestry}`)
        }
        if (ItemsCache.classes().some(item => item.name.toUpperCase() === res.class.toUpperCase()) && !clazz) {
            failures.push(`Class: ${res.class}`)
        }

        await importPerks(res, ancestry, clazz, failures)
        await importTrainings(hero, res, ancestry, clazz, failures)
        await importSpells(res, ancestry, clazz, failures)
        await hero.forceUpdate()

        /**
         * Import character inventory...
         * First, check for any incoming new items and create them.
         * Second, collect all matching items from the system
         */
        const newItems: TagalongItem[] = []
        for (const tagalongItem of res.inventory) {
            const tagalongItemName = cleanTagalongItemName(tagalongItem.name)
            const systemItem = ItemsCache.equipment().find(it => it.name.toUpperCase() === tagalongItemName.toUpperCase())
            // Relic items are always created fresh so the compendium/world items stay untouched.
            if (TagalongItemCreator.hasRelicPowers(tagalongItem)) {
                newItems.push(tagalongItem)
            }
            else if (!systemItem && !newItems.map(it => it.name.toUpperCase()).includes(tagalongItemName.toUpperCase())) {
                newItems.push(tagalongItem)
            }
        }
        const converter = new TagalongItemCreator(hero, newItems)
        await converter.convert()
        converter.errors.forEach(e => { failures.push(e) })

        const createAllItems = res.inventory.map(async tagalongItem => {
            const sysItem = ItemsCache.equipment().find(it => it.name.toUpperCase() === cleanTagalongItemName(tagalongItem.name).toUpperCase())
            if (sysItem && !TagalongItemCreator.hasRelicPowers(tagalongItem)) {
                const createdItem = await addItemToActor(hero.parent, sysItem)
                const updates: Record<string, unknown> = {}
                if (createdItem && "bulk" in createdItem.system) {
                    updates["system.bulk.quantity"] = tagalongItem.quantity ?? 1
                }
                if (createdItem && typeof (createdItem.system as any).isEquipped === "boolean") {
                    updates["system.isEquipped"] = tagalongItem.is_equipped ?? tagalongItem.is_eqiupped ?? false
                }
                if (createdItem && Object.keys(updates).length > 0) {
                    await createdItem.update(updates)
                }
            }
        })

        await Promise.all(createAllItems)
        await stackStackables(hero)

        /**
         * Show any import failures...
         */
        showConfirmationDialog({
            title: appLang.Notifications.importComplete,
            description: failures.length > 0
                ? `${appLang.Notifications.importItemsUnconfigured}\n\n${failures.join("\n")}`
                : localizeString(appLang.Notifications.importSucceeded, { name: res.name }),
            confirmText: appLang.General.ok,
            variant: "info"
        })
    }
    catch (e) {
        showConfirmationDialog({ title: "Error", description: (e as Error).message })
        console.error(e)
    }
}

async function importPerks(
    character: TagalongCharacter,
    ancestry: RuleBearingItem | undefined,
    clazz: RuleBearingItem | undefined,
    failures: string[]
) {
    const perkCandidates = character.selected_perks.flatMap(perk => {
        const item = ItemsCache.perks().find(candidate => candidate.name.toUpperCase() === perk.name.toUpperCase())
        if (!item) {
            failures.push(`Perk: ${perk.name}`)
            return []
        }
        if (!["class", "level", "ancestry", "manual"].includes(perk.source)) {
            failures.push(`Perk source: ${perk.name} (${perk.source})`)
            return []
        }
        return [{ item, source: perk.source }]
    })
    const importedPerks = perkCandidates.filter((candidate, index, candidates) =>
        candidate.item.system.canTakeMultiple ||
        candidates.findIndex(other => other.item.uuid === candidate.item.uuid) === index
    )

    const classPerks = importedPerks.filter(candidate => candidate.source !== "ancestry")
    const ancestryPerks = importedPerks.filter(candidate => candidate.source === "ancestry")
    const perkRulesFor = (item: Item | TypedIndexEntry | undefined) => item
        ? getItemChoiceRules(character.level, getItemRules(item)).filter(rule => rule.pack === "perk")
        : []

    let unassignedPerks = await saveChoices(ancestry, perkRulesFor(ancestry), ancestryPerks.map(candidate => candidate.item))
    unassignedPerks.forEach(perk => failures.push(`Perk selection: ${perk.name}`))
    unassignedPerks = await saveChoices(clazz, perkRulesFor(clazz), classPerks.map(candidate => candidate.item))
    unassignedPerks.forEach(perk => failures.push(`Perk selection: ${perk.name}`))

    await importAdvancementStats(character, [ancestry, clazz], failures)
    await importPerkSpells(character, [ancestry, clazz], failures)
}

/**
 * Slots the spell chosen for a perk (e.g. Magical Secret) into that perk's sub-selection.
 */
async function importPerkSpells(
    character: TagalongCharacter,
    owners: (RuleBearingItem | undefined)[],
    failures: string[]
) {
    for (const perk of character.selected_perks.filter(perk => perk.metadata?.spell)) {
        const perkItem = ItemsCache.perks().find(candidate => candidate.name.toUpperCase() === perk.name.toUpperCase())
        const spell = ItemsCache.spells().find(candidate => candidate.name.toUpperCase() === perk.metadata!.spell!.toUpperCase())
        if (!perkItem || !spell) {
            failures.push(`Spell: ${perk.metadata!.spell}`)
            continue
        }

        let assigned = false
        for (const owner of owners) {
            if (!owner || assigned) continue
            const updates: Record<string, RuleSelection[]> = {}
            for (const rule of getItemRules(owner).filter(rule => rule.key === "ChoiceSet" && rule.channel === "item")) {
                const selections = normalizeRuleSelections(rule.selections)
                const selection = selections.find(candidate => candidate.value === perkItem.uuid && !candidate.subselect)
                if (!selection) continue
                selection.subselect = spell.uuid
                updates[rule.id] = selections
                assigned = true
                break
            }
            await saveItemRuleSelections(owner, updates)
        }
        if (!assigned) failures.push(`Spell: ${perk.metadata!.spell}`)
    }
}

/**
 * API returns Advancement stats as "character.advancementStats". They need to get
 * saved as sub-selections, each on a different Advancement Perk. Order doesn't matter.
 */
async function importAdvancementStats(
    character: TagalongCharacter,
    owners: (RuleBearingItem | undefined)[],
    failures: string[]
) {
    const pendingStats = Object.entries(character.advancementStats ?? {}).flatMap(([stat, points]) =>
        Array<string>(Math.max(0, Math.floor(Number(points) || 0))).fill(`stats.${stat}`)
    )
    if (pendingStats.length === 0) return

    const hasStatChoice = (perkUuid: string) => {
        const perk = ItemsCache.perks().find(candidate => candidate.uuid === perkUuid)
        return Boolean(perk) && getStatChoiceRules([perk as any]).length > 0
    }

    /**
     * Loop through each Perk and, if it has a stat choice rule, assign one of the advancementStats to it.
     */
    for (const owner of owners) {
        if (!owner || pendingStats.length === 0) continue
        const updates: Record<string, RuleSelection[]> = {}
        for (const rule of getItemRules(owner).filter(rule => rule.key === "ChoiceSet" && rule.channel === "item")) {
            const selections = normalizeRuleSelections(rule.selections)
            let changed = false
            for (const selection of selections) {
                if (pendingStats.length === 0) break
                if (selection.subselect || !hasStatChoice(selection.value)) continue
                selection.subselect = pendingStats.shift()!
                changed = true
            }
            if (changed) updates[rule.id] = selections
        }
        await saveItemRuleSelections(owner, updates)
    }

    /**
     * If any stats couldn't get slotted, add it to the error messages list.
     */
    pendingStats.forEach(stat => failures.push(`Advancement: ${stat.replace("stats.", "")}`))
}

/**
 * API returns trainings as an array of Pascal-case skill names which must be mapped
 * to our corresponding skill keys. Our system determines elective training slot count
 * based on the Hero's Reason / 2, >>. The Tagalong app is still using the old rule set
 * so the imported Hero could end up with either empty slots OR too many trainings.
 * 
 * Training rules can be derived from Ancestry, Class, and Perks. They all need to be
 * considered when doing this mapping. normalizeRuleSelections() and saveItemRuleSelections()
 * do most of the heavy lifting - this function just needs to loop through all the Hero's 
 * items and apply the rules correctly.
 */
async function importTrainings(
    hero: HeroDataModel,
    character: TagalongCharacter,
    ancestry: RuleBearingItem | undefined,
    clazz: RuleBearingItem | undefined,
    failures: string[]
) {
    const skillKeys = Object.keys(hero.skills)
    const getSkillKey = (skillName: string) => skillKeys.find(key =>
        key.toLowerCase() === skillName.trim().toLowerCase() ||
        appLang.Skills[key]?.name.toLowerCase() === skillName.trim().toLowerCase()
    )
    const trainedSkills = [...new Set(character.trained_skills.flatMap(name => {
        const key = getSkillKey(name)
        if (!key) failures.push(`Skill: ${name}`)
        return key ? [key] : []
    }))]
    const ancestryBonusSkill = character.ancestry_bonus_skill
        ? getSkillKey(character.ancestry_bonus_skill)
        : undefined
    if (character.ancestry_bonus_skill && !ancestryBonusSkill) {
        failures.push(`Skill: ${character.ancestry_bonus_skill}`)
    }

    const sourceRules = [ancestry, clazz].filter((item): item is RuleBearingItem => Boolean(item))
        .flatMap(item => getItemRules(item))
    const grantedSkillPaths = new Set(sourceRules.flatMap(rule => {
        const rulePaths = rule.key === "ToggleRule"
            ? getRuleSelectors(rule)
            : rule.key === "ChoiceSet" && rule.channel === "path" &&
                rule.label !== appLang.RulesEditor.electiveTrainings
                ? normalizeRuleSelections(rule.selections).map(selection => selection.value)
                : []
        return rulePaths.flatMap((path: string) => {
            const match = path.replace(/^system\./, "").match(/^skills\.([^.]+)\.trained$/)
            return match && (rule.key !== "ToggleRule" || rule.value === true || rule.value === "true")
                ? [match[1]]
                : []
        })
    }))

    const ancestryTrainingRules = ancestry
        ? getItemRules(ancestry).filter(rule => rule.key === "ChoiceSet" && rule.channel === "path" &&
            (rule.choices ?? []).some((choice: any) => String(typeof choice === "string" ? choice : choice?.value).includes("skills.")))
        : []

    if (ancestryBonusSkill && ancestry) {
        const rule = ancestryTrainingRules.find(candidate =>
            normalizeRuleSelections(candidate.selections).length < Number(candidate.maxChoices ?? 1)
        )
        if (rule) {
            const selections = normalizeRuleSelections(rule.selections)
            selections.push({ id: randomId(), value: `skills.${ancestryBonusSkill}.trained`, subselect: "" })
            await saveItemRuleSelections(ancestry, { [rule.id]: selections })
        }
        else {
            failures.push(`Ancestry bonus skill: ${character.ancestry_bonus_skill}`)
        }
    }

    if (clazz) {
        const electiveSelections = trainedSkills
            .filter(skill => skill !== ancestryBonusSkill && !grantedSkillPaths.has(skill))
            .map(skill => ({ id: randomId(), value: `skills.${skill}.trained`, subselect: "" }))

        const finalReason = character.assignedStats.reason
            + (character.strongPotentialStat === "reason" ? 1 : 0)
            + (character.advancementStats?.reason ?? 0)
            + (character.levelStats?.reason ?? 0)

        const existingClassRules = getItemRules(clazz)
        const { electiveRule } = findOrCreateElectiveTrainingsRule(clazz, { reasonValue: finalReason })
        const existingElectiveRule = existingClassRules.some(rule => rule.id === electiveRule.id)
        const maxChoices = Math.ceil(finalReason / 2)
        const selections = electiveSelections.slice(0, maxChoices)

        /**
         * The API doesn't seem to specify which trainings the player obtained via the "New Training" Perk,
         * so we have to manually assign any leftover trainings to the appropriate Perk choices.
         */
        const leftovers = electiveSelections.slice(maxChoices).map(selection => selection.value)
        await importPerkTrainings([ancestry, clazz], leftovers)
        leftovers.forEach(value => failures.push(`Training: ${value.replace(/^skills\./, "").replace(/\.trained$/, "")}`))

        if (!existingElectiveRule && !clazz.system.rules.some(rule => rule.id === electiveRule.id)) {
            const ownRules = foundry.utils.deepClone(clazz.system.rules ?? [])
            await clazz.update({ "system.rules": [...ownRules, electiveRule] } as Record<string, any>)
        }

        await saveItemRuleSelections(clazz, { [electiveRule.id]: selections })
    }
}

async function importPerkTrainings(owners: (RuleBearingItem | undefined)[], pendingSkills: string[]) {
    const hasSkillChoice = (perkUuid: string) => {
        const perk = ItemsCache.perks().find(candidate => candidate.uuid === perkUuid)
        return Boolean(perk) && getSkillTrainingChoiceRules([perk as any]).length > 0
    }

    for (const owner of owners) {
        if (!owner || pendingSkills.length === 0) continue
        const updates: Record<string, RuleSelection[]> = {}
        for (const rule of getItemRules(owner).filter(rule => rule.key === "ChoiceSet" && rule.channel === "item")) {
            const selections = normalizeRuleSelections(rule.selections)
            let changed = false
            for (const selection of selections) {
                if (pendingSkills.length === 0) break
                if (selection.subselect || !hasSkillChoice(selection.value)) continue
                selection.subselect = pendingSkills.shift()!
                changed = true
            }
            if (changed) updates[rule.id] = selections
        }
        await saveItemRuleSelections(owner, updates)
    }
}

async function importSpells(
    character: TagalongCharacter,
    ancestry: RuleBearingItem | undefined,
    clazz: RuleBearingItem | undefined,
    failures: string[]
) {
    const perkSpellNames = new Set(character.selected_perks.flatMap(perk =>
        perk.metadata?.spell ? [perk.metadata.spell.toUpperCase()] : []))
    const spells: ImportableItem[] = character.known_spells.flatMap(spellName => {
        // Spells tied to a perk (e.g. Magical Secret) are slotted into that perk instead of a spell rule.
        if (perkSpellNames.has(spellName.toUpperCase())) return []
        const spell = ItemsCache.spells().find(item => item.name.toUpperCase() === spellName.toUpperCase())
        if (!spell) {
            failures.push(`Spell: ${spellName}`)
            return []
        }
        return [spell]
    })
    const ancestryBonusSpell = character.ancestry_bonus_spell
        ? spells.find(spell => spell.name.toUpperCase() === character.ancestry_bonus_spell.toUpperCase())
        : undefined
    if (character.ancestry_bonus_spell && !ancestryBonusSpell) {
        failures.push(`Spell: ${character.ancestry_bonus_spell}`)
    }

    const grantedSpellUuids = new Set((await getItemGrants("spell", [ancestry, clazz])).map(grant => grant.uuid))
    const spellsToSelect = [...new Map(spells
        .filter(spell => !grantedSpellUuids.has(spell.uuid))
        .map(spell => [spell.uuid, spell])).values()]
    const spellRulesFor = (item: Item | TypedIndexEntry | undefined) =>
        item ? getItemChoiceRules(character.level, getItemRules(item)).filter(rule => rule.pack === "spell") : []

    const ancestrySpellRules = spellRulesFor(ancestry)
    const unassignedAncestryBonusSpells = ancestryBonusSpell && !grantedSpellUuids.has(ancestryBonusSpell.uuid)
        ? await saveChoices(ancestry, ancestrySpellRules, [ancestryBonusSpell])
        : []
    const unassignedSpells = [
        ...unassignedAncestryBonusSpells,
        ...spellsToSelect.filter(spell => spell.uuid !== ancestryBonusSpell?.uuid)
    ]
    const unmatchedSpells = await saveChoices(clazz, spellRulesFor(clazz), unassignedSpells)
    unmatchedSpells.forEach(spell => failures.push(`Spell selection: ${spell.name}`))
}

async function saveChoices(
    item: Item | TypedIndexEntry | undefined,
    rules: ReturnType<typeof getItemChoiceRules>,
    candidates: ImportableItem[]
): Promise<ImportableItem[]> {
    if (!item || !rules.length) return candidates
    const updates: Record<string, { id: string, value: string, subselect: string }[]> =
        Object.fromEntries(rules.map(rule => [rule.id, []]))
    const remaining = [...candidates]
    const canSelect = (rule: (typeof rules)[number], candidate: ImportableItem) =>
        rule.choices.length === 0 || rule.choices.some(choice =>
            (typeof choice === "string" ? choice : choice.value) === candidate.uuid
        )
    const applicableRuleCount = (candidate: ImportableItem) =>
        rules.filter(rule => canSelect(rule, candidate)).length
    const orderedRules = [...rules].sort((a, b) =>
        remaining.filter(candidate => canSelect(a, candidate)).length -
        remaining.filter(candidate => canSelect(b, candidate)).length ||
        a.level - b.level
    )

    for (const rule of orderedRules) {
        const selections: { id: string, value: string, subselect: string }[] = []
        const eligibleCandidates = remaining
            .filter(candidate => canSelect(rule, candidate))
            .sort((a, b) => applicableRuleCount(a) - applicableRuleCount(b))
        for (const candidate of eligibleCandidates) {
            if (selections.length >= rule.maxChoices) break
            selections.push({ id: randomId(), value: candidate.uuid, subselect: "" })
            remaining.splice(remaining.indexOf(candidate), 1)
        }
        if (selections.length > 0) updates[rule.id] = selections
    }
    if (Object.keys(updates).length > 0) await saveItemRuleSelections(item, updates)
    return remaining
}