import { coinSchema } from "../common/coin-value-schema"
import { fields } from "../common/shared-schemas"
import { ActorDataModel } from "./ActorDataModel"
import { onNpcPreCreate } from "./util/npc-data-model-util"

export class ItemActorDataModel extends ActorDataModel<any> {

  /**
   * Blank Actor data model for support with plugins such as Item Piles.
   */
  static defineSchema() {
    return {
      ...super.defineSchema(),
      inventory: new fields.SchemaField({
        coins: new fields.SchemaField({ ...coinSchema() }),
      }),
    }
  }

  override prepareDerivedData() {
    super.prepareDerivedData?.()
    const actor = this.parent as any
    if (!game.user || game.user.isActiveGM) return
    const locked = actor.items?.find(
      (it: any) =>
        it.system?.isLockedForUser?.() &&
        it._source?.name === actor._source?.name,
    )
    if (locked) actor.name = locked.system.displayName
  }

  override async _preCreate(data: any, options: any, user: any) {
    const allowed = await super._preCreate(data, options, user)
    onNpcPreCreate(
      this,
      options,
      data,
      allowed,
      false,
      CONST.TOKEN_DISPOSITIONS.NEUTRAL,
    )
  }

}
