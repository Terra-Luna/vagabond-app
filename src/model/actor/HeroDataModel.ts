import { createElement } from "react"
import { vgLiteLang } from "../../utils/lang"
import { getId } from "../../utils/modelUtil"
import { sendVgLiteChatMessage } from "../../view/chat/ChatCardManager"
import { TrackerUpdateChatCard } from "../../view/chat/TrackerUpdateChatCard"
import { consolidateCoins } from "../common/CoinValue"
import { fields, optionalString, requiredInteger } from "../common/sharedSchemas"
import { AncestryDataModel } from "../item/character/AncestryDataModel"
import { ClassDataModel } from "../item/character/ClassDataModel"
import { PerkDataModel } from "../item/character/PerkDataModel"
import { SpellDataModel } from "../item/character/SpellDataModel"
import { ActorDataModel, BaseActorSchema } from "./ActorDataModel"
import { setArmorRating } from "./type/Armor"
import { heroBonusSchema } from "./type/Bonus"
import { setMaxHP, validateCurrentHP } from "./type/Health"
import { inventorySchema, setInventoryData } from "./type/Inventory"
import { levelSchema, setXpToNextLevel } from "./type/Level"
import { manaSchema, setManaValues } from "./type/Mana"
import { savesSchema, setSaves } from "./type/Saves"
import { setDifficulties as setSkillDifficulties, skillsSchema } from "./type/Skills"
import { setSpeeds, speedSchema } from "./type/Speed"
import { statsSchema, validateCurrentLuck } from "./type/Stats"

const heroSchema = () => {
    return {
        tagalongId: new fields.StringField({ ...optionalString }),
        level: new fields.SchemaField({ ...levelSchema() }),
        stats: new fields.SchemaField({ ...statsSchema() }),
        skills: new fields.SchemaField({ ...skillsSchema() }),
        saves: new fields.SchemaField({ ...savesSchema() }),
        speed: new fields.SchemaField({ ...speedSchema() }),
        studied: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        fatigue: new fields.NumberField({ ...requiredInteger, initial: 0, max: 5 }),
        mana: new fields.SchemaField({ ...manaSchema() }),
        boundRelicLimit: new fields.NumberField({ integer: true, initial: 3 }),
        inventory: new fields.SchemaField({ ...inventorySchema() }),

        /**
         * Derived from embedded documents...
         */
        ancestry: new fields.SchemaField({ ...AncestryDataModel.defineSchema() }),
        class: new fields.SchemaField({ ...ClassDataModel.defineSchema() }),
        perks: new fields.ArrayField(new fields.SchemaField({ ...PerkDataModel.defineSchema() })),
        spells: new fields.ArrayField(new fields.SchemaField({ ...SpellDataModel.defineSchema() })),
        bonus: new fields.SchemaField({ ...heroBonusSchema() })
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

    override async prepareBaseData() {
        super.prepareBaseData()
        this.ancestry = this.parent.items.find((i: { type: string }) => i.type === 'ancestry')?.system
        this.class = this.parent.items.find((i: { type: string }) => i.type === 'class')?.system
        this.perks = this.parent.items.filter((i: { type: string }) => i.type === 'perk')?.map((it: { system: any }) => it.system)
        this.spells = this.parent.items.filter((i: { type: string }) => i.type === 'spell')?.map((it: { system: any }) => it.system)
        setInventoryData(this)
        setXpToNextLevel(this)
        setMaxHP(this)
        setManaValues(this)
        setSaves(this)
        setSpeeds(this)
        setSkillDifficulties(this)
        validateCurrentLuck(this)
        validateCurrentHP(this)
        setArmorRating(this)
    }

    override async _preUpdate(changes, options, user) {
        await super._preUpdate(changes, options, user)
        const coinChanges = (changes.system as any)?.inventory?.coins
        if (coinChanges !== undefined) {
            const { g, s, c } = this.inventory.coins
            const newG = coinChanges.g ?? g
            const newS = coinChanges.s ?? s
            const newC = coinChanges.c ?? c;
            (changes.system as any).inventory.coins = consolidateCoins({ g: newG, s: newS, c: newC })
        }

        const luckUpdate = foundry.utils.getProperty(changes, "system.stats.currentLuck") as number | undefined
        if (luckUpdate !== undefined) {
            if (luckUpdate <= this.stats.luck!) {
                const previousLuck = this.stats.currentLuck
                console.log(luckUpdate, previousLuck)
                if (previousLuck !== luckUpdate) {
                    const verb = previousLuck < luckUpdate ? vgLiteLang.HeroSheet.gained : vgLiteLang.HeroSheet.spent;
                    (options as any).resourceTrackerUpdate = { verb: verb, resource: 'luck' }
                }
            }
        }

        const studiedUpdate = foundry.utils.getProperty(changes, "system.studied") as number | undefined
        if (studiedUpdate !== undefined) {
            const previousStudied = this.studied
            if (previousStudied !== studiedUpdate) {
                const verb = previousStudied < studiedUpdate ? vgLiteLang.HeroSheet.gained : vgLiteLang.HeroSheet.spent;
                (options as any).resourceTrackerUpdate = { verb: verb, resource: 'studied' }
            }
        }
    }

    override async _onUpdate(changes, options, userId) {
        super._onUpdate(changes, options, userId)
        if (userId !== game.user!.id) return

        const pendingResourceTrackerUpdate = (options as any).resourceTrackerUpdate
        if (pendingResourceTrackerUpdate) {
            sendVgLiteChatMessage(this.parent, createElement(TrackerUpdateChatCard, { heroId: getId(this), verb: pendingResourceTrackerUpdate.verb, resource: pendingResourceTrackerUpdate.resource }))
        }
    }

}

export function getSkillByName(hero: HeroDataModel, skillName: string): { name: string, value: number, isTrained: boolean } {
    const skill = hero.skills[skillName.toLowerCase()]
    return { name: skillName, value: skill.value, isTrained: skill.isTrained }
}