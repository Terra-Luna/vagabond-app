import type { FocusInstance } from "../../model/actor/util/FocusSpellUtil"
import { appLang } from "../../util/lang"
import { getCanvasToken, toTargetDisplayItems } from "../../util/model-util"
import { tableBorder } from "../common/border-styles"

const panToToken = (id: string) => {
  const token = getCanvasToken(id) as any
  if (!token) return
  canvas?.animatePan({ x: token.center.x, y: token.center.y, duration: 250 })
}

/** Upkeep details and the original cast's delivery, shown beneath a spell card in its tooltip. */
export const FocusTooltipFooter = ({
  instances,
  text,
}: {
  instances: FocusInstance[]
  text?: string
}) => (
  <div
    className={`flex flex-col gap-y-2 p-2 text-sm font-paradigm font-normal text-text-primary bg-sheet-main-fill ${tableBorder}`}
  >
    {instances.map((instance, i) => (
      <FocusEntry
        key={instance.id}
        instance={instance}
        text={text}
        index={instances.length > 1 ? i + 1 : undefined}
      />
    ))}
  </div>
)

const FocusEntry = ({
  instance,
  text,
  index,
}: {
  instance: FocusInstance
  text?: string
  index?: number
}) => {
  const delivery = instance.delivery
  const units = (canvas?.scene as any)?.grid?.units || "ft"
  const dims: string[] = []
  if (delivery?.isArea && delivery.size) {
    dims.push(
      `${appLang.Spellcasting.focusTooltipSize}: ${delivery.size} ${units}`,
    )
  }
  if (delivery?.width) {
    dims.push(
      `${appLang.HeroSheet.Magic.labelWidth}: ${delivery.width} ${units}`,
    )
  }
  if (delivery?.height) {
    dims.push(
      `${appLang.HeroSheet.Magic.labelHeight}: ${delivery.height} ${units}`,
    )
  }
  const targets = toTargetDisplayItems(instance.targetIds ?? [])

  return (
    <div className="flex flex-col gap-y-1">
      <span className="font-eskapade font-bold text-base">
        {appLang.Spellcasting.focusUpkeepTooltipTitle}
        {index !== undefined && ` #${index}`}
      </span>
      {text && <span>{text}</span>}
      {delivery && (
        <span>
          <b>{appLang.HeroSheet.Magic.labelDelivery}:</b> {delivery.name}
          {dims.length > 0 && ` (${dims.join(", ")})`}
        </span>
      )}
      {targets.length > 0 && (
        <div className="flex flex-col gap-y-1">
          <b>{appLang.Spellcasting.focusTooltipTargets}:</b>
          <div className="flex flex-wrap gap-1">
            {targets.map((t) => (
              <img
                key={t.id}
                src={t.src}
                className="w-8 h-8 rounded-full object-cover cursor-pointer hover-glow pointer-events-auto"
                onClick={() => panToToken(t.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
