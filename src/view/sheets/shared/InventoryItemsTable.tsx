import { Hand, HandFist, Shield } from "lucide-react"

import type { ActorDataModel, BaseActorSchema } from "../../../model/actor/ActorDataModel"
import type { HeroDataModel } from "../../../model/actor/HeroDataModel"
import { itemNameQty, openItemSheet } from "../../../model/actor/schema/inventory"
import type { EquipmentDataModel, EquipmentSchema } from "../../../model/item/equip/EquipmentDataModel"
import { inventoryItemDragDropHandler, useItem } from "../../../util/inventory-util"
import { appLang } from "../../../util/lang"
import { LightSourceUtil } from "../../../util/LightSourceUtil"
import { getId } from "../../../util/model-util"
import { tableBorder } from "../../common/border-styles"
import { UtilityButton } from "../../component/Button"
import { CtxMenuItem, useContextMenu } from "../../component/ContextMenu"
import { useDragDrop } from "../../component/DragDrop"
import { LightToggleButton } from "../../component/LightToggleButton"
import { Timer } from "../../component/Timer"
import { Tooltip } from "../../component/Tooltip"
import { ItemIconImg } from "./ItemIconImg"

export const InventoryItemsTable = ({
  actor,
  items,
  contextMenuItems,
  showEquipColumn = true,
}: {
  actor: ActorDataModel<BaseActorSchema> | null
  items: EquipmentDataModel<EquipmentSchema>[]
  contextMenuItems: (item: EquipmentDataModel<EquipmentSchema>) => CtxMenuItem[]
  showEquipColumn?: boolean
}) => {
  const { onCtxMenu, ContextMenu } = useContextMenu()

  const {
    dragIndex,
    dragItem,
    targetItem,
    onDragStart,
    onDragEnter,
    onDragLeave,
    onDragEnd,
  } = useDragDrop(items, () =>
    inventoryItemDragDropHandler(
      actor,
      dragItem,
      targetItem ?? items[items.length - 1],
      items,
    ),
  )

  return (
    <div className="overflow-auto" onDragLeave={(e) => onDragLeave(e)}>
      <table className={`table-fixed w-full ${tableBorder}`}>
        <thead className="bg-section-header-fill text-text-section-header text-sm">
          <tr>
            <th className="text-left pl-2">
              {appLang.HeroSheet.Inventory.item}
            </th>
            <th className="text-center w-14">
              {appLang.HeroSheet.Inventory.slots}
            </th>
            {/* <th className="text-center">{appLang.HeroSheet.Inventory.value}</th> */}
            {showEquipColumn && (
              <th className="text-right pr-2 w-16">
                {appLang.HeroSheet.Inventory.equip}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="font-eskapade">
          {items.map(
            (item: EquipmentDataModel<EquipmentSchema>, index: number) => {
              const isEquipped = item.isEquipped
              const isBindable = item.isBoundRelic()
              const isBound = item.isBound
              const isCursed = item.isCursed()
              const tooltip = `${
                isBindable && !isBound && !isCursed
                  ? `This item can be Bound to you.\nRequires a 10 minute Ritual.\nLimit: ${(actor as any)?.boundRelicLimit ?? 3} Bound items`
                  : `${isBindable && isBound ? "This item is Bound to you." : ""}`
              }`

              return (
                <tr
                  key={getId(item)}
                  className={
                    index === dragIndex
                      ? "bg-text-fatigue-current draggable"
                      : `even:bg-table-row-even/50 odd:bg-table-row-odd/50 hover-glow draggable`
                  }
                  onContextMenu={(e) => {
                    onCtxMenu(e, contextMenuItems(item))
                  }}
                  onDoubleClick={() => openItemSheet(item)}
                  draggable={true}
                  onDragStart={(e) => onDragStart(e, index)}
                  onDragEnter={(e) => onDragEnter(e, index)}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onDragEnd={(e) => onDragEnd(e, index)}
                  data-item-id={getId(item)}
                >
                  {/* ITEM NAME & ICON */}
                  <td>
                    <div className="flex gap-x-0.5 items-center ml-0.5 py-1 min-w-0">
                      <ItemIconImg item={item} />
                      <p className="items-center truncate">
                        {itemNameQty(item)}
                      </p>
                      {LightSourceUtil.showsTimer(
                        (item as any).lightSourceData,
                      ) && (
                        <Timer
                          className="text-xs ml-1 shrink-0"
                          running={(item as any).lightSourceData.litTS > 0}
                          getSeconds={(now) =>
                            LightSourceUtil.remainingSeconds(
                              (item as any).lightSourceData,
                              now,
                            )
                          }
                        />
                      )}
                    </div>
                  </td>
                  {/* BULK SLOTS */}
                  <td className="text-center font-normal">
                    {item.bulk.totalSlots}
                  </td>
                  {/* VALUE */}
                  {/* <td className="text-center font-normal truncate">
                                    {coinsAsString(item.totalValue)}
                                </td> */}
                  {/* EQUIP STATUS */}
                  {showEquipColumn &&
                    (item.isEquippable ? (
                      <td className="items-center">
                        <div className="flex items-center justify-end gap-x-2 pr-2">
                          <div className="relative top-1">
                            <LightToggleButton item={item} size={18} />
                          </div>
                          <EquipStateIcon
                            tooltip={tooltip}
                            type={item.parent.type}
                            isEquipped={item.isEquipped}
                            gripState={(item as any).grip?.state}
                            toggleEquipState={async () =>
                              await (actor as HeroDataModel).equip(item.parent)
                            }
                          />
                        </div>
                      </td>
                    ) : item.isConsumable &&
                      !(actor as HeroDataModel).polymorph ? (
                      <td className="flex flex-col mt-1.5 items-center">
                        <Tooltip
                          title={appLang.HeroSheet.Inventory.ctxUse}
                          content={appLang.HeroSheet.skills_tooltip}
                        >
                          <UtilityButton
                            onClick={async (e) =>
                              useItem(
                                (actor as any).parent,
                                item.parent,
                                false,
                                e,
                              )
                            }
                          >
                            {appLang.HeroSheet.Inventory.ctxUse}
                          </UtilityButton>
                        </Tooltip>
                      </td>
                    ) : (
                      <td />
                    ))}
                </tr>
              )
            },
          )}
        </tbody>
      </table>
      <ContextMenu />
    </div>
  )
}

const EquipStateIcon = ({
  tooltip,
  type,
  isEquipped,
  gripState,
  toggleEquipState,
}: {
  tooltip: string
  type: string
  isEquipped: boolean
  gripState: string
  toggleEquipState: () => void
}) => {
  const equippedIconStyle = "text-ic-equipped fill-ic-equipped/80"
  const unEquipedIconStyle = "text-ic-equipped"
  return (
    <div
      title={`Toggle equip\n${tooltip}`}
      onClick={(e) => {
        e.stopPropagation()
        toggleEquipState()
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
      }}
    >
      {type === "armor" && (
        <div>
          {isEquipped ? (
            <Shield size={18} className={equippedIconStyle} />
          ) : (
            <Shield size={18} className={unEquipedIconStyle} />
          )}
        </div>
      )}
      {type === "weapon" ? (
        <div>
          {isEquipped ? (
            <div className="flex items-center justify-end font-eskapade text-text-secondary">
              <p className="mr-0.5">{appLang.GripsAbbr[gripState]}</p>
              <HandFist size={18} className={equippedIconStyle} />
            </div>
          ) : (
            <Hand size={18} className={unEquipedIconStyle} />
          )}
        </div>
      ) : (
        <div>
          {type !== "armor" && type !== "weapon" && (
            <>
              {isEquipped ? (
                <HandFist size={18} className={equippedIconStyle} />
              ) : (
                <Hand size={18} className={unEquipedIconStyle} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
