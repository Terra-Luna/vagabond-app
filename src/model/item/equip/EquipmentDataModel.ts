import { sys_id } from "../../../util/foundry-util"
import { appLang } from "../../../util/lang"
import { LightSourceUtil } from "../../../util/LightSourceUtil"
import { localizeString } from "../../../util/locale-util"
import { sendVagabondChatCard } from "../../../view/chat/ChatCardSerializer"
import {
  addCoins,
  Coins,
  coinSchema,
  consolidateCoins,
  multiplyCoins,
  toCopper,
  zeroCoins,
} from "../../common/coin-value-schema"
import {
  fields,
  optionalString,
  requiredInteger,
  requiredString,
  uncappedInteger,
} from "../../common/shared-schemas"
import { BaseItemSchema, ItemDataModel } from "../ItemDataModel"

export const BIND_REQUEST_FLAG = "bindRequestPending"
export const WAS_BOUND_FLAG = "wasBound"

/**
 * Anything a hero can have in their inventory.
 * Subtypes: Armor, Weapon, Alchemical, Tool, Sundry
 */
const baseEquipmentSchema = () => {
  return {
    category: new fields.StringField({
      ...requiredString,
      choices: Object.keys(appLang.EquipmentCategories),
      initial: "other",
    }),
    value: new fields.SchemaField({ ...coinSchema() }),
    copperValue: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    bulk: new fields.SchemaField({
      slots: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      isStackable: new fields.BooleanField({ initial: false }),
      stackSize: new fields.NumberField({ ...requiredInteger, initial: 10 }),
      quantity: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      totalSlots: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    }),
    isEquippable: new fields.BooleanField({ initial: false }),
    isEquipped: new fields.BooleanField({ initial: false }),
    isBound: new fields.BooleanField({ initial: false }),
    isConsumable: new fields.BooleanField({ initial: false }),
    lightSourceData: new fields.SchemaField({
      isLightSource: new fields.BooleanField({ initial: false }),
      isLit: new fields.BooleanField({ initial: false }),
      litTS: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 0,
      }),
      litImage: new fields.StringField({ ...requiredString, initial: "" }),
      range: new fields.NumberField({ ...requiredInteger, initial: 30 }),
      color: new fields.StringField({ ...requiredString, initial: `#FFFFFF` }),
      duration: new fields.NumberField({ ...requiredInteger, initial: 3600 }),
      requiresFuel: new fields.BooleanField({ initial: false }),
      isFueled: new fields.BooleanField({ initial: false }),
      expendable: new fields.BooleanField({ initial: true }),
      remaining: new fields.NumberField({
        required: true,
        nullable: false,
        initial: -1,
      }),
      isSunlight: new fields.BooleanField({ initial: false }),
      isMoonlight: new fields.BooleanField({ initial: false }),
      isDark: new fields.BooleanField({ initial: false }),
    }),
    relicPowers: new fields.ArrayField(
      new fields.SchemaField({
        id: new fields.StringField({ ...requiredString }),
        category: new fields.SchemaField({
          value: new fields.StringField({ ...requiredString }),
          label: new fields.StringField({ ...requiredString }),
        }),
        power: new fields.SchemaField({
          value: new fields.StringField({ ...requiredString }),
          label: new fields.StringField({ ...requiredString }),
          modifiers: new fields.ArrayField(
            new fields.SchemaField({
              selector: new fields.ArrayField(
                new fields.StringField({ ...requiredString }),
                { initial: [] },
              ),
              value: new fields.NumberField({ ...uncappedInteger }),
            }),
            { initial: [] },
          ),
          appliedEffect: new fields.SchemaField(
            {
              effect: new fields.StringField({ ...requiredString }),
              duration: new fields.StringField({ ...optionalString }),
              damageType: new fields.StringField({ ...optionalString }),
            },
            { required: false, nullable: true, initial: null },
          ),
          beingTypes: new fields.ArrayField(
            new fields.StringField({ ...optionalString }),
            { initial: [] },
          ),
          damageType: new fields.StringField({ ...optionalString }),
        }),
        goldValue: new fields.NumberField({ ...requiredInteger }),
        bound: new fields.BooleanField({ initial: false }),
        description: new fields.StringField({ ...optionalString }),
      }),
      { initial: [] },
    ),
  }
}

export type EquipmentSchema = ReturnType<typeof baseEquipmentSchema> &
  BaseItemSchema

export abstract class EquipmentDataModel<
  T extends EquipmentSchema,
> extends ItemDataModel<T> {

  declare isEquippable: boolean
  declare isEquipped: boolean
  declare isBound: boolean
  declare totalValue: Coins

  static override defineSchema() {
    return {
      ...super.defineSchema(),
      ...baseEquipmentSchema(),
    }
  }

  /** Converts legacy relic modifiers that used a single `path` string into `selector` arrays. */
  static override migrateData(source: any) {
    source?.relicPowers?.forEach?.((relic: any) => {
      relic?.power?.modifiers?.forEach?.((mod: any) => {
        if (
          mod &&
          !Array.isArray(mod.selector) &&
          typeof mod.path === "string"
        ) {
          mod.selector = mod.path
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        }
        delete mod?.path
      })
    })
    return super.migrateData(source)
  }

  /**
   * The purpose of this is to ensure when an item is dragged from one place to another
   * that its total copper value is serialized. This is, mostly, a patch for a bug within
   * Item Piles where it can't otherwise recognize item values for use with Merchants.
   * @param data
   * @param options
   * @param user
   * @returns
   */
  override async _preCreate(data: any, options: any, user: any) {
    const result = await super._preCreate(data, options, user)
    const totalCopper = toCopper(data.system?.value ?? { ...zeroCoins })
    this.parent.updateSource({ "system.copperValue": totalCopper })

    if (!this.bulk?.isStackable || this.lightSourceData?.isLightSource) {
      this.parent.updateSource({ "flags.item-piles.item.canStack": "no" })
    }
    const owner = this.parent.parent as any
    const light = this.lightSourceData
    if (owner?.type === "hero" && light?.isLightSource && light.isLit) {
      const hasLitSource = owner.items.some(
        (i: any) =>
          i.system?.lightSourceData?.isLightSource &&
          i.system.lightSourceData.isLit,
      )
      if (hasLitSource) {
        this.parent.updateSource({
          "system.lightSourceData.isLit": false,
          "system.lightSourceData.remaining":
            LightSourceUtil.remainingSeconds(light),
          "system.lightSourceData.litTS": 0,
        })
      }
    }
    return result
  }

  override prepareBaseData() {
    super.prepareBaseData()

    if ((this as any).material) {
      const baseValue = this.value
      this.value = multiplyCoins(
        baseValue,
        appLang.Metals[(this as any).material].valueMultiplier,
      )
    }

    let relicValue: Coins | undefined = undefined
    const relicPowers = this.relicPowers
    if (relicPowers && relicPowers.length > 0) {
      relicValue = addCoins(
        relicPowers.map((p) => {
          let value = p.goldValue ?? 1
          if (this.parent.type === "container" && p.id === "utility-holding") {
            value *= (this as any).capacity
          }
          return { g: value ?? 1, s: 0, c: 0 }
        }),
      )
    }

    this.totalValue = multiplyCoins(
      relicValue && toCopper(relicValue) > toCopper(this.value)
        ? relicValue
        : this.value,
      Math.max(1, this.bulk?.quantity ?? 1),
    )
  }

  override prepareDerivedData() {
    super.prepareDerivedData()
    this.bulk.totalSlots = getTotalSlots(this)
    this.copperValue = toCopper((this as any)?.value ?? { ...zeroCoins })
    if (game.user && this.isLockedForUser()) this.parent.name = this.displayName
    const light = this.lightSourceData
    if (light?.isLightSource) {
      this.bulk.isStackable = false
      this.bulk.quantity = 1
    }
    if (light?.isLightSource && this.parent.type === "weapon") {
      light.isLit = this.isEquipped
      light.expendable = false
      light.requiresFuel = false
    }
    if (light?.isLightSource && light.isLit && light.litImage)
      this.parent.img = light.litImage
  }

  override async _preUpdate(changes, options, user) {
    await super._preUpdate(changes, options, user)
    const coinChanges = (changes.system as any)?.value

    if (coinChanges !== undefined) {
      const { g, s, c } = this.value
      const newG = coinChanges.g ?? g
      const newS = coinChanges.s ?? s
      const newC = coinChanges.c ?? c
      ;(changes.system as any).value = consolidateCoins({
        g: newG,
        s: newS,
        c: newC,
      })
    }

    LightSourceUtil.applyBurnState(this.lightSourceData, changes)

    // Light sources are never stackable because the timers would get all mixed up.
    if ((changes.system as any)?.lightSourceData?.isLightSource) {
      const bulk = ((changes.system as any).bulk ??= {})
      bulk.isStackable = false
      if ((this.bulk?.quantity ?? 1) > 1) bulk.quantity = 1
    }

    const newDuration = (changes.system as any)?.lightSourceData?.duration
    if (
      newDuration !== undefined &&
      newDuration !== this.lightSourceData.duration
    ) {
      const isLit =
        (changes.system as any).lightSourceData.isLit ??
        this.lightSourceData.isLit
      LightSourceUtil.resetTimer(changes, newDuration, isLit)
    }
  }

  override async _onUpdate(
    changes: any,
    options: any,
    userId: string,
  ): Promise<void> {
    await super._onUpdate(changes, options, userId)
    const sys = changes?.system
    if (
      game.user?.id === userId &&
      sys &&
      ("isEquipped" in sys || "isBound" in sys || "lightSourceData" in sys)
    ) {
      await LightSourceUtil.syncActorLight(this.parent?.actor)
    }
  }

  override async _onCreate(
    data: any,
    options: any,
    userId: string,
  ): Promise<void> {
    await super._onCreate(data, options, userId)
    if (
      game.user?.id === userId &&
      this.lightSourceData?.isLightSource &&
      this.lightSourceData.isLit
    ) {
      const actor = this.parent?.actor as any
      if (actor?.type === "hero" && this.isEquippable && !this.isEquipped) {
        await actor.system.equip(this.parent)
      }
      await LightSourceUtil.syncActorLight(actor)
    }
  }

  override async _onDelete(options: any, userId: string): Promise<void> {
    await super._onDelete(options, userId)
    if (game.user?.id === userId)
      await LightSourceUtil.syncActorLight(this.parent?.actor)
    /**
     * Check PC's containers and cleanup the deleted item's ID.
     */
    if (game.user?.id === userId) {
      const containers =
        this.parent?.actor?.items?.filter(
          (i) =>
            i.type === "container" && i.system.itemIds.includes(this.parent.id),
        ) ?? []
      for (const container of containers) {
        const itemIds = container.system.itemIds ?? []
        await container.update({
          "system.itemIds": itemIds.filter((id) => id !== this.parent.id),
        })
      }
    }
  }

  toggleEquipped = async () => {
    const updates = { "system.isEquipped": !this.isEquipped }
    if (this.parent.type === "weapon") {
      updates["system.grip.state"] =
        (this as any).grip.style === "HH" ? "HH" : "H"
    }
    await this.parent.update(updates)
    return true
  }

  isRelic = (): boolean => {
    return this.relicPowers.length > 0
  }

  /** True if the item has at least one power that requires binding. */
  isBoundRelic = (): boolean => {
    return this.relicPowers.some((rel) => rel.bound)
  }

  /** True if the hero is currently bound to this item. */
  isBoundToHero = (): boolean => {
    return this.isBound && this.isBoundRelic()
  }

  /** Relic powers apply only while bound (if bindable) and, for equippable items, while equipped. */
  isRelicActive = (): boolean => {
    if (!this.isRelic()) return false
    if (this.isBoundRelic() && !this.isBound) return false
    return this.isBoundRelic() && !this.isEquippable ? true : this.isEquipped
  }

  /** Relic powers that take effect: all while active, otherwise only curses (which always apply). */
  activeRelicPowers = () => {
    return this.isRelicActive()
      ? this.relicPowers
      : this.relicPowers.filter((rel) => rel.category.value === "cursed")
  }

  /** True if the item should contribute any powers to its hero (active, or carrying a curse). */
  hasActivePowers = (): boolean => this.activeRelicPowers().length > 0

  /** Relic powers that take effect on rolls: none while the item is inert on a hero, except curses. */
  appliedRelicPowers = () => {
    const isHeroOwned = this.parent?.parent?.type === "hero"
    if (isHeroOwned && this.isRelic()) return this.activeRelicPowers()
    return this.relicPowers
  }

  /** Relic powers that are visible and applied: bindable relics owned by a hero are inert until bound. */
  effectiveRelicPowers = () => {
    const isHeroOwned = this.parent?.parent?.type === "hero"
    return isHeroOwned && this.isBoundRelic() && !this.isBound
      ? []
      : this.relicPowers
  }

  async toggleBound() {
    if (this.isBound && this.isCursed()) {
      ui.notifications?.info(
        localizeString(appLang.Notifications.boundItemCannotBeRemoved, {
          name: this.parent.name,
        }),
      )
      return
    }
    if (!this.isBound && !this.hasFreeRelicSlot()) return

    // Players must ask the GM before binding.
    const hero = this.parent.parent as any
    if (!this.isBound && hero?.type === "hero" && !game.user?.isActiveGM) {
      await this.requestBinding(hero)
      return
    }
    await this.parent.update({
      "system.isBound": !this.isBound,
      ...(!this.isBound ? { [`flags.${sys_id}.${WAS_BOUND_FLAG}`]: true } : {}),
    } as Record<string, any>)
  }

  hasFreeRelicSlot(): boolean {
    const hero = this.parent.parent as any
    if (hero?.type !== "hero") return true
    const limit = hero.system.boundRelicLimit ?? 3
    if (hero.system.boundRelics().length >= limit) {
      ui.notifications?.warn(
        localizeString(appLang.Notifications.boundRelicLimitExceeded, {
          limit: limit.toString(),
        }),
      )
      return false
    }
    return true
  }

  get isBindRequestPending(): boolean {
    return !!this.parent.getFlag(sys_id, BIND_REQUEST_FLAG)
  }

  private async requestBinding(hero: any) {
    if (this.isBindRequestPending) {
      ui.notifications?.info(
        localizeString(appLang.Notifications.bindRequestAlreadySent, {
          name: this.parent.name,
        }),
      )
      return
    }
    await this.parent.setFlag(sys_id, BIND_REQUEST_FLAG, true)
    const gmIds = (game.users?.filter((user) => user.isGM) ?? []).map(
      (user) => user.id as string,
    )
    await sendVagabondChatCard(
      hero,
      "BindRelicRequestChatCard",
      { heroId: hero.id, itemUuid: this.parent.uuid },
      [],
      gmIds,
    )
    ui.notifications?.info(
      localizeString(appLang.Notifications.bindRequestSent, {
        name: this.parent.name,
      }),
    )
  }

  /** Non-GM users can't see or edit a bindable relic until it has been bound at least once. */
  isLockedForUser = (): boolean => {
    return (
      !game.user?.isActiveGM &&
      this.isBoundRelic() &&
      !this.isBound &&
      !this.parent.getFlag(sys_id, WAS_BOUND_FLAG)
    )
  }

  /** Item name shown to the current user; obfuscated while the relic is locked. */
  get displayName(): string {
    if (!this.isLockedForUser()) return this.parent.name
    const inv = appLang.HeroSheet.Inventory
    if (this.parent.type === "weapon")
      return localizeString(inv.mysteriousWeapon, {})
    if (this.parent.type === "armor")
      return localizeString(inv.mysteriousArmor, {})
    return localizeString(inv.mysteriousRelic, {})
  }

  isCursed = (): boolean => {
    return this.relicPowers.some((rel) => rel.category.value === "cursed")
  }

}

export const getTotalSlots = (item: any): number => {
  const bulk = item?.bulk ?? item?.system?.bulk
  if (!bulk) return 0
  if (bulk.isStackable) {
    return getStackSlots(item)
  }
  else {
    return bulk.slots ?? 0
  }
}

export const getStackSlots = (stack: any): number => {
  const bulk = stack?.bulk ?? stack?.system?.bulk
  if (!bulk) return 0
  const slots = bulk.slots ?? 0
  const qty = bulk.quantity ?? 1
  const stackSize = bulk.stackSize || 10
  return slots > 0 ? qty * slots : Math.ceil(qty / stackSize)
}
