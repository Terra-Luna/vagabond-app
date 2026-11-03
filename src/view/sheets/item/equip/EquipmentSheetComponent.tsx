import { ActiveEffectsView } from "../../../../apps/active-effects/ActiveEffectsView"
import { getRelicForgeAccess } from "../../../../apps/vagabond-tools/usecase/VagabondSettingsHelper"
import {
  EquipmentDataModel,
  EquipmentSchema,
} from "../../../../model/item/equip/EquipmentDataModel"
import { ItemRulesManager } from "../../../../rules/ItemRulesManager"
import { appLang } from "../../../../util/lang"
import { PrimaryButton } from "../../../component/Button"
import { EditModeOptions } from "../../../context/EditModeContext/EditModeOptions"
import { useEditMode } from "../../../context/EditModeContext/Hooks"
import { EditModeContextProvider } from "../../../wrappers/EditModeContextProvider"
import { Description } from "../../shared/Description"
import { setItemTooltipComponent } from "../../shared/ItemTooltipSheet"
import { BaseItemSheetComponent } from "../shared/BaseItemSheetComponent"
import { Bulk } from "./component/BulkConfig"
import { EquipmentSheetBanner } from "./component/EquipmentSheetBanner"
import { CategorySelection } from "./component/ItemCategorySelectionComponent"
import { ItemValue } from "./component/ItemValueComponent"
import { LightSourceConfig } from "./component/LightSourceConfig"
import { RelicConfig } from "./component/RelicConfig"
import { AlchemicalSheet } from "./sheet/AlchemicalSheet"
import { ArmorSheet } from "./sheet/ArmorSheet"
import { ContainerSheet } from "./sheet/ContainerSheet"
import { StartingPackSheet } from "./sheet/StartingPackSheet"
import { SundrySheet } from "./sheet/SundrySheet"
import { WeaponSheet } from "./sheet/WeaponSheet"

export const EquipmentSheetComponent = ({
  item,
  hideBottomSection = false,
}: {
  item: Item & { system: EquipmentDataModel<EquipmentSchema> }
  hideBottomSection?: boolean
}) => {
  const { isEditMode } = useEditMode()
  const isLocked =
    typeof item.system.isLockedForUser === "function" &&
    item.system.isLockedForUser()

  let sheet: React.ReactElement

  if ((item.type as string) === "alchemical") {
    sheet = <AlchemicalSheet key={item.uuid} item={item as any} />
  }
  else if ((item.type as string) === "armor") {
    sheet = <ArmorSheet key={item.uuid} item={item as any} />
  }
  else if ((item.type as string) === "container") {
    sheet = <ContainerSheet key={item.uuid} item={item as any} />
  }
  else if ((item.type as string) === "startingpack") {
    sheet = <StartingPackSheet key={item.uuid} item={item as any} />
  }
  else if ((item.type as string) === "sundry") {
    sheet = <SundrySheet key={item.uuid} item={item as any} />
  }
  else if ((item.type as string) === "weapon") {
    sheet = <WeaponSheet key={item.uuid} item={item as any} />
  }
  else {
    sheet = <></>
  }

  const sharedContent = !hideBottomSection && (
    <div className="flex flex-wrap justify-between gap-x-8 gap-y-6 w-full mt-1 mb-2">
      <div className="flex flex-col gap-2">
        <Bulk item={item} />
        <LightSourceConfig item={item} />
      </div>
      <div className="space-y-2">
        <ItemValue item={item} />
        <CategorySelection item={item} />
      </div>
    </div>
  )

  const effectsContent = !hideBottomSection && !isLocked && (
    <div className="flex flex-col gap-1 w-full mb-2 @4xl:mt-1">
      <ActiveEffectsView initialDocument={item} />
    </div>
  )

  const rulesContent = isEditMode &&
    !isLocked &&
    (game.user?.isActiveGM || getRelicForgeAccess()) &&
    (item.type as string) !== "alchemical" &&
    (item.type as string) !== "startingpack" && (
      <div className="flex flex-col mb-4">
        <RelicConfig item={item} />
        <ItemRulesManager item={item} />
      </div>
    )

  const hasSecondColumn = !!effectsContent || !!rulesContent

  const isHeroOwned = (item.parent?.type as string) === "hero" && item.isOwner
  const canBind =
    isHeroOwned && item.system.isBoundRelic?.() && !item.system.isBound

  const sheetContent = (
    <BaseItemSheetComponent
      banner={<EquipmentSheetBanner item={item} />}
      description={
        isLocked ? (
          <div className="flex flex-col items-center gap-2 px-4 py-1 text-text-primary text-center italic font-paradigm font-normal">
            <p>{appLang.HeroSheet.Inventory.relicBindingLocked}</p>
            {canBind && <BindButton item={item} />}
          </div>
        ) : (
          <>
            {(item.type as string) !== "startingpack" && (
              <Description item={item} showFullView={true} italic={false} />
            )}
          </>
        )
      }
      bodyClassName="text-text-primary bg-sheet-main-fill rounded-b-md px-4 w-full"
      body={
        <div className="@container w-full">
          <div
            className={`grid grid-cols-1 gap-x-6 ${hasSecondColumn ? "@lg:grid-cols-2" : ""}`}
          >
            <div className="min-w-0">
              {sheet}
              {sharedContent}
            </div>
            {hasSecondColumn && (
              <div className="min-w-0">
                {effectsContent}
                {rulesContent}
              </div>
            )}
          </div>
          {!isLocked && canBind && (
            <div className="flex justify-center mb-4">
              <BindButton item={item} />
            </div>
          )}
        </div>
      }
    />
  )

  return isLocked ? (
    <EditModeContextProvider initialEditMode={EditModeOptions.NEVER}>
      {sheetContent}
    </EditModeContextProvider>
  ) : (
    sheetContent
  )
}

const BindButton = ({
  item,
}: {
  item: Item & { system: EquipmentDataModel<EquipmentSchema> }
}) => {
  const strings = appLang.HeroSheet.Inventory
  const isPending = item.system.isBindRequestPending
  return (
    <PrimaryButton
      disabled={isPending}
      onClick={() => item.system.toggleBound()}
    >
      {isPending ? strings.bindRequestPending : strings.bindToRelic}
    </PrimaryButton>
  )
}

setItemTooltipComponent(EquipmentSheetComponent)
