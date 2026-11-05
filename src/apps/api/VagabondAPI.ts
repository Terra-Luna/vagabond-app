import { claimSpotlight, nextCombatant } from "../../combat/combat-util"
import { HeroAttack } from "../../combat/engine/HeroAttack"
import { SkillCheck } from "../../combat/engine/roll/SkillCheck"
import { HuntersMark } from "../../combat/engine/util/HuntersMark"
import type { HeroDataModel } from "../../model/actor/HeroDataModel"
import { PolymorphUtil } from "../../model/actor/util/PolymorphUtil"
import { WeaponDataModel } from "../../model/item/equip/WeaponDataModel"
import { ItemsCache } from "../../rules/util/ItemsCache"
import { sys_id } from "../../util/foundry-util"
import { appLang } from "../../util/lang"
import { localizeString } from "../../util/locale-util"
import type { RollPreset } from "../attack-builder/model/RollPreset"
import { RestApp } from "../rest/RestApp"
import { SpellcastingApp } from "../spellcasting/SpellcastingApp"
import { TravelApp } from "../travel/TravelApp"
import { PolymorphApp } from "../vagabond-tools/polymorph/PolymorphApp"
import { HeroItemSync } from "./util/HeroItemSync"

export interface VagabondAPI {
  rules: {
    toggleEffect: (
      actor: Actor & { system: HeroDataModel },
      itemId: string,
      stateOverride?: boolean,
    ) => void
  }
  hero: {
    skillCheck: ({ skill, event }: { skill: string; event: any }) => void
    weaponAttack: ({
      actor,
      itemId,
      skill,
      event,
    }: {
      actor: Actor & { system: HeroDataModel }
      itemId: string
      skill?: string
      event: any
    }) => void
    rollPreset: ({
      actor,
      presetId,
      event,
    }: {
      actor: Actor & { system: HeroDataModel }
      presetId: string
      event: any
    }) => void
    openSpellcasting: (actor: Actor & { system: HeroDataModel }) => void
  }
  combat: {
    claimSpotlight: () => void
    next: () => void
    huntersMark: (target?: Token) => Promise<void>
  }
  util: {
    polymorphApp: (actor?: Actor & { system: HeroDataModel }) => void
    cancelPolymorph: (targets?: (Actor & { system: HeroDataModel })[]) => void
    rest: () => void
    travel: () => void
    syncAncestryAndClass: (
      actor: Actor & { system: HeroDataModel },
      sendChat?: boolean,
    ) => Promise<void>
  }
}

export const api: VagabondAPI = {
  rules: {
    toggleEffect: (
      actor: Actor & { system: HeroDataModel },
      itemId: string,
      stateOverride?: boolean,
    ) => {
      const item = ItemsCache.allItems().find(
        (it) => it.id === itemId.split(".").pop(),
      )
      if (item) {
        actor.system.toggleItemRule(item, stateOverride)
      }
      else {
        ui.notifications?.error(
          localizeString(appLang.Notifications.apiItemNotFound, { id: itemId }),
        )
      }
    },
  },

  hero: {
    skillCheck: ({ skill, event }: { skill: string; event: any }) => {
      const actor = getControlledHeroToken()
      if (!actor || !skill) return
      new SkillCheck(actor.system, {
        type: "check",
        skill,
        clickEvent: event,
      }).roll()
    },

    weaponAttack: ({
      itemId,
      skill,
      event,
    }: {
      itemId: string
      skill?: string
      event: any
    }) => {
      const actor = getItemMacroHero(itemId)
      if (!actor) return

      const item = actor.items.get(itemId) as Item & {
        system: WeaponDataModel
      }
      if (!item) return

      if (item.system instanceof WeaponDataModel) {
        HeroAttack.buildWeaponAttack(actor, item as any, skill).initiate(
          event,
          {
            requireFocusUpkeep: true,
          },
        )
      }
    },

    rollPreset: ({ presetId, event }: { presetId: string; event: any }) => {
      const actor = getOwnedHeroes()?.find((it) =>
        it.flags?.[sys_id]?.rollPresets?.some(
          (p: RollPreset) => p.id === presetId,
        ),
      ) as Actor & { system: HeroDataModel }
      if (!actor || !presetId) return

      const presets = [
        ...((actor.getFlag(sys_id, "rollPresets" as any) as RollPreset[]) ??
          []),
      ]
      const preset = presets.find((p) => p.id === presetId)
      if (!preset) return

      HeroAttack.buildCustomRoll(actor, preset, event)
    },

    openSpellcasting: (actor: Actor & { system: HeroDataModel }) => {
      if (!actor || !actor.isOwner || actor.system.spells.length === 0) return
      new SpellcastingApp(actor, false, true).render({ force: true })
    },
  },

  util: {
    polymorphApp: (actor?: Actor & { system: HeroDataModel }) => {
      const caster = actor ?? game.user?.character ?? getControlledHeroToken()
      const canPolymorph =
        !!caster &&
        (game.user?.isActiveGM ||
          ((caster as any).isOwner &&
            (caster as any).system?.spells?.some(
              (it: any) => it.parent?.flags?.[sys_id]?.polymorph,
            )))
      if (!canPolymorph) {
        ui.notifications?.warn("Select an Actor who can Polymorph")
        return
      }
      new PolymorphApp({ caster: caster as any }).render({ force: true })
    },

    cancelPolymorph: (targets?: (Actor & { system: any })[]) => {
      if (!targets || targets.length === 0 || !game.user?.isActiveGM) return
      PolymorphUtil.polymorph({ targets: targets })
    },

    rest: () => {
      const actor = getControlledHeroToken()
      if (!actor) return
      new RestApp(actor).render({ force: true })
    },

    travel: () => {
      const actor = getControlledHeroToken()
      if (!actor) return
      new TravelApp(actor).render({ force: true })
    },

    syncAncestryAndClass: HeroItemSync.syncAncestryAndClass,
  },

  combat: {
    /**
     * Let's players take the spotlight and cycle it thru their characters.
     */
    claimSpotlight: async () => {
      await claimSpotlight()
    },

    /**
     * Lets the GM advance thru the combatant list w/o having to click on buttons.
     */
    next: async () => {
      await nextCombatant()
    },

    /**
     * Applies 'Hunter's Mark' to the target, clearing any previous Mark from the same Hunter.
     */
    huntersMark: async (target?: Token) => {
      await HuntersMark.mark(target)
    },
  },
}

const getItemMacroHero = (
  itemId: string,
): (Actor & { system: HeroDataModel }) | undefined => {
  return getOwnedHeroes()?.find(
    (it) =>
      it.items?.get(itemId) &&
      it.items?.get(itemId)?.system instanceof WeaponDataModel &&
      (it.items?.get(itemId)?.system as any).isEquipped,
  ) as Actor & { system: HeroDataModel }
}

const getOwnedHeroes = () => {
  return game.actors?.contents?.filter(
    (it) => (it.type as any) === "hero" && it.isOwner,
  )
}

const getControlledHeroToken = (): Actor & { system: HeroDataModel } => {
  return (
    (canvas?.tokens?.controlled?.[0]?.actor as Actor & {
      system: HeroDataModel
    }) ?? (game.user?.character as Actor & { system: HeroDataModel })
  )
}
