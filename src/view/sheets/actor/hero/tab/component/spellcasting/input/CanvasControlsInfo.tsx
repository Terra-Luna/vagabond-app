import { Info } from "lucide-react"

import { Aura, Cone, Cube, Glyph, Line, type SpellDelivery, Sphere } from "../../../../../../../../combat/spellcasting/SpellDelivery"
import { appLang } from "../../../../../../../../util/lang"
import { Tooltip } from "../../../../../../../component/Tooltip"

const controls = appLang.Spellcasting

/** How to aim the delivery's area on the canvas, or undefined when it has none. */
const controlsFor = (delivery: SpellDelivery | undefined) => {
  if (delivery instanceof Aura)
    return [controls.canvasControlsFollowAura, controls.canvasControlsResize]
  if (delivery instanceof Cone)
    return [
      controls.canvasControlsFollowCone,
      controls.canvasControlsResize,
      controls.canvasControlsRotateToken,
    ]
  if (delivery instanceof Sphere)
    return [controls.canvasControlsPin, controls.canvasControlsResize]
  if (delivery instanceof Line)
    return [
      controls.canvasControlsPin,
      controls.canvasControlsLength,
      controls.canvasControlsWidth,
      controls.canvasControlsRotate,
    ]
  if (delivery instanceof Cube) return [controls.canvasControlsPlaceCube]
  if (delivery instanceof Glyph) return [controls.canvasControlsPlaceGlyph]
  return undefined
}

/** A yellow info icon explaining the canvas controls of an area delivery. */
export const CanvasControlsInfo = ({
  delivery,
}: {
  delivery: SpellDelivery | undefined
}) => {
  const lines = controlsFor(delivery)
  if (!lines) return null
  return (
    <Tooltip
      title={controls.canvasControlsTitle}
      content={[...lines, controls.canvasControlsToggle].join("<br>")}
      maxWidth="260px"
    >
      <Info size={14} strokeWidth={3} className="text-text-header-tertiary" />
    </Tooltip>
  )
}
