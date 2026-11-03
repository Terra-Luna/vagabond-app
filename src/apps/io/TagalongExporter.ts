import type { HeroDataModel } from "../../model/actor/HeroDataModel"
import { isInventoryItem } from "../../model/actor/schema/inventory"
import type { ArmorDataModel } from "../../model/item/equip/ArmorDataModel"
import type {
  EquipmentDataModel,
  EquipmentSchema,
} from "../../model/item/equip/EquipmentDataModel"
import type { WeaponDataModel } from "../../model/item/equip/WeaponDataModel"
import type { TagalongApi, TagalongItem } from "./TagalongApi"

type TagalongHero = Awaited<ReturnType<typeof TagalongApi.fetchHero>>
type TagalongCharacter = TagalongHero["character"]

export class TagalongExporter {

  static export(hero: HeroDataModel) {
    const tagalongHero = this.buildTagalongHero(hero)
    const filename = this.createFilename(hero)
    foundry.utils.saveDataToFile(
      JSON.stringify(tagalongHero, null, 2),
      "application/json",
      filename,
    )
  }

  /** Adds a "Tagalong Export" entry for heroes right after the "Export Data" entry. */
  static extendContextOptions(options: any[]) {
    const getHero = (li: HTMLElement): any => {
      const id = li.closest<HTMLElement>("[data-entry-id]")?.dataset.entryId
      return id ? game.actors?.get(id) : undefined
    }
    const entry = {
      label: "Tagalong Export",
      icon: "fa-solid fa-file-export",
      visible: (li: HTMLElement) => {
        const actor = getHero(li)
        return actor?.type === "hero" && actor.isOwner
      },
      onClick: (_event: Event, li: HTMLElement) => {
        this.export(getHero(li).system as HeroDataModel)
      },
    }
    const exportIndex = options.findIndex(
      (option) => option.label === "SIDEBAR.Export",
    )
    const importIndex = options.findIndex(
      (option) => option.label === "SIDEBAR.Import",
    )
    const index =
      exportIndex >= 0 && importIndex === exportIndex + 1
        ? importIndex
        : options.length
    options.splice(index, 0, entry)
  }

  /** Mirrors Document#exportToJSON, but overrides the filename format. */
  static exportFoundryData(actor: any, options: object = {}) {
    const data = actor.toCompendium(null, { clearSource: false, ...options })
    data._stats ??= {}
    data._stats.exportSource = {
      worldId: game.world?.id,
      uuid: actor.uuid,
      coreVersion: game.version,
      systemId: game.system?.id,
      systemVersion: game.system?.version,
    }
    foundry.utils.saveDataToFile(
      JSON.stringify(data, null, 2),
      "application/json",
      this.createFilename(actor.system, new Date(), "fvtt"),
    )
  }

  static buildTagalongHero(hero: HeroDataModel): TagalongHero {
    return {
      character: {
        id: hero.tagalongId || hero.parent.id,
        userId: "",
        name: hero.parent.name,
        ancestry:
          hero.parent.items.find((item) => item.type === "ancestry")?.name ??
          "",
        ancestry_bonus_skill: "",
        ancestry_bonus_spell: "",
        class:
          hero.parent.items.find((item) => item.type === "class")?.name ?? "",
        level: hero.level.current ?? 0,
        xp: hero.level.xp ?? 0,
        assignedStats: this.mapStats(hero.stats),
        levelStats: this.emptyStats(),
        advancementStats: this.emptyStats(),
        strongPotentialStat: "",
        trained_skills: this.getTrainedSkills(hero),
        active_actions: [],
        known_spells: hero.spells.map((spell) => spell.parent.name),
        selected_perks: hero.perks.map((perk) => ({
          source: "manual",
          id: perk._sourceId ?? perk.parent.id,
          name: perk.parent.name,
        })),
        current_hp: hero.health.value ?? 0,
        current_mana: hero.mana.value ?? 0,
        fatigue: hero.statuses.counters.fatigue,
        current_luck: hero.statuses.counters.luck,
        studied_dice: hero.statuses.counters.studied,
        current_wealth: { ...hero.inventory.coins },
        inventory: hero.parent.items
          .filter(isInventoryItem)
          .map((item) => this.mapInventoryItem(item)),
      },
    }
  }

  static createFilename(
    hero: HeroDataModel,
    date = new Date(),
    prefix = "vgbndapp",
  ): string {
    const ancestry =
      hero.parent.items.find((item) => item.type === "ancestry")?.name ?? ""
    const characterClass =
      hero.parent.items.find((item) => item.type === "class")?.name ?? ""
    const timestamp = [
      date.getFullYear(),
      this.padNumber(date.getMonth() + 1),
      this.padNumber(date.getDate()),
      this.padNumber(date.getHours()),
      this.padNumber(date.getMinutes()),
      this.padNumber(date.getSeconds()),
    ].join("-")
    const filenameParts = [
      prefix,
      hero.parent.name,
      `L${hero.level.current}`,
      ancestry,
      characterClass,
      timestamp,
    ]

    return `${filenameParts.map((part) => this.sanitizeFilenamePart(part)).join("-")}.json`
  }

  private static mapStats(
    stats: HeroDataModel["stats"],
  ): TagalongCharacter["assignedStats"] {
    return {
      might: stats.might ?? 0,
      dexterity: stats.dexterity ?? 0,
      awareness: stats.awareness ?? 0,
      reason: stats.reason ?? 0,
      presence: stats.presence ?? 0,
      luck: stats.luck ?? 0,
    }
  }

  private static emptyStats(): TagalongCharacter["levelStats"] {
    return {
      might: 0,
      dexterity: 0,
      awareness: 0,
      reason: 0,
      presence: 0,
      luck: 0,
    }
  }

  private static getTrainedSkills(hero: HeroDataModel): string[] {
    return Object.entries(hero.skills)
      .filter(([, skill]) => skill.trained)
      .map(([name]) => name)
  }

  private static mapInventoryItem(document: Item): TagalongItem {
    const item = document.system as EquipmentDataModel<EquipmentSchema>
    const type = String(document.type)
    const id = document.id ?? document._id
    if (!id) {
      throw new Error(
        `Cannot export inventory item without an ID: ${document.name}`,
      )
    }
    const weapon =
      type === "weapon" ? (document.system as WeaponDataModel) : undefined
    const armor =
      type === "armor" ? (document.system as ArmorDataModel) : undefined
    const damage = weapon?.damage.dice
    const grip = (value: string | undefined) =>
      value === "H" ? "1H" : value === "HH" ? "2H" : (value ?? "")

    return {
      id,
      name: document.name,
      computedName: item.displayName,
      notes: item.description,
      type: this.getTagalongItemType(type, item.isEquippable),
      category: item.category,
      quantity: item.bulk.quantity,
      slots: item.bulk.slots,
      total_slots: item.bulk.totalSlots,
      value: { ...item.value },
      can_equip: item.isEquippable,
      is_equipped: item.isEquipped,
      is_custom: false,
      range: weapon?.range ?? "",
      damage: damage
        ? `d${damage.faces}${damage.modifier ? (damage.modifier > 0 ? "+" : "") + damage.modifier : ""}`
        : "",
      grip: grip(weapon?.grip.style),
      active_grip: grip(weapon?.grip.state),
      properties: weapon?.properties ?? [],
      might_req: armor?.mightReq ?? 0,
      armor_rating: armor?.rating ?? 0,
      material: weapon?.material ?? armor?.material ?? "",
      relic_powers: item.relicPowers.map(({ id }) => ({ id })),
    }
  }

  private static getTagalongItemType(type: string, canEquip: boolean): string {
    if (type === "alchemical") return "alchemy"
    if (type === "sundry") return canEquip ? "gear" : "other"
    if (type === "container") return "gear"
    return type
  }

  private static padNumber(value: number): string {
    return value.toString().padStart(2, "0")
  }

  private static sanitizeFilenamePart(value: string): string {
    return value
      .replace(/[<>:"/\\|?*]/g, "")
      .trim()
      .replace(/\s+/g, "-")
  }

}
