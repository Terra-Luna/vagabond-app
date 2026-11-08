import { Dices } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { HeroAttack } from "../../combat/engine/HeroAttack"
import { PlacedGlyph, type PlacedGlyphData } from "../../combat/spellcasting/aoe/PlacedGlyph"
import { GlyphTrigger } from "../../combat/spellcasting/GlyphTrigger"
import { appLang } from "../../util/lang"
import { tableBorder } from "../../view/common/border-styles"
import { PrimaryButton, SecondaryButton } from "../../view/component/Button"
import { EditModeOptions } from "../../view/context/EditModeContext/EditModeOptions"
import { SpellcastingErrMsg } from "../../view/sheets/actor/hero/tab/component/spellcasting/input/SpellcastingTypography"
import { SpellEffectToggle } from "../../view/sheets/actor/hero/tab/component/spellcasting/input/SpellEffectToggle"
import { SpellFocusToggle } from "../../view/sheets/actor/hero/tab/component/spellcasting/input/SpellFocusToggle"
import { TotalMana } from "../../view/sheets/actor/hero/tab/component/spellcasting/input/TotalMana"
import { EditModeContextProvider } from "../../view/wrappers/EditModeContextProvider"

type Hero = Actor & { system: any }

/**
 * The caster's placed Glyphs, shown by their spell's icon. Clicking one finds it on the canvas; clicking it again
 * asks for the choices that set the Mana cost (damage dice, effect, Focus), then casts it as a Cube.
 */
export const GlyphPanel = ({ hero }: { hero: Hero }) => {
  const glyphs = PlacedGlyph.onScene(hero)
  const [selected, setSelected] = useState(PlacedGlyph.selected)
  const [triggering, setTriggering] = useState<string>()
  const [busy, setBusy] = useState(false)

  useEffect(() => PlacedGlyph.onSelect(setSelected), [])
  // Nothing stays highlighted once the Focus app is closed.
  useEffect(() => () => PlacedGlyph.select(undefined), [])

  const triggered = glyphs.find((glyph) => glyph.id === triggering)

  /** Deleting a Glyph just removes it from the canvas: the mana it cost isn't refunded. */
  const onDelete = async (event: React.MouseEvent, glyph: PlacedGlyphData) => {
    event.preventDefault()
    if (triggering === glyph.id) setTriggering(undefined)
    await PlacedGlyph.remove(hero, glyph.id)
  }

  const onClick = async (glyph: PlacedGlyphData) => {
    if (busy) return
    if (selected !== glyph.id) {
      setTriggering(undefined)
      PlacedGlyph.select(glyph.id)
      await PlacedGlyph.panTo(glyph)
      return
    }
    if (triggering === glyph.id) return
    if (!GlyphTrigger.occupantIds(glyph).length) {
      ui.notifications?.warn(appLang.Spellcasting.glyphNoOccupants)
      return
    }
    setTriggering(glyph.id)
  }

  if (!glyphs.length) return null

  return (
    <div
      className={`flex flex-col gap-y-1 p-1 mt-1 ${tableBorder} bg-context-menu-fill`}
    >
      <p className="text-sm text-text-header-tertiary font-bold">
        {appLang.Spellcasting.glyphs}
      </p>
      <div className="flex flex-wrap gap-1">
        {glyphs.map((glyph) => (
          <img
            key={glyph.id}
            src={glyph.spell.img}
            alt={glyph.spell.name}
            title={glyph.spell.name}
            onClick={() => onClick(glyph)}
            onContextMenu={(event) => onDelete(event, glyph)}
            className={`w-10 h-10 rounded cursor-pointer hover-glow border-2 border-solid ${
              selected === glyph.id
                ? "border-wealth-denom-label"
                : "border-transparent"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-text-tertiary">
        {appLang.Spellcasting.glyphSelectHint}
      </p>
      {triggered && (
        <EditModeContextProvider initialEditMode={EditModeOptions.TRUE}>
          <GlyphTriggerOptions
            hero={hero}
            glyph={triggered}
            busy={busy}
            setBusy={setBusy}
            onDone={() => setTriggering(undefined)}
          />
        </EditModeContextProvider>
      )}
    </div>
  )
}

/** The choices made before a Glyph is cast, as they set its Mana cost: damage dice, effect, and Focus. */
const GlyphTriggerOptions = ({
  hero,
  glyph,
  busy,
  setBusy,
  onDone,
}: {
  hero: Hero
  glyph: PlacedGlyphData
  busy: boolean
  setBusy: (busy: boolean) => void
  onDone: () => void
}) => {
  const hasDamage = glyph.spell.damageType !== "none"
  const [dice, setDice] = useState(hasDamage ? 1 : 0)
  const [effect, setEffect] = useState(false)
  const [focused, setFocused] = useState(false)

  // The Cube it is cast as applies the spell's own limits (e.g. no upcasting), so it decides what is allowed.
  const cube = useMemo(
    () =>
      GlyphTrigger.deliveryFor(
        glyph,
        { ...hero.system.modifiers.casting },
        { dice, effect, focused },
      ),
    [glyph, hero, dice, effect, focused],
  )

  const cast = async (clickEvent?: any) => {
    if (busy) return
    setBusy(true)
    try {
      const sent = await HeroAttack.triggerGlyph(
        hero as any,
        glyph,
        {
          dice: cube.damageDice,
          effect: cube.applyEffect,
          focused: cube.isFocused,
        },
        clickEvent,
      )
      if (sent) onDone()
    }
    finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-y-1 text-text-primary">
      <div className="flex items-center gap-x-2">
        {hasDamage && (
          <label className="flex items-center gap-x-1">
            <Dices size={20} className="text-text-header-tertiary" />
            <input
              type="number"
              min={0}
              value={cube.damageDice}
              onChange={(e) =>
                setDice(Math.max(0, Math.floor(Number(e.target.value) || 0)))
              }
              className={`${tableBorder} font-eskapade font-bold text-xl px-2 py-1 w-[6ch]`}
            />
          </label>
        )}
        <div className="flex-col">
          <SpellEffectToggle
            isEffect={cube.applyEffect}
            onSpellEffectToggle={setEffect}
          />
          <SpellFocusToggle
            isFocused={cube.isFocused}
            onToggleSpellFocus={setFocused}
          />
        </div>
        <div className="ml-auto">
          <TotalMana cost={cube.manaCost} />
        </div>
      </div>
      <SpellcastingErrMsg
        cost={cube.manaCost}
        mana={hero.system.mana.value}
        maxCast={hero.system.mana.maxCast}
      />
      <div className="flex gap-x-1">
        <PrimaryButton onClick={(e) => cast(e)} disabled={busy}>
          {appLang.Spellcasting.glyphCast}
        </PrimaryButton>
        <SecondaryButton onClick={onDone}>
          {appLang.Spellcasting.glyphCancel}
        </SecondaryButton>
      </div>
    </div>
  )
}
