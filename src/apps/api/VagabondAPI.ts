import { HeroAttack } from "../../combat/engine/HeroAttack"
import { HeroDataModel } from "../../model/actor/HeroDataModel"
import { WeaponDataModel } from "../../model/item/equip/WeaponDataModel"
import { ItemsCache } from "../../rules/util/ItemsCache"
import { sys_id } from "../../utils/foundryUtils"
import { appLang } from "../../utils/lang"
import { localizeString } from "../../utils/localeUtils"
import { RollPreset } from "../attack-builder/model/RollPreset"

export interface VagabondAPI {
    rules: {
        toggleEffect: (actor: Actor & { system: HeroDataModel }, itemId: string, stateOverride?: boolean) => void
    },
    combat: {
        weaponAttack: ({ actor, itemId, skill, event }: { actor: Actor & { system: HeroDataModel }, itemId: string, skill?: string, event: any }) => void,
        rollPreset: ({ actor, presetId, event }: { actor: Actor & { system: HeroDataModel }, presetId: string, event: any }) => void
    }
}

export const api: VagabondAPI = {
    rules: {
        toggleEffect: (actor: Actor & { system: HeroDataModel }, itemId: string, stateOverride?: boolean) => {
            const item = ItemsCache.allItems().find(it => it.id === itemId.split('.').pop())
            if (item) {
                actor.system.toggleItemRule(item, stateOverride)
            }
            else {
                ui.notifications?.error(localizeString(appLang.Notifications.apiItemNotFound, { id: itemId }))
            }
        }
    },
    combat: {
        weaponAttack: ({ actor, itemId, skill, event }: {
            actor: Actor & { system: HeroDataModel }
            itemId: string
            skill?: string
            event: any
        }) => {
            if (!actor) return

            const item = actor.items.get(itemId) as Item & { system: WeaponDataModel }
            if (!item) return

            if (item.system instanceof WeaponDataModel) {
                HeroAttack.buildWeaponAttack(actor, item as any, skill).initiate(event)
            }
        },

        rollPreset: ({ actor, presetId, event }: { actor: Actor & { system: HeroDataModel }, presetId: string, event: any }) => {
            if (!actor || !presetId) return
            
            const presets = [...actor.getFlag(sys_id, "rollPresets" as any) as RollPreset[] ?? []]
            const preset = presets.find(p => p.id === presetId)
            if (!preset) return

            HeroAttack.buildCustomRoll(actor, preset, event)
        }
    }

}