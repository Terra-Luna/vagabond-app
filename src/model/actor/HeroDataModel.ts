import { createElement } from "react"
import { vgLiteLang } from "../../utils/lang"
import { getId } from "../../utils/modelUtil"
import { TrackerUpdateChatCard } from "../../view/chat/TrackerUpdateChatCard"
import { consolidateCoins } from "../common/CoinValue"
import { fields, optionalString } from "../common/sharedSchemas"
import { AncestryDataModel } from "../item/character/AncestryDataModel"
import { ClassDataModel } from "../item/character/ClassDataModel"
import { PerkDataModel } from "../item/character/PerkDataModel"
import { SpellDataModel } from "../item/character/SpellDataModel"
import { ActorDataModel, BaseActorSchema } from "./ActorDataModel"
import { inventorySchema, isInventoryItem } from "./type/Inventory"
import { levelSchema } from "./type/Level"
import { manaSchema } from "./type/Mana"
import { savesSchema } from "./type/Saves"
import { skillsSchema } from "./type/Skills"
import { speedSchema } from "./type/Speed"
import { statsSchema } from "./type/Stats"
import { ArmorDataModel } from "../item/equip/ArmorDataModel"
import { sendVgLiteChatMessage } from "../../view/chat/ChatCardSerializer"
import { PerkRulesSelectionsApplicator } from "../../rules/util/ItemChoiceRulesApplicator"
import { HeroBaseDataRulesApplicator } from "../../rules/util/HeroBaseDataRulesApplicator"

const heroSchema = () => {
    return {
        tagalongId: new fields.StringField({ ...optionalString }),
        level: new fields.SchemaField({ ...levelSchema() }),
        stats: new fields.SchemaField({ ...statsSchema() }),
        skills: new fields.SchemaField({ ...skillsSchema() }),
        saves: new fields.SchemaField({ ...savesSchema() }),
        speed: new fields.SchemaField({ ...speedSchema() }),
        mana: new fields.SchemaField({ ...manaSchema() }),
        boundRelicLimit: new fields.NumberField({ integer: true, initial: 3 }),
        inventory: new fields.SchemaField({ ...inventorySchema() }),

        /**
         * Derived from embedded documents...
         */
        ancestry: new fields.SchemaField({ ...AncestryDataModel.defineSchema() }),
        class: new fields.SchemaField({ ...ClassDataModel.defineSchema() }),

        // certain things cause us to call forceUpdate() to make sure the UI "catches up" to any document changes
        // this just is a boolean value we flip back and forth to trigger the update lifecycle
        forceUpdateTrack: new fields.BooleanField({initial: false})
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

    /** Force the update lifecycle to happen on a nonsense field */
    async forceUpdate() {
        this.parent.update({system: {forceUpdateTrack: !this.forceUpdateTrack}})
    }

    override async _onCreate(data: any, options: any, userId: string) {
        super._onCreate(data, options, userId)
        this.parent.update({
            'prototypeToken.disposition': CONST.TOKEN_DISPOSITIONS.FRIENDLY,
            'prototypeToken.actorLink': true,
            'prototypeToken.sight.enabled': true,
            'prototypeToken.occludable.radius': 8,
            'system.health.current': 2
        })
    }

    override prepareBaseData() {
        super.prepareBaseData()
        this.ancestry = this.parent.items.find((i: { type: string }) => i.type === 'ancestry')?.system
        this.class = this.parent.items.find((i: { type: string }) => i.type === 'class')?.system

        /**
         * Apply bonuses from Item Rules...
         */
        const actor = this.parent
        if (!actor || !actor.items) return

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
        validateCurrentHP(this)
        validateCurrentLuck(this)
        PerkRulesSelectionsApplicator.apply(this.parent)
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
            if (luckUpdate <= this.stats.luck!) {
                const previousLuck = this.statuses.counters.luck ?? 0
                if (previousLuck !== luckUpdate) {
                    const verb = previousLuck < luckUpdate ? vgLiteLang.HeroSheet.gained : vgLiteLang.HeroSheet.spent;
                    (options as any).resourceTrackerUpdate = { verb: verb, resource: 'luck' }
                }
            }
        }

        const studiedUpdate = foundry.utils.getProperty(changes, "system.statuses.counters.studied") as number | undefined
        if (studiedUpdate) {
            const previousStudied = this.statuses.counters.studied ?? 0
            if (previousStudied !== studiedUpdate) {
                const verb = previousStudied < studiedUpdate ? vgLiteLang.HeroSheet.gained : vgLiteLang.HeroSheet.spent;
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
            sendVgLiteChatMessage(this.parent, createElement(TrackerUpdateChatCard, { heroId: getId(this), verb: pendingResourceTrackerUpdate.verb, resource: pendingResourceTrackerUpdate.resource }))
        }
    }

    getActiveRules() {
        const itemRules = this.parent.items.contents.flatMap((item: any) => {
            const rules = item.system.rules || []
            return rules.filter((r: any) => this.parent.system.level.current >= (r.level || 0))
        })
        return itemRules
    }

}

export function validateCurrentHP(hero: HeroDataModel) {
    if (hero.health.current! > hero.health.max!) {
        hero.health.current = hero.health.max!
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

export function validateCurrentLuck(hero: HeroDataModel) {
    if (hero.statuses.counters.luck! > hero.stats.luck!) {
        hero.statuses.counters.luck = hero.stats.luck!
    }
}

export function setArmorRating(hero: HeroDataModel) {
    const equippedArmor = getArmor(hero)
    hero.armor.rating += equippedArmor?.rating ?? 0
}

export const getArmor = (hero: HeroDataModel): ArmorDataModel => {
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
}

export function setSkillDifficulties(hero: HeroDataModel) {
    const skills = hero.skills
    const stats = hero.stats
    skills.brawl.value = setSkill(Number(stats.might), skills.brawl.isTrained)
    skills.finesse.value = setSkill(Number(stats.dexterity), skills.finesse.isTrained)
    skills.melee.value = setSkill(Number(stats.might), skills.melee.isTrained)
    skills.ranged.value = setSkill(Number(stats.awareness), skills.ranged.isTrained)
    skills.arcana.value = setSkill(Number(stats.reason), skills.arcana.isTrained)
    skills.craft.value = setSkill(Number(stats.reason), skills.craft.isTrained)
    skills.detect.value = setSkill(Number(stats.awareness), skills.detect.isTrained)
    skills.influence.value = setSkill(Number(stats.presence), skills.influence.isTrained)
    skills.leadership.value = setSkill(Number(stats.presence), skills.leadership.isTrained)
    skills.medicine.value = setSkill(Number(stats.reason), skills.medicine.isTrained)
    skills.mysticism.value = setSkill(Number(stats.awareness), skills.mysticism.isTrained)
    skills.performance.value = setSkill(Number(stats.presence), skills.performance.isTrained)
    skills.sneak.value = setSkill(Number(stats.dexterity), skills.sneak.isTrained)
    skills.survival.value = setSkill(Number(stats.awareness), skills.survival.isTrained)
}

export function setSkill(stat: number, isTrained: boolean): number {
    return isTrained ? (20 - stat * 2) : (20 - stat)
}

export function setSaves(hero: HeroDataModel) {
    const base = 20
    hero.saves.reflex = base - (hero.stats.dexterity! + hero.stats.awareness!)
    hero.saves.endure = base - (hero.stats.might! * 2)
    hero.saves.will = base - (hero.stats.reason! + hero.stats.presence!)
}

export function setSpellcastingStats(hero: HeroDataModel) {
    const manaValues = calculateManaValues(
        hero.level.current ?? 0,
        Number(hero.stats[hero.class?.maxManaStat]),
        hero.class?.manaMultiplier ?? 1
    )
    hero.mana.max += manaValues.max
    hero.mana.maxCast += manaValues.maxCast
}

export function calculateManaValues(level: number, manaStatVal: number, multiplier: number): { max: number, maxCast: number } {
    if (level === 0 || Number.isNaN(manaStatVal) || manaStatVal === 0) return { max: 0, maxCast: 0 }
    const max = level * multiplier
    const maxCast = level < 1 ? 0 : Math.ceil(level / 2) + manaStatVal
    return { max: max, maxCast: maxCast }
}

export function setXpToNextLevel(hero: HeroDataModel) {
    const XP_CURVE = 10
    hero.level.xpToLevel = (hero.level.current! + 1) * XP_CURVE
}

function setInventoryData(hero: HeroDataModel) {
    hero.inventory.items = hero.parent.items.filter((i: any) => isInventoryItem(i)).map((i: any) => i.system)
    hero.inventory.capacity += Number(hero.stats.might) + 8 - hero.statuses.counters.fatigue!
}