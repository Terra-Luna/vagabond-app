import { createElement } from "react"

import { RelicPowerProcessor } from "../../apps/vagabond-tools/relic/RelicPowerProcessor"
import { getXpToNext } from "../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import { HeroBaseDataRulesApplicator } from "../../rules/util/HeroBaseDataRulesApplicator"
import { getItemChoiceRules, getItemRules } from "../../rules/util/item-rules-util"
import { PerkRulesSelectionsApplicator } from "../../rules/util/PerkRulesSelectionsApplicator"
import { sys_id } from "../../utils/foundryUtils"
import { getEquippedArmor } from "../../utils/heroInventoryUtil"
import { appLang } from "../../utils/lang"
import { getId, inventoryItemTypes } from "../../utils/modelUtil"
import { removeWhitespace } from "../../utils/stringUtil"
import { sendVagabondChatMessage } from "../../view/chat/ChatCardSerializer"
import { TrackerUpdateChatCard } from "../../view/chat/TrackerUpdateChatCard"
import { consolidateCoins } from "../common/CoinValue"
import { fields, optionalString, requiredInteger, requiredString } from "../common/sharedSchemas"
import { AncestryDataModel } from "../item/character/AncestryDataModel"
import { ClassDataModel } from "../item/character/ClassDataModel"
import { PerkDataModel } from "../item/character/PerkDataModel"
import { SpellDataModel } from "../item/character/SpellDataModel"
import { ArmorDataModel } from "../item/equip/ArmorDataModel"
import type { EquipmentDataModel, EquipmentSchema } from "../item/equip/EquipmentDataModel"
import { ActorDataModel, BaseActorSchema } from "./ActorDataModel"
import { inventorySchema, isInventoryItem } from "./type/Inventory"
import { levelSchema } from "./type/Level"
import { manaSchema } from "./type/Mana"
import { savesSchema } from "./type/Saves"
import { skillsSchema } from "./type/Skills"
import { speedSchema } from "./type/Speed"
import { statsSchema } from "./type/Stats"

const heroSchema = () => {
    return {
        tagalongId: new fields.StringField({ ...optionalString }),
        level: new fields.SchemaField({ ...levelSchema() }),
        stats: new fields.SchemaField({ ...statsSchema() }),
        skills: new fields.SchemaField({ ...skillsSchema() }),
        saves: new fields.SchemaField({ ...savesSchema() }),
        speed: new fields.SchemaField({ ...speedSchema() }),
        mana: new fields.SchemaField({ ...manaSchema() }),
        maxFocus: new fields.NumberField({ ...requiredInteger, initial: 1 }),
        boundRelicLimit: new fields.NumberField({ integer: true, initial: 3 }),
        inventory: new fields.SchemaField({ ...inventorySchema() }),

        /**
         * Derived from embedded documents...
         */
        ancestry: new fields.SchemaField({ ...AncestryDataModel.defineSchema() }),
        class: new fields.SchemaField({ ...ClassDataModel.defineSchema() }),
        trackers: new fields.ArrayField(
            new fields.SchemaField({
                name: new fields.StringField({ ...requiredString }),
                type: new fields.StringField({ ...requiredString, initial: "numeric", choices: ["numeric", "boolean"] }),
                value: new fields.NumberField({ ...requiredInteger }),
                sort: new fields.NumberField({ ...requiredInteger, initial: 1000 })
            }), { initial: [] }
        )
    }
}

export type HeroDataModelSchema = ReturnType<typeof heroSchema> & BaseActorSchema

export class HeroDataModel extends ActorDataModel<HeroDataModelSchema> {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ...heroSchema()
        }
    }

    declare perks: PerkDataModel[]
    declare spells: SpellDataModel[]

    override async _preCreate(data: any, options: any, user: any) {
        await super._preCreate(data, options, user)
        this.parent.updateSource({
            'prototypeToken.disposition': CONST.TOKEN_DISPOSITIONS.FRIENDLY,
            'prototypeToken.actorLink': true,
            'prototypeToken.sight.enabled': true,
            'prototypeToken.occludable.radius': 8,
            'system.health.value': 2
        })
    }

    override prepareBaseData() {
        super.prepareBaseData()
        const actor = this.parent
        if (!actor?.items) return

        this.ancestry = actor.items.find((i: { type: string }) => i?.type === 'ancestry')?.system
        this.class = actor.items.find((i: { type: string }) => i?.type === 'class')?.system

        /**
         * Apply bonuses from Item Rules...
         */
        HeroBaseDataRulesApplicator.apply(this.parent)

        /**
         * Set remaining base data last, to preserve the bonuses...
         */
        setInventoryData(this)
        setXpToNextLevel(this)
        setMaxHP(this)
        setSpellcastingStats(this)
        setSaves(this)
        setSpeeds(this)
        setSkillDifficulties(this)
        setArmorRating(this)
    }

    override prepareDerivedData() {
        super.prepareDerivedData()
        if (!this.parent) return
        validateCurrentHP(this)
        validateCurrentFocus(this)
        PerkRulesSelectionsApplicator.apply(this.parent)
        RelicPowerProcessor.applyHeroBonuses(this.parent)
    }

    override async _preUpdate(changes, options, user) {
        await super._preUpdate(changes, options, user)

        const coinChanges = (changes.system as any)?.inventory?.coins
        if (coinChanges) {
            const { g, s, c } = this.inventory.coins
            const newG = coinChanges.g ?? g
            const newS = coinChanges.s ?? s
            const newC = coinChanges.c ?? c;
            (changes.system as any).inventory.coins = consolidateCoins({ g: newG, s: newS, c: newC })
        }

        const luckUpdate = foundry.utils.getProperty(changes, "system.statuses.counters.luck") as number | undefined
        if (luckUpdate) {
            const previousLuck = this.statuses.counters.luck ?? 0
            if (previousLuck !== luckUpdate) {
                const verb = previousLuck < luckUpdate ? appLang.HeroSheet.gained : appLang.HeroSheet.spent;
                (options as any).resourceTrackerUpdate = { verb: verb, resource: 'luck' }
            }
        }

        const studiedUpdate = foundry.utils.getProperty(changes, "system.statuses.counters.studied") as number | undefined
        if (studiedUpdate) {
            const previousStudied = this.statuses.counters.studied ?? 0
            if (previousStudied !== studiedUpdate) {
                const verb = previousStudied < studiedUpdate ? appLang.HeroSheet.gained : appLang.HeroSheet.spent;
                (options as any).resourceTrackerUpdate = { verb: verb, resource: 'studied' }
            }
        }

        /**
         * TODO: add a tracker for changes in Fatigue?
         */
    }

    override async _onUpdate(changes, options, userId) {
        super._onUpdate(changes, options, userId)
        if (userId !== game.user!.id) return

        const pendingResourceTrackerUpdate = (options as any).resourceTrackerUpdate
        if (pendingResourceTrackerUpdate && !(options as any).skipTrackerChatCard) {
            sendVagabondChatMessage(this.parent, createElement(TrackerUpdateChatCard, { heroId: getId(this), verb: pendingResourceTrackerUpdate.verb, resource: pendingResourceTrackerUpdate.resource }))
        }
    }

    async rest() {
        await this.parent.update({
            'system.health.value': this.health.max,
            'system.mana.value': this.mana.max,
            'system.statuses.counters.luck': this.stats.luck
        } as Record<any, any>,
            { ['skipTrackerChatCard' as string]: true }
        )
    }

    async breather() {
        await this.parent.update({
            'system.health.value': this.health.value + (this.stats.might ?? 0),
        } as Record<any, any>,
            { ['skipTrackerChatCard' as string]: true }
        )

        const { gainLuck, removeFatigue } = this.modifiers.downtime.breather

        if (gainLuck > 0) {
            await this.parent.update({
                'system.statuses.counters.luck': this.statuses.counters.luck + gainLuck,
            } as Record<any, any>,
                { ['skipTrackerChatCard' as string]: true }
            )
        }

        if (removeFatigue > 0 && this.statuses.counters.fatigue > 0) {
            await this.parent.update({
                'system.statuses.counters.fatigue': this.statuses.counters.fatigue - removeFatigue,
            } as Record<any, any>)
        }
    }

    equippedRelics = (): (Item & { system: EquipmentDataModel<EquipmentSchema> })[] => {
        return this.parent.items.filter((it: any) =>
            inventoryItemTypes().includes(it.type) &&
            it.system.isEquipped &&
            it.system.isRelic()
        )
    }

    boundRelics = (): EquipmentDataModel<EquipmentSchema>[] => {
        return (this.inventory.items as any).filter(it => it.isEquipped && it.isBoundRelic())
    }

    getActiveRules() {
        const itemRules = this.parent.items.contents.flatMap((item: any) => {
            if (item.system.isEquippable && !item.system.isEquipped) return []

            const rules = getItemRules(item)
            return rules.filter((r: any) => (r.level || 0) <= this.parent.system.level.current)
        })
        return itemRules
    }

    getRuleToggleState = (itemId: string) => {
        const state = this.parent.getFlag(sys_id, `ruleToggle_${itemId}`)
        return state
    }

    toggleItemRule = async (item: any, stateOverride?: boolean) => {
        const itemId = item.id?.split('.').pop() || item._sourceId?.split('.').pop() || undefined
        if (!itemId) return

        const activeEffectFlag = removeWhitespace(`${item.name ?? item.parent.name}_${itemId}`)
        const state = stateOverride ?? this.getRuleToggleState(itemId)

        if (state) {
            try {
                const effects = this.parent.effects.filter(it => it.flags?.[sys_id]?.[activeEffectFlag])
                if (effects.length > 0) {
                    this.parent.deleteEmbeddedDocuments('ActiveEffect', effects.map(it => it.id))
                }
            }
            catch {
                console.warn(`Failed to delete ActiveEffect for item: ${activeEffectFlag}`)
            }
        }
        else {
            const rules = item.rules ?? item.system.rules ?? []
            const buffs = rules.filter(rule => rule.toggleableEffect && !rule.selector.includes("flags."))

            if (buffs.length > 0) {
                const data = {
                    name: item.name ?? item.parent.name,
                    img: item.img ?? item.parent.img,
                    showIcon: 2,
                    flags: { [sys_id]: { [activeEffectFlag]: true } },
                    changes: [/* Intentionally left blank - this merely serves as a buff icon while the rules engine applies effects */]
                }
                await this.parent.createEmbeddedDocuments('ActiveEffect', [data])
            }
        }
        await this.parent.setFlag(sys_id, `ruleToggle_${itemId}`, !state)
        await this.syncToggledStatusEffects(item, !state)
    }

    private syncToggledStatusEffects = async (item: any, active: boolean) => {
        const actor = this.parent
        const rules = item.rules ?? item.system.rules ?? []

        for (const rule of rules) {
            if (rule.key !== "ToggleRule" || !rule.toggleableEffect) continue

            const statusNames = removeWhitespace(rule.selector ?? "")
                .split(",")
                .map((it: string) => it.replace("system.", ""))
                .filter((it: string) => it.startsWith("statuses.toggles."))
                .map((it: string) => it.split(".").pop() as string)

            for (const statusName of statusNames) {
                try {
                    const existing = actor.effects.find(fx => fx.statuses?.has(statusName))
                    if (active && !existing) {
                        const effect = await actor.toggleStatusEffect(statusName, { active: true })
                        if (effect && effect instanceof ActiveEffect) {
                            await effect.setFlag(sys_id, "appliedByRule", rule.id)
                        }
                    }
                    else if (!active && existing?.id && existing.getFlag(sys_id, "appliedByRule") === rule.id) {
                        await actor.deleteEmbeddedDocuments("ActiveEffect", [existing.id])
                    }
                }
                catch (e) {
                    console.warn(`Failed to sync status effect ${statusName}`, e)
                }
            }
        }
    }
}

export function validateCurrentHP(hero: HeroDataModel) {
    if (hero.health.value! > hero.health.max!) {
        hero.health.value = hero.health.max!
    }
}

export function setMaxHP(hero: HeroDataModel) {
    if (hero.statuses.counters.fatigue === 5) {
        hero.health.max = 0
    }
    else {
        hero.health.max += hero.stats.might! * (hero.level.current || 1)
    }
}

export function validateCurrentFocus(hero: HeroDataModel) {
    if (hero.statuses.counters.focus! > hero.maxFocus!) {
        hero.statuses.counters.focus = hero.maxFocus!
    }
}

export function setArmorRating(hero: HeroDataModel) {
    const equippedArmor = getArmor(hero)
    hero.armor.rating += equippedArmor?.rating ?? 0
}

export const getArmor = (hero: HeroDataModel): ArmorDataModel | undefined => {
    return hero.inventory.items.find((i: any) =>
        i.parent.type === 'armor' && i.isEquipped
    ) as unknown as ArmorDataModel
}

export function setSpeeds(hero: HeroDataModel) {
    const dex = hero.stats.dexterity ?? 0
    if (dex < 4) {
        hero.speed.turn += 25
        hero.speed.crawl += hero.speed.turn * 3
        hero.speed.travel += 5
    }
    else if (dex < 6) {
        hero.speed.turn += 30
        hero.speed.crawl += hero.speed.turn * 3
        hero.speed.travel += 6
    }
    else {
        hero.speed.turn += 35
        hero.speed.crawl += hero.speed.turn * 3
        hero.speed.travel += 7
    }

    hero.speed.turn += getActiveCombatModifiers(hero).speed.turn
}

export function getActiveCombatModifiers(hero: HeroDataModel) {
    const result = { speed: { turn: 0 } }
    const actorId = hero.parent?.id
    const combat = actorId
        ? game.combats?.find(c => c.started && c.combatants.some(cb => cb.actorId === actorId))
        : undefined
    if (!combat) return result

    const mods = hero.modifiers?.combat
    result.speed.turn += mods?.constant?.speed?.turn ?? 0
    if (combat.round === 1) result.speed.turn += mods?.roundOne?.speed?.turn ?? 0
    return result
}

export function setSkillDifficulties(hero: HeroDataModel) {
    const skills = hero.skills
    const stats = hero.stats
    skills.brawl.value = setSkill(Number(stats.might), skills.brawl.trained)
    skills.finesse.value = setSkill(Number(stats.dexterity), skills.finesse.trained)
    skills.melee.value = setSkill(Number(stats.might), skills.melee.trained)
    skills.ranged.value = setSkill(Number(stats.awareness), skills.ranged.trained)
    skills.arcana.value = setSkill(Number(stats.reason), skills.arcana.trained)
    skills.craft.value = setSkill(Number(stats.reason), skills.craft.trained)
    skills.detect.value = setSkill(Number(stats.awareness), skills.detect.trained)
    skills.influence.value = setSkill(Number(stats.presence), skills.influence.trained)
    skills.leadership.value = setSkill(Number(stats.presence), skills.leadership.trained)
    skills.medicine.value = setSkill(Number(stats.reason), skills.medicine.trained)
    skills.mysticism.value = setSkill(Number(stats.awareness), skills.mysticism.trained)
    skills.performance.value = setSkill(Number(stats.presence), skills.performance.trained)
    skills.sneak.value = setSkill(Number(stats.dexterity), skills.sneak.trained)
    skills.survival.value = setSkill(Number(stats.awareness), skills.survival.trained)
}

export function setSkill(stat: number, trained: boolean): number {
    return trained ? (20 - stat * 2) : (20 - stat)
}

export function setSaves(hero: HeroDataModel) {
    const base = 20
    hero.saves.endure = base - (hero.stats.might! * 2)
    hero.saves.will = base - (hero.stats.reason! + hero.stats.presence!)
    hero.saves.reflex = base - (hero.stats.dexterity! + hero.stats.awareness!)

    const armor = getEquippedArmor(hero)
    if (armor) {
        hero.modifiers.skillCheck.reflex.modifier! -= armor.system.bulk.slots
    }
}

export function setSpellcastingStats(hero: HeroDataModel) {
    const maxCast = calculateMaxManaPerCast(
        hero.level.current ?? 0,
        hero.class?.maxCastFormula
    )
    hero.mana.maxCast += maxCast
}

export function calculateMaxManaPerCast(level: number, maxCastFormula: string): number {
    if (level === 0 || maxCastFormula.length === 0) return 0
    return maxCastFormula === "half" ? (1 + Math.ceil(level / 2)) : (2 + level)
}

export function setXpToNextLevel(hero: HeroDataModel) {
    hero.level.xpToLevel = getXpToNext(hero.level.current!)
}

function setInventoryData(hero: HeroDataModel) {
    hero.inventory.items = hero.parent.items.filter((i: any) => isInventoryItem(i)).map((i: any) => i.system)
    hero.inventory.capacity += Number(hero.stats.might) + 8 - hero.statuses.counters.fatigue!
}

export const isAlchemist = (hero: HeroDataModel): boolean => {
    const classItem = hero.parent?.items?.find(item => item.type === "class")
    return getItemChoiceRules(hero.level.current!, getItemRules(classItem))?.some(rule => rule.pack === "alchemical")
}