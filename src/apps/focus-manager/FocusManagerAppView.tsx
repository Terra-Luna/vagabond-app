import { useEffect, useState } from "react"

import { PlacedGlyph } from "../../combat/spellcasting/aoe/PlacedGlyph"
import { FocusUpkeep } from "../../combat/spellcasting/FocusUpkeep"
import { type FocusInstance, FocusSpellUtil } from "../../model/actor/util/FocusSpellUtil"
import { tableBorderRounded } from "../../view/common/border-styles"
import { DynamicGrid } from "../../view/component/DynamicGrid"
import { FailedCheckPanel } from "./FailedCheckPanel"
import { resolveFocusPhase } from "./focus-phase"
import { FocusDoneSummary } from "./FocusDoneSummary"
import { FocusSpellCard } from "./FocusSpellCard"
import { GlyphPanel } from "./GlyphPanel"
import { RepeatDamagePanel } from "./RepeatDamagePanel"
import { UpkeepPanel } from "./UpkeepPanel"

type Hero = Actor & { system: any }

export const FocusManagerAppView = ({
  sheet,
  hero,
  round: openedRound,
}: {
  sheet: { close: () => Promise<unknown> }
  hero: Hero
  round: number
}) => {
  const [, refresh] = useState(0)

  useEffect(() => {
    const actorHook = Hooks.on("updateActor", (updated: any) => {
      if (updated.id === hero.id) refresh((n) => n + 1)
    })
    const combatHook = Hooks.on("updateCombat", () => refresh((n) => n + 1))
    return () => {
      Hooks.off("updateActor", actorHook)
      Hooks.off("updateCombat", combatHook)
    }
  }, [hero.id])

  // The window can stay open across rounds, so the round it was opened with may be stale.
  const combat = game.combat as any
  const round = combat?.started ? (combat.round as number) : openedRound

  const dueIds = new Set(
    FocusUpkeep.dueInstances(hero, round).map((it) => it.id),
  )
  const instances = FocusSpellUtil.instances(hero)
  const roundKey = FocusUpkeep.roundKey(round)
  const hasGlyphs = PlacedGlyph.onScene(hero).length > 0

  useEffect(() => {
    if (instances.length === 0 && !hasGlyphs) sheet.close()
  }, [instances.length, hasGlyphs])

  return (
    <div className="bg-sheet-main-fill text-text-header-primary font-eskapade h-full min-h-0 p-1 overflow-y-auto overflow-x-hidden">
      <DynamicGrid widthIncrement={2} itemsStart>
        {instances.map((instance) => (
          <FocusRow
            key={instance.id}
            hero={hero}
            round={round}
            instance={instance}
            phase={resolveFocusPhase({
              isDue: dueIds.has(instance.id),
              needsUpkeep: FocusUpkeep.needsUpkeep(hero, instance),
              paidKey: instance.paidKey,
              failedKey: instance.failedKey,
              roundKey,
            })}
            onDone={() => FocusUpkeep.markDone(hero, instance.id, round)}
          />
        ))}
      </DynamicGrid>
      <GlyphPanel hero={hero} />
    </div>
  )
}

/** One Focused spell, showing whichever step of the round it's at. */
const FocusRow = ({
  hero,
  round,
  instance,
  phase,
  onDone,
}: {
  hero: Hero
  round: number
  instance: FocusInstance
  phase: ReturnType<typeof resolveFocusPhase>
  onDone: () => void
}) => {
  const spellCard = <FocusSpellCard hero={hero} instance={instance} />

  return (
    <div
      className={`flex flex-col gap-y-1 p-1 min-w-0 overflow-hidden ${tableBorderRounded} bg-context-menu-fill`}
    >
      {phase === "done" && (
        <FocusDoneSummary
          round={round}
          instance={instance}
          spellCard={spellCard}
        />
      )}
      {phase === "rescue" && (
        <FailedCheckPanel hero={hero} round={round} instance={instance} />
      )}
      {phase === "upkeep" && (
        <UpkeepPanel
          hero={hero}
          round={round}
          instance={instance}
          spellCard={spellCard}
          onDone={onDone}
        />
      )}
      {phase === "damage" && instance.delivery && (
        <RepeatDamagePanel
          hero={hero}
          round={round}
          instance={instance}
          spellCard={spellCard}
          onDone={onDone}
        />
      )}
    </div>
  )
}
